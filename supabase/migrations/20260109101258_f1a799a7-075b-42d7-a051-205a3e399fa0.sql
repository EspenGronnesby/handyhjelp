-- Create quick_feedback table for one-click email feedback
CREATE TABLE public.quick_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('happy', 'neutral', 'sad')),
  token TEXT NOT NULL UNIQUE,
  token_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE public.quick_feedback ENABLE ROW LEVEL SECURITY;

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.quick_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for token lookups
CREATE INDEX idx_quick_feedback_token ON public.quick_feedback(token);

-- Create index for job lookups
CREATE INDEX idx_quick_feedback_job_id ON public.quick_feedback(job_id);