-- ============================================================
-- MIGRATION 1: Add new enum values to app_role
-- These need to be committed before they can be used
-- ============================================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'platform_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tenant_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'worker';