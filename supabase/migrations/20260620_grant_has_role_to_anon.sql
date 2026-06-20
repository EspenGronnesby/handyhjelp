-- Grant EXECUTE on has_role to anon so RLS policies work for unauthenticated users.
-- Needed because multiple tables have SELECT policies that call has_role(), and
-- PostgreSQL evaluates all permissive policies even when one simpler policy would suffice.
-- Safe: anon calls has_role(null, 'admin') which always returns false.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
