-- Drop existing policies first to avoid conflicts, then create all needed policies
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own blog images" ON storage.objects;

-- Add INSERT policies for project-images bucket
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

-- Add DELETE policy for project-images bucket
CREATE POLICY "Users can delete own project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');

-- Add INSERT policy for blog-images bucket
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Add DELETE policy for blog-images bucket
CREATE POLICY "Users can delete own blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');