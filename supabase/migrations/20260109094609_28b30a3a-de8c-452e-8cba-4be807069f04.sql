-- Fjern eksisterende SELECT-policies som tillater for bred tilgang
DROP POLICY IF EXISTS "Anyone can insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins can view all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins can update all quotes" ON public.quotes;

-- Policy 1: Tillat anonym INSERT (for uregistrerte kunder)
CREATE POLICY "Anyone can insert quotes"
ON public.quotes
FOR INSERT
WITH CHECK (true);

-- Policy 2: Kun admin kan lese alle quotes
CREATE POLICY "Admins can view all quotes"
ON public.quotes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy 3: Kun admin kan oppdatere quotes
CREATE POLICY "Admins can update all quotes"
ON public.quotes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy 4: Innloggede brukere kan se EGNE quotes (for dashboard)
CREATE POLICY "Users can view their own quotes"
ON public.quotes
FOR SELECT
USING (auth.uid() = user_id AND user_id IS NOT NULL);