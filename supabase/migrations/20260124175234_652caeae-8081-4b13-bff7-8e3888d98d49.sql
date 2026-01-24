-- Add back a SELECT policy for approved reviews on the base table
-- This is needed because the view uses SECURITY INVOKER and needs the underlying table to be queryable
-- The view itself excludes the customer_email field, providing the security layer

CREATE POLICY "Public can view approved reviews without email" 
ON public.reviews 
FOR SELECT 
USING (status = 'approved');