-- Fix: Allow 'loyalty' notification type to unblock user registration
-- The award_welcome_bonus_trigger() attempts to insert notifications with type='loyalty'
-- but the CHECK constraint was missing this value, blocking all new user signups

-- Drop the existing CHECK constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate with 'loyalty' included
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('quote_update', 'job_update', 'review_request', 'general', 'loyalty'));

-- Add comment documenting valid notification types
COMMENT ON COLUMN public.notifications.type IS 'Valid types: quote_update, job_update, review_request, general, loyalty';