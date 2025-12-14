-- Add status and approval fields to reviews table for moderation
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id);

-- Add feedback_sent_at to jobs table to track when review request was sent
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS feedback_sent_at timestamp with time zone;

-- Create index for finding jobs that need feedback emails
CREATE INDEX IF NOT EXISTS idx_jobs_feedback_pending ON public.jobs (completed_date, feedback_sent_at) WHERE status = 'completed';

-- Update RLS policies for reviews to allow admin to update status
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anyone to view approved reviews (for testimonials on website)
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');