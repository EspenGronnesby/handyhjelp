-- Create site-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view site images
CREATE POLICY "Anyone can view site images"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- Policy: Only admins can upload site images
CREATE POLICY "Only admins can upload site images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images' AND
  public.has_role(auth.uid(), 'admin')
);

-- Policy: Only admins can update site images
CREATE POLICY "Only admins can update site images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-images' AND
  public.has_role(auth.uid(), 'admin')
);

-- Policy: Only admins can delete site images
CREATE POLICY "Only admins can delete site images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images' AND
  public.has_role(auth.uid(), 'admin')
);