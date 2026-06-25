-- Drop existing open policies on realtime.messages
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy WHERE polrelid = 'realtime.messages'::regclass
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON realtime.messages', pol.polname);
  END LOOP;
END $$;

-- Ensure RLS is on
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Only platform owners and admins can read realtime broadcast/presence messages
CREATE POLICY "Admins can read realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'platform_owner'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Only platform owners and admins can send realtime broadcast/presence messages
CREATE POLICY "Admins can send realtime messages"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'platform_owner'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);