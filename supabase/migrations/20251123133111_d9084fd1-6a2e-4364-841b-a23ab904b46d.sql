-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vaktmester', 'tomrer', 'blikk', 'sesongråd', 'generelt')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time INTEGER NOT NULL DEFAULT 5,
  views INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT
);

-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (status = 'published');

-- Admins can view all blog posts
CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert blog posts
CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update blog posts
CREATE POLICY "Admins can update blog posts"
ON public.blog_posts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete blog posts
CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Storage policies for blog-images
CREATE POLICY "Anyone can view blog images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();