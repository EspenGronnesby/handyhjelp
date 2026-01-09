-- Add rejection_reason column to service_agreements
ALTER TABLE public.service_agreements 
ADD COLUMN IF NOT EXISTS rejection_reason text;