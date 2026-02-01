-- FIX: Block anonymous users from reading service agreements
-- This protects sensitive customer business information from being exposed
-- Anonymous INSERT is still allowed for public form submissions

-- Add explicit DENY policy for anonymous SELECT access
CREATE POLICY "Block anonymous read access to service_agreements"
  ON public.service_agreements
  FOR SELECT
  TO anon
  USING (false);

-- Note: Existing policies remain intact:
-- - "Users can view their own agreements" (auth.uid() = user_id)
-- - "Platform owners can manage all agreements" 
-- - "Tenant admins can manage their tenant agreements"
-- - "Anyone can insert agreements" (public form submission)