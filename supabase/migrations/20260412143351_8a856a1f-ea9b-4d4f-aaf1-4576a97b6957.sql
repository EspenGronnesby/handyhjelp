
-- Fix 1: Reviews table - add restrictive SELECT policy for regular authenticated users
-- Currently any authenticated user can read ALL reviews including PII.
-- Add a policy that limits non-admin authenticated users to only approved reviews without PII.
-- The public_reviews view already strips PII, so we restrict direct table access.

-- Drop the overly broad "Anyone can submit reviews" INSERT if it allows anon reads indirectly
-- Actually the issue is there's no SELECT restriction for authenticated non-admin users.
-- We need to ensure regular authenticated users can only see their own reviews.

CREATE POLICY "Authenticated users can only view their own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'platform_owner'::app_role)
  OR (has_role(auth.uid(), 'tenant_admin'::app_role) AND tenant_id = get_user_tenant_id(auth.uid()))
);

-- Fix 2: Storage - fix DELETE policies for blog-images and project-images
-- Drop existing overly permissive delete policies and recreate with role checks

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
