-- ============================================================
-- MIGRATION 3: RLS Policies for multi-tenant system
-- ============================================================

-- ============================================================
-- POLICIES FOR TENANTS TABLE
-- ============================================================
CREATE POLICY "Platform owners can manage all tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Users can view their own tenant"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  id = public.get_user_tenant_id(auth.uid())
);

-- ============================================================
-- POLICIES FOR AUDIT_LOGS TABLE
-- ============================================================
CREATE POLICY "Platform owners can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can view their tenant audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- POLICIES FOR SUPPORT_ACCESS TABLE
-- ============================================================
CREATE POLICY "Platform owners can manage all support access"
ON public.support_access
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can manage support access for their tenant"
ON public.support_access
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

-- ============================================================
-- UPDATE EXISTING POLICIES FOR SITE EDITING (PLATFORM_OWNER ONLY)
-- ============================================================

-- site_content: Only platform_owner can edit
DROP POLICY IF EXISTS "Only admins can edit site content" ON public.site_content;
CREATE POLICY "Only platform_owner can edit site content"
ON public.site_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

-- site_colors: Only platform_owner can edit
DROP POLICY IF EXISTS "Only admins can edit site colors" ON public.site_colors;
CREATE POLICY "Only platform_owner can edit site colors"
ON public.site_colors
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

-- hero_images: Only platform_owner can manage
DROP POLICY IF EXISTS "Admins can delete hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Admins can insert hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Admins can update hero images" ON public.hero_images;

CREATE POLICY "Platform owners can manage hero images"
ON public.hero_images
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

-- ============================================================
-- UPDATE BLOG_POSTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can view all blog posts" ON public.blog_posts;

CREATE POLICY "Platform owners can manage all blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can manage their tenant blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

CREATE POLICY "Workers can view blog posts in their tenant"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'worker') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

CREATE POLICY "Workers can insert draft blog posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'worker') AND
  tenant_id = public.get_user_tenant_id(auth.uid()) AND
  status = 'draft'
);

CREATE POLICY "Workers can update their own drafts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'worker') AND
  tenant_id = public.get_user_tenant_id(auth.uid()) AND
  submitted_by = auth.uid() AND
  status IN ('draft', 'rejected')
);

-- ============================================================
-- UPDATE PROJECTS POLICIES
-- ============================================================
CREATE POLICY "Platform owners can manage all projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can manage their tenant projects"
ON public.projects
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

CREATE POLICY "Workers can view projects in their tenant"
ON public.projects
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'worker') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

CREATE POLICY "Workers can insert draft projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'worker') AND
  tenant_id = public.get_user_tenant_id(auth.uid()) AND
  status = 'draft'
);

CREATE POLICY "Workers can update their own draft projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'worker') AND
  tenant_id = public.get_user_tenant_id(auth.uid()) AND
  submitted_by = auth.uid() AND
  status IN ('draft', 'rejected')
);

-- ============================================================
-- UPDATE QUOTES POLICIES (TENANT ISOLATION)
-- ============================================================
DROP POLICY IF EXISTS "Admins can update all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins can view all quotes" ON public.quotes;

CREATE POLICY "Platform owners can manage all quotes"
ON public.quotes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can manage their tenant quotes"
ON public.quotes
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

-- ============================================================
-- UPDATE JOBS POLICIES (TENANT ISOLATION)
-- ============================================================
CREATE POLICY "Platform owners can manage all jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can manage their tenant jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

-- ============================================================
-- UPDATE INVOICES POLICIES (TENANT ISOLATION)
-- ============================================================
DROP POLICY IF EXISTS "Admins can delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;

CREATE POLICY "Platform owners can manage all invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can manage their tenant invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

-- ============================================================
-- UPDATE SERVICE_AGREEMENTS POLICIES (TENANT ISOLATION)
-- ============================================================
DROP POLICY IF EXISTS "Admins can update all agreements" ON public.service_agreements;
DROP POLICY IF EXISTS "Admins can view all agreements" ON public.service_agreements;

CREATE POLICY "Platform owners can manage all agreements"
ON public.service_agreements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can manage their tenant agreements"
ON public.service_agreements
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

-- ============================================================
-- UPDATE REVIEWS POLICIES (TENANT ISOLATION)
-- ============================================================
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;

CREATE POLICY "Platform owners can manage all reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can manage their tenant reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);

-- ============================================================
-- UPDATE USER_ROLES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Platform owners can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can view roles in their tenant"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  user_id IN (
    SELECT id FROM public.profiles WHERE tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Tenant admins can assign worker roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'tenant_admin') AND
  role = 'worker' AND
  user_id IN (
    SELECT id FROM public.profiles WHERE tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Tenant admins can remove worker roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  role = 'worker' AND
  user_id IN (
    SELECT id FROM public.profiles WHERE tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- ============================================================
-- ADD PROFILE VIEWING POLICIES
-- ============================================================
CREATE POLICY "Platform owners can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Tenant admins can view profiles in their tenant"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'tenant_admin') AND
  tenant_id = public.get_user_tenant_id(auth.uid())
);