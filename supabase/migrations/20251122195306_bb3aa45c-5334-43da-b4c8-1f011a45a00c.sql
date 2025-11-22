-- Update quotes table status check constraint to allow all job statuses
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_status_check 
  CHECK (status IN ('pending', 'in_progress', 'completed'));

-- Update jobs table status check constraint to allow all job statuses
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('confirmed', 'in_progress', 'completed'));