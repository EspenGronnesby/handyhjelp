-- Fix: Customer Email and Name Exposure in Reviews Table
-- Problem: The current "Anyone can view approved reviews" policy exposes customer_email and customer_name fields publicly
-- Solution: Remove the public SELECT policy and replace with one that excludes sensitive PII

-- Step 1: Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;

-- Step 2: Create a new policy that only allows public access to non-sensitive data
-- For public display (testimonials), we use a database view instead that excludes PII
-- Meanwhile, authenticated admins/owners can still see full data

-- Create a secure view for public testimonials (excludes email)
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  id,
  job_id,
  rating,
  comment,
  customer_name, -- Name can be shown for testimonials, but NOT email
  feedback_type,
  status,
  created_at
FROM public.reviews
WHERE status = 'approved';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_reviews TO anon;
GRANT SELECT ON public.public_reviews TO authenticated;

-- Step 3: Add back a restricted SELECT policy for the reviews table
-- Only admins, platform owners, and owners of the review can see full data
CREATE POLICY "Admins can view all reviews" 
ON public.reviews 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Note: Platform owners already have an ALL policy, so they can see everything
-- Note: Users can already update their own reviews via existing policy