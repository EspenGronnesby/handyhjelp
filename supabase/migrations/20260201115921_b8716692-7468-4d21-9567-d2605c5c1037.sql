-- FIX 1: Remove public SELECT policy on reviews table that exposes customer_email
-- The public_reviews view already exists and excludes email - use that for public access instead
DROP POLICY IF EXISTS "Public can view approved reviews without email" ON public.reviews;

-- FIX 2: Fix referral_codes table - remove overly permissive public read policy
-- Replace with a more restrictive policy that only allows:
-- 1. Users to view their own referral code
-- 2. Authenticated users to validate a specific code (via edge function with service role)
DROP POLICY IF EXISTS "Anyone can view referral codes for validation" ON public.referral_codes;

-- Keep the existing "Users can view own referral code" policy (already exists)
-- Add a policy that allows users to insert their own referral code
CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_user_id);

-- Add a policy that allows users to delete their own referral code (for regeneration)
CREATE POLICY "Users can delete own referral code"
  ON public.referral_codes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = referrer_user_id);