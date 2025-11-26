-- Create hero_images table for admin-editable hero backgrounds
CREATE TABLE public.hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- Anyone can read hero images
CREATE POLICY "Anyone can view hero images"
ON public.hero_images
FOR SELECT
USING (true);

-- Only admins can insert hero images
CREATE POLICY "Admins can insert hero images"
ON public.hero_images
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update hero images
CREATE POLICY "Admins can update hero images"
ON public.hero_images
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete hero images
CREATE POLICY "Admins can delete hero images"
ON public.hero_images
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create team_members table for team section on About page
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Anyone can read team members
CREATE POLICY "Anyone can view team members"
ON public.team_members
FOR SELECT
USING (true);

-- Only admins can insert team members
CREATE POLICY "Admins can insert team members"
ON public.team_members
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update team members
CREATE POLICY "Admins can update team members"
ON public.team_members
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete team members
CREATE POLICY "Admins can delete team members"
ON public.team_members
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create storage buckets for hero and team images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('hero-images', 'hero-images', true),
  ('team-images', 'team-images', true);

-- RLS policies for hero-images bucket
CREATE POLICY "Anyone can view hero images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hero-images');

CREATE POLICY "Admins can upload hero images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update hero images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'hero-images' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete hero images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'hero-images' AND
  has_role(auth.uid(), 'admin')
);

-- RLS policies for team-images bucket
CREATE POLICY "Anyone can view team images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'team-images');

CREATE POLICY "Admins can upload team images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'team-images' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update team images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'team-images' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete team images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'team-images' AND
  has_role(auth.uid(), 'admin')
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hero_images_updated_at
BEFORE UPDATE ON public.hero_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();