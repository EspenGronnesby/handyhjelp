-- Facebook-synk: external_id brukes til å deduplisere anmeldelser hentet fra
-- eksterne kilder (Graph API), slik at samme anmeldelse ikke importeres to ganger.
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS external_id text;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_external_id_key
  ON public.reviews (external_id);

COMMENT ON COLUMN public.reviews.external_id IS 'Ekstern ID for synkede anmeldelser (f.eks. Facebook) - brukes til deduplisering';
COMMENT ON COLUMN public.reviews.source IS 'Kilde: website, google, facebook, manual';

-- Sikkerhet: external_id er reservert for synk (service role). Vanlige brukere
-- skal ikke kunne sette den - ellers kunne en bruker "okkupere" en ekte
-- Facebook-anmeldelses ID og blokkere importen av den.
DROP POLICY IF EXISTS "Anonymous can submit reviews" ON public.reviews;
CREATE POLICY "Anonymous can submit reviews"
ON public.reviews
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND status = 'pending'
  AND approved_at IS NULL
  AND approved_by IS NULL
  AND external_id IS NULL
  AND rating BETWEEN 1 AND 5
  AND coalesce(length(customer_name), 0) <= 200
  AND coalesce(length(customer_email), 0) <= 320
  AND coalesce(length(company_name), 0) <= 200
  AND coalesce(length(org_number), 0) <= 32
  AND coalesce(length(comment), 0) <= 5000
  AND (customer_email IS NULL OR customer_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews" ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND approved_at IS NULL
  AND approved_by IS NULL
  AND is_verified_customer = false
  AND external_id IS NULL
);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND approved_at IS NULL
  AND approved_by IS NULL
  AND is_verified_customer = false
  AND external_id IS NULL
);
