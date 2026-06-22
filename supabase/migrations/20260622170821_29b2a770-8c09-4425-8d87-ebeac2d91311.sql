
-- 1. Set search_path on functions that were missing it
ALTER FUNCTION public.log_new_quote() SET search_path = public;
ALTER FUNCTION public.log_new_agreement() SET search_path = public;
ALTER FUNCTION public.log_new_review() SET search_path = public;
ALTER FUNCTION public.notify_owners_on_activity() SET search_path = public;
ALTER FUNCTION public.notify_admins_on_activity() SET search_path = public;

-- 2. Enable RLS on realtime.messages and restrict to authenticated users
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive realtime messages" ON realtime.messages;
CREATE POLICY "Authenticated users can receive realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can send realtime messages" ON realtime.messages;
CREATE POLICY "Authenticated users can send realtime messages"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);
