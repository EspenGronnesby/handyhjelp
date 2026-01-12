-- Add rejected_at column to track when agreements were rejected
ALTER TABLE public.service_agreements 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Set rejected_at for existing rejected agreements
UPDATE public.service_agreements 
SET rejected_at = updated_at 
WHERE status = 'rejected' AND rejected_at IS NULL;