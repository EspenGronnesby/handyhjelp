-- Fix quotes table security issue: Make user_id NOT NULL and update RLS policy

-- First, update the RLS policy to remove the NULL check
DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;

CREATE POLICY "Users can view their own quotes"
ON public.quotes
FOR SELECT
USING (auth.uid() = user_id);

-- Make user_id NOT NULL (safe since we verified there are no NULL values)
ALTER TABLE public.quotes 
ALTER COLUMN user_id SET NOT NULL;

-- Add a comment explaining the security requirement
COMMENT ON COLUMN public.quotes.user_id IS 'User ID is required for all quotes to ensure proper data isolation and security';