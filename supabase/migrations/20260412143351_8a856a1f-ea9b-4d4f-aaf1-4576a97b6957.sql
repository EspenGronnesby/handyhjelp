
-- Fix 1: Reviews table - allow authenticated users to view their own reviews
-- Admins/owners/tenant_admins already have access via existing FOR ALL policies

DROP POLICY IF EXISTS "Authenticated users can view own reviews and admins view all" ON public.reviews;

CREATE POLICY "Authenticated users can view own reviews and admins view all"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'platform_owner'::app_role)
  OR (has_role(auth.uid(), 'tenant_admin'::app_role) AND tenant_id = get_user_tenant_id(auth.uid()))
);

-- Add index for user_id lookups (used by the RLS policy above)
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Fix 2: Storage - replace overly permissive delete policies with role-checked ones

DROP POLICY IF EXISTS "Users can delete own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project images" ON storage.objects;

CREATE POLICY "Admins and workers can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'platform_owner'::app_role)
    OR has_role(auth.uid(), 'worker'::app_role)
  )
);

CREATE POLICY "Admins and workers can delete project images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'platform_owner'::app_role)
    OR has_role(auth.uid(), 'worker'::app_role)
  )
);
