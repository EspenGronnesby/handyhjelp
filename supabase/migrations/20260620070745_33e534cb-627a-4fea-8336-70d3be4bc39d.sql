
-- ============================================================
-- Security hardening migration
-- ============================================================

-- 1) jobs: remove overly permissive INSERT policy targeting public role
DROP POLICY IF EXISTS "Service role can create jobs" ON public.jobs;

-- 2) activity_logs: replace WITH CHECK (true) with ownership check
DROP POLICY IF EXISTS "Authenticated users can create activity logs" ON public.activity_logs;
CREATE POLICY "Users can create their own activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- 3) Storage: tighten blog-images and project-images upload to workers/admins/owners
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;

CREATE POLICY "Workers and admins can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'platform_owner'::app_role)
    OR public.has_role(auth.uid(), 'worker'::app_role)
  )
);

CREATE POLICY "Workers and admins can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'platform_owner'::app_role)
    OR public.has_role(auth.uid(), 'worker'::app_role)
  )
);

-- 4) Storage: remove SELECT policies on public buckets to prevent listing.
--    Files in public buckets are still served via the public CDN endpoint
--    without RLS checks; only object listing requires SELECT on storage.objects.
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view hero images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view site images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view team images" ON storage.objects;

-- 5) SECURITY DEFINER functions: revoke broad EXECUTE; grant only what is needed.
-- Helper functions used in RLS policies must remain executable by authenticated.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_access_tenant(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_support_access(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_tenant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_support_access(uuid, uuid) TO authenticated;

-- Privileged data-modifying functions: server-side only (service_role).
REVOKE EXECUTE ON FUNCTION public.award_points(uuid, integer, transaction_type, text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_old_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_download_token(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_download_token(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit(uuid, text, text, uuid, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_active_campaign_multiplier() FROM PUBLIC, anon;

-- Trigger-only functions: not callable directly.
REVOKE EXECUTE ON FUNCTION public.award_welcome_bonus_trigger() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_and_update_tier() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_loyalty_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
