-- 1) activity_logs INSERT: enforce user_role matches caller's real role,
-- restrict who can target other users, and cap text lengths.
DROP POLICY IF EXISTS "Users can create their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can create their own activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    user_role = 'user'
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text = activity_logs.user_role
    )
  )
  AND (
    target_user_id IS NULL
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'platform_owner'::app_role)
  )
  AND length(description) BETWEEN 1 AND 1000
  AND length(action_type) BETWEEN 1 AND 100
  AND length(action_category) BETWEEN 1 AND 100
);

-- 2) reviews: replace permissive anon insert with a strict, validated policy.
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.reviews;
CREATE POLICY "Anonymous can submit reviews"
ON public.reviews
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND status = 'pending'
  AND approved_at IS NULL
  AND approved_by IS NULL
  AND rating BETWEEN 1 AND 5
  AND coalesce(length(customer_name), 0) <= 200
  AND coalesce(length(customer_email), 0) <= 320
  AND coalesce(length(company_name), 0) <= 200
  AND coalesce(length(org_number), 0) <= 32
  AND coalesce(length(comment), 0) <= 5000
  AND (customer_email IS NULL OR customer_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

-- 3) Storage: stop allowing anyone to LIST files in the client-logos bucket.
-- Direct URL access still works because the bucket is public on storage.buckets.
DROP POLICY IF EXISTS "Public can view client logos" ON storage.objects;