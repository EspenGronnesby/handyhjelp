-- Remove the overly permissive policy that allows users to view all reviews
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;