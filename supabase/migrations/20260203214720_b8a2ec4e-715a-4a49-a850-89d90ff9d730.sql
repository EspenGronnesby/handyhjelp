-- Add source and company info columns to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'website',
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS org_number text,
ADD COLUMN IF NOT EXISTS is_verified_customer boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.reviews.source IS 'Kilde: website, google, manual';
COMMENT ON COLUMN public.reviews.company_name IS 'Bedriftsnavn fra Brønnøysund eller manuelt';
COMMENT ON COLUMN public.reviews.org_number IS 'Organisasjonsnummer for bedrifter';
COMMENT ON COLUMN public.reviews.is_verified_customer IS 'Om kunden er verifisert (f.eks. fra jobb vi har utført)';

-- Update the public_reviews view to include new columns
DROP VIEW IF EXISTS public.public_reviews;
CREATE VIEW public.public_reviews AS
SELECT 
  id,
  job_id,
  rating,
  comment,
  status,
  created_at,
  feedback_type,
  customer_name,
  source,
  company_name,
  is_verified_customer
FROM public.reviews
WHERE status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.public_reviews TO anon, authenticated;