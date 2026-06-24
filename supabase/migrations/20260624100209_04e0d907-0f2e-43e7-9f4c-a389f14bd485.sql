
-- profiles: prevent tenant_id self-reassignment
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND tenant_id IS NOT DISTINCT FROM (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- jobs: prevent customers from changing status/amount on their own jobs
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
CREATE POLICY "Users can update their own jobs" ON public.jobs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status IS NOT DISTINCT FROM (SELECT j.status FROM public.jobs j WHERE j.id = jobs.id)
  AND amount IS NOT DISTINCT FROM (SELECT j.amount FROM public.jobs j WHERE j.id = jobs.id)
);

-- reviews: lock down sensitive fields on user insert/update
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews" ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND approved_at IS NULL
  AND approved_by IS NULL
  AND is_verified_customer = false
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
);

-- user_roles: prevent tenant_admin self-assignment of worker role
DROP POLICY IF EXISTS "Tenant admins can assign worker roles" ON public.user_roles;
CREATE POLICY "Tenant admins can assign worker roles" ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'tenant_admin'::app_role)
  AND role = 'worker'::app_role
  AND user_id <> auth.uid()
  AND user_id IN (
    SELECT profiles.id
    FROM public.profiles
    WHERE profiles.tenant_id = get_user_tenant_id(auth.uid())
  )
);

-- storage: platform_owner SELECT on agreement-documents
CREATE POLICY "Platform owners can view all agreement documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'agreement-documents'
  AND has_role(auth.uid(), 'platform_owner'::app_role)
);

-- storage: admin + platform_owner SELECT on invoices
CREATE POLICY "Admins can view all invoice files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'invoices'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Platform owners can view all invoice files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'invoices'
  AND has_role(auth.uid(), 'platform_owner'::app_role)
);
