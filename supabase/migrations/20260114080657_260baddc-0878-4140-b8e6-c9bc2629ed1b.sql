-- Drop old constraint and add new one with content notification types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('quote_update', 'job_update', 'review_request', 'general', 'loyalty', 'content_submission', 'content_approved', 'content_rejected'));