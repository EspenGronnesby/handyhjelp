-- Fix: Security Definer View issue
-- The view was created with default SECURITY DEFINER, need to change to SECURITY INVOKER

-- Drop and recreate the view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews 
WITH (security_invoker = true) AS
SELECT 
  id,
  job_id,
  rating,
  comment,
  customer_name,
  feedback_type,
  status,
  created_at
FROM public.reviews
WHERE status = 'approved';

-- Re-grant SELECT permissions
GRANT SELECT ON public.public_reviews TO anon;
GRANT SELECT ON public.public_reviews TO authenticated;