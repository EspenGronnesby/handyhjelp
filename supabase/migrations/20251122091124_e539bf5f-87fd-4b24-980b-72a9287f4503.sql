-- Drop the problematic RLS policy that causes permission errors
DROP POLICY IF EXISTS "Users can view quotes by email" ON public.quotes;