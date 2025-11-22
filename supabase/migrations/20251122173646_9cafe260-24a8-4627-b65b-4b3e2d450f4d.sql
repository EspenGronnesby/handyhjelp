-- Add started_at timestamp to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- Update job status values to use consistent naming
-- Note: This doesn't change existing data, just ensures new entries use correct values
COMMENT ON COLUMN public.jobs.status IS 'Job status: pending, in_progress, completed';

-- Add index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);