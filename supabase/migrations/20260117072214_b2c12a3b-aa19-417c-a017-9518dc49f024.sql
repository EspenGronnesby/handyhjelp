-- Create email_templates table for storing reusable email templates
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  include_feedback_button boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_logs table for logging all sent emails
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text,
  recipient_user_id uuid,
  recipient_type text NOT NULL DEFAULT 'external' CHECK (recipient_type IN ('customer', 'external')),
  subject text NOT NULL,
  content text NOT NULL,
  template_id uuid REFERENCES public.email_templates(id) ON DELETE SET NULL,
  template_name text,
  included_feedback_button boolean DEFAULT false,
  sender_user_id uuid NOT NULL REFERENCES auth.users(id),
  sender_name text,
  sender_role text,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error_message text,
  batch_id uuid
);

-- Enable RLS on both tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_templates - only admin and platform_owner can access
CREATE POLICY "Admin and owner can view email templates"
  ON public.email_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'platform_owner')
    )
  );

CREATE POLICY "Admin and owner can create email templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'platform_owner')
    )
  );

CREATE POLICY "Admin and owner can update email templates"
  ON public.email_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'platform_owner')
    )
  );

CREATE POLICY "Admin and owner can delete email templates"
  ON public.email_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'platform_owner')
    )
  );

-- RLS policies for email_logs - only admin and platform_owner can access
CREATE POLICY "Admin and owner can view email logs"
  ON public.email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'platform_owner')
    )
  );

CREATE POLICY "Admin and owner can create email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'platform_owner')
    )
  );

-- Create updated_at trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_batch_id ON public.email_logs(batch_id);
CREATE INDEX idx_email_logs_recipient_type ON public.email_logs(recipient_type);
CREATE INDEX idx_email_templates_created_at ON public.email_templates(created_at DESC);