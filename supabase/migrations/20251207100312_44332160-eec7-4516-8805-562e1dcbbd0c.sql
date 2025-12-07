-- Drop the existing insert policy and recreate with explicit anon and authenticated access
DROP POLICY IF EXISTS "Anyone can insert quotes" ON public.quotes;

CREATE POLICY "Anyone can insert quotes" 
ON public.quotes 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);