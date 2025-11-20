-- Create email_logs table for tracking all sent emails
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked', 'delivery_delayed', 'complained')),
  recipient TEXT NOT NULL,
  subject TEXT,
  from_email TEXT DEFAULT 'team@handyhjelp.no',
  created_at TIMESTAMPTZ DEFAULT now(),
  resend_created_at TIMESTAMPTZ,
  metadata JSONB,
  related_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  related_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  error_message TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX idx_email_logs_event_type ON email_logs(event_type);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_quote_id ON email_logs(related_quote_id);
CREATE INDEX idx_email_logs_job_id ON email_logs(related_job_id);
CREATE INDEX idx_email_logs_email_id ON email_logs(email_id);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view email logs
CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for the email_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;