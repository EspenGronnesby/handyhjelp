-- Make job_id and user_id nullable to support general feedback
ALTER TABLE public.reviews 
  ALTER COLUMN job_id DROP NOT NULL,
  ALTER COLUMN user_id DROP NOT NULL;

-- Add columns for general feedback
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS feedback_type text DEFAULT 'review';

-- Migrate existing data from general_feedback to reviews
INSERT INTO public.reviews (rating, comment, status, created_at, approved_at, approved_by, customer_name, customer_email, feedback_type)
SELECT 
  rating, 
  comment, 
  status, 
  created_at, 
  approved_at, 
  approved_by, 
  name as customer_name, 
  email as customer_email,
  'general' as feedback_type
FROM public.general_feedback;

-- Update RLS policy to allow anyone to insert reviews (for general feedback)
DROP POLICY IF EXISTS "Users can create reviews for their jobs" ON public.reviews;

CREATE POLICY "Anyone can submit reviews" 
  ON public.reviews FOR INSERT 
  WITH CHECK (true);

-- Create index for feedback_type
CREATE INDEX IF NOT EXISTS idx_reviews_feedback_type ON public.reviews(feedback_type);