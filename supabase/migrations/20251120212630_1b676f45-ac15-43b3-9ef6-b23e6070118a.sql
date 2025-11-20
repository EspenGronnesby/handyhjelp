-- Add org_number and company_name to profiles table for business customers
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS org_number TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT;