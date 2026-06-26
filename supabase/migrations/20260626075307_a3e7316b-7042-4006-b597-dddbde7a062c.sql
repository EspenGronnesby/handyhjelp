
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL CHECK (event_type IN ('pageview','conversion','cta_click')),
  event_name text NOT NULL,
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  device text CHECK (device IS NULL OR device IN ('mobile','tablet','desktop')),
  session_id text,
  user_id uuid,
  related_quote_id uuid,
  related_agreement_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins and owners can read analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_owner') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_analytics_events_occurred_at ON public.analytics_events (occurred_at DESC);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events (event_type);
CREATE INDEX idx_analytics_events_path ON public.analytics_events (path);
CREATE INDEX idx_analytics_events_session ON public.analytics_events (session_id);
CREATE INDEX idx_analytics_events_type_time ON public.analytics_events (event_type, occurred_at DESC);
