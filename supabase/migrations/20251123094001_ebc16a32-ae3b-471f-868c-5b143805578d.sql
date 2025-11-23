-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 100),
  description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 200),
  location TEXT NOT NULL,
  completed_date DATE NOT NULL,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  display_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Anyone can view published projects"
  ON public.projects
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all projects"
  ON public.projects
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
  ON public.projects
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
  ON public.projects
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project images
CREATE POLICY "Anyone can view project images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Admins can upload project images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-images' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update project images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-images' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete project images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-images' AND
    public.has_role(auth.uid(), 'admin')
  );