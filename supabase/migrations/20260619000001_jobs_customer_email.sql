ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS customer_email text;
UPDATE public.jobs j SET customer_email = q.email FROM public.quotes q WHERE j.quote_id = q.id AND j.customer_email IS NULL;
