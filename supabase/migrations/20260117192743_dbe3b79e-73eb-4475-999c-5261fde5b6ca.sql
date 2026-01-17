-- Create general_feedback table for feedback from /tilbakemelding page
CREATE TABLE public.general_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  name text,
  email text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES public.profiles(id),
  rejection_reason text
);

-- Enable Row Level Security
ALTER TABLE public.general_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert general feedback (public form)
CREATE POLICY "Anyone can insert general feedback"
  ON public.general_feedback FOR INSERT
  WITH CHECK (true);

-- Admins can view all general feedback
CREATE POLICY "Admins can view general feedback"
  ON public.general_feedback FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update general feedback
CREATE POLICY "Admins can update general feedback"
  ON public.general_feedback FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete general feedback
CREATE POLICY "Admins can delete general feedback"
  ON public.general_feedback FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Platform owners can view all general feedback
CREATE POLICY "Platform owners can view general feedback"
  ON public.general_feedback FOR SELECT
  USING (has_role(auth.uid(), 'platform_owner'::app_role));

-- Platform owners can update general feedback
CREATE POLICY "Platform owners can update general feedback"
  ON public.general_feedback FOR UPDATE
  USING (has_role(auth.uid(), 'platform_owner'::app_role));

-- Platform owners can delete general feedback
CREATE POLICY "Platform owners can delete general feedback"
  ON public.general_feedback FOR DELETE
  USING (has_role(auth.uid(), 'platform_owner'::app_role));

-- Create index for faster queries
CREATE INDEX idx_general_feedback_status ON public.general_feedback(status);
CREATE INDEX idx_general_feedback_created_at ON public.general_feedback(created_at DESC);