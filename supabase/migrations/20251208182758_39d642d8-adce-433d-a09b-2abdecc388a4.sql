-- Add user_id to service_agreements for linking to logged-in users
ALTER TABLE public.service_agreements ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create RLS policy for users to view their own agreements
CREATE POLICY "Users can view their own agreements" 
ON public.service_agreements 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_service_agreements_user_id ON public.service_agreements(user_id);