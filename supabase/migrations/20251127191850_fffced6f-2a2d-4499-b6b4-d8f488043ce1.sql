-- Create site_content table for text content
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_value TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(section, content_key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can edit site content"
  ON public.site_content FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create site_images table for images
CREATE TABLE IF NOT EXISTS public.site_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_key TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site images"
  ON public.site_images FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can edit site images"
  ON public.site_images FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create site_colors table for color customization
CREATE TABLE IF NOT EXISTS public.site_colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  color_key TEXT UNIQUE NOT NULL,
  color_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site colors"
  ON public.site_colors FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can edit site colors"
  ON public.site_colors FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default colors
INSERT INTO public.site_colors (color_key, color_value) VALUES
  ('primary', '#0ea5e9'),
  ('secondary', '#0284c7'),
  ('accent', '#06b6d4')
ON CONFLICT (color_key) DO NOTHING;

-- Add edit_mode_enabled column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS edit_mode_enabled BOOLEAN DEFAULT false;