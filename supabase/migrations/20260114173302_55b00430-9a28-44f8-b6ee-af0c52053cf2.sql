-- Set 10MB file size limit on all image storage buckets
UPDATE storage.buckets SET file_size_limit = 10485760 WHERE id = 'project-images';
UPDATE storage.buckets SET file_size_limit = 10485760 WHERE id = 'blog-images';
UPDATE storage.buckets SET file_size_limit = 10485760 WHERE id = 'team-images';
UPDATE storage.buckets SET file_size_limit = 10485760 WHERE id = 'site-images';