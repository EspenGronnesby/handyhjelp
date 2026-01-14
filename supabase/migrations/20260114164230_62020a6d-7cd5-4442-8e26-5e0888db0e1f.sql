-- Update hero-images bucket to allow 10MB file uploads
UPDATE storage.buckets 
SET file_size_limit = 10485760  -- 10MB in bytes
WHERE id = 'hero-images';