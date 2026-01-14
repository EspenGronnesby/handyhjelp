-- =============================================
-- DEL 1: OPPDATER CHECK CONSTRAINTS
-- =============================================

-- Oppdater projects_status_check
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected'));

-- Oppdater blog_posts_status_check
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_status_check 
CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected'));

-- Oppdater projects_category_check
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_category_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_category_check 
CHECK (category IN ('vaktmester', 'tomrer', 'blikk', 'takrennerens', 'annet'));

-- =============================================
-- DEL 2: OPPDATER WORKER RLS POLICIES FOR PROJECTS
-- =============================================

-- Fjern gamle worker policies for projects
DROP POLICY IF EXISTS "Workers can insert draft projects" ON public.projects;
DROP POLICY IF EXISTS "Workers can update their own draft projects" ON public.projects;
DROP POLICY IF EXISTS "Workers can view projects in their tenant" ON public.projects;

-- Ny INSERT policy for workers
CREATE POLICY "Workers can insert projects for approval"
ON public.projects FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'worker'::app_role) 
  AND submitted_by = auth.uid()
  AND status IN ('draft', 'pending_approval')
);

-- Ny UPDATE policy for workers
CREATE POLICY "Workers can update their own projects"
ON public.projects FOR UPDATE
USING (
  has_role(auth.uid(), 'worker'::app_role) 
  AND submitted_by = auth.uid()
  AND status IN ('draft', 'rejected')
)
WITH CHECK (
  has_role(auth.uid(), 'worker'::app_role) 
  AND submitted_by = auth.uid()
  AND status IN ('draft', 'pending_approval')
);

-- Ny SELECT policy for workers
CREATE POLICY "Workers can view their own projects"
ON public.projects FOR SELECT
USING (
  has_role(auth.uid(), 'worker'::app_role) 
  AND submitted_by = auth.uid()
);

-- =============================================
-- DEL 3: OPPDATER WORKER RLS POLICIES FOR BLOG_POSTS
-- =============================================

-- Fjern gamle worker policies for blog_posts
DROP POLICY IF EXISTS "Workers can insert draft blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Workers can update their own drafts" ON public.blog_posts;
DROP POLICY IF EXISTS "Workers can view blog posts in their tenant" ON public.blog_posts;

-- Ny INSERT policy for workers
CREATE POLICY "Workers can insert blog posts for approval"
ON public.blog_posts FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'worker'::app_role) 
  AND submitted_by = auth.uid()
  AND status IN ('draft', 'pending_approval')
);

-- Ny UPDATE policy for workers
CREATE POLICY "Workers can update their own blog posts"
ON public.blog_posts FOR UPDATE
USING (
  has_role(auth.uid(), 'worker'::app_role) 
  AND submitted_by = auth.uid()
  AND status IN ('draft', 'rejected')
)
WITH CHECK (
  has_role(auth.uid(), 'worker'::app_role) 
  AND submitted_by = auth.uid()
  AND status IN ('draft', 'pending_approval')
);

-- Ny SELECT policy for workers
CREATE POLICY "Workers can view their own blog posts"
ON public.blog_posts FOR SELECT
USING (
  has_role(auth.uid(), 'worker'::app_role) 
  AND submitted_by = auth.uid()
);

-- =============================================
-- DEL 4: OPPDATER ADMIN RLS POLICIES
-- =============================================

-- Fjern gamle tenant-baserte admin policies
DROP POLICY IF EXISTS "Tenant admins can manage their tenant projects" ON public.projects;
DROP POLICY IF EXISTS "Tenant admins can manage their tenant blog posts" ON public.blog_posts;

-- Ny admin policy for projects
CREATE POLICY "Admins can manage all projects"
ON public.projects FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ny admin policy for blog_posts
CREATE POLICY "Admins can manage all blog posts"
ON public.blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));