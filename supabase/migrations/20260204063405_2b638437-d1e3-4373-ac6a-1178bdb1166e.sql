
-- Fix 1: Recreate public_reviews view with SECURITY INVOKER
-- This ensures the view respects RLS policies of the querying user
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews
WITH (security_invoker = true)
AS
SELECT 
    id,
    job_id,
    rating,
    comment,
    status,
    created_at,
    feedback_type,
    customer_name,
    source,
    company_name,
    is_verified_customer
FROM public.reviews
WHERE status = 'approved';

-- Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON public.public_reviews TO authenticated;
GRANT SELECT ON public.public_reviews TO anon;

COMMENT ON VIEW public.public_reviews IS 'Public view of approved reviews for display on the website. Uses SECURITY INVOKER to respect RLS policies.';

-- Fix 2: Add explicit block policy for anonymous users on profiles table
-- This ensures anonymous users cannot query the profiles table
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Fix 3: Add explicit block policy for anonymous users on quotes table  
-- This ensures anonymous users cannot query other people's quotes
CREATE POLICY "Block anonymous read access to quotes"
ON public.quotes
FOR SELECT
TO anon
USING (false);

-- Add admin view policy for quotes (admins should be able to view all quotes)
CREATE POLICY "Admins can view all quotes"
ON public.quotes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
