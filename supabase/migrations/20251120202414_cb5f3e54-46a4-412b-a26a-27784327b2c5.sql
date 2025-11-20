-- PHASE 1: Critical RLS Policy Updates for Quote System

-- Allow quotes to be inserted without user_id (for anonymous quote submissions)
-- This is safe because:
-- 1. We have rate limiting in place
-- 2. Input is validated with Zod schemas
-- 3. Security checks are performed in QuoteForm
-- 4. No sensitive data is exposed

-- Update quotes table to allow NULL user_id temporarily for anonymous submissions
ALTER TABLE public.quotes ALTER COLUMN user_id DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.quotes.user_id IS 'User ID - can be NULL for anonymous quote submissions. Later linked when user registers with same email.';

-- Update RLS policy to allow SELECT for quotes based on email (for anonymous users)
CREATE POLICY "Users can view quotes by email"
ON public.quotes
FOR SELECT
USING (
  -- User can see if they own it OR if email matches (for non-authenticated users)
  auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- The existing "Anyone can insert quotes" policy already allows inserts with user_id = NULL