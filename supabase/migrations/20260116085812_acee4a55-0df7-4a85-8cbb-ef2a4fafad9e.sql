-- Opprett ny tabell for aktivitetslogging
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role text NOT NULL,
  user_name text,
  action_type text NOT NULL,
  action_category text NOT NULL,
  description text NOT NULL,
  target_user_id uuid,
  target_user_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indekser for filtrering
CREATE INDEX idx_activity_logs_user_role ON activity_logs(user_role);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_action_category ON activity_logs(action_category);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Kun platform_owner kan se alle logger
CREATE POLICY "Platform owner can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'platform_owner')
  );

-- Alle autentiserte kan opprette logger
CREATE POLICY "Authenticated users can create activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);