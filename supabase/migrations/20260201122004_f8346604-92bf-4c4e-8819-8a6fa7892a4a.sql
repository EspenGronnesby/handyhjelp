-- FIX: Move extensions from public schema to dedicated extensions schema
-- This follows Supabase security best practices

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to relevant roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move uuid-ossp extension if it exists in public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e 
    JOIN pg_namespace n ON e.extnamespace = n.oid 
    WHERE e.extname = 'uuid-ossp' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
END $$;

-- Move pgcrypto extension if it exists in public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e 
    JOIN pg_namespace n ON e.extnamespace = n.oid 
    WHERE e.extname = 'pgcrypto' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION pgcrypto SET SCHEMA extensions;
  END IF;
END $$;

-- Move pg_graphql extension if it exists in public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e 
    JOIN pg_namespace n ON e.extnamespace = n.oid 
    WHERE e.extname = 'pg_graphql' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION pg_graphql SET SCHEMA extensions;
  END IF;
END $$;

-- Move pgjwt extension if it exists in public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e 
    JOIN pg_namespace n ON e.extnamespace = n.oid 
    WHERE e.extname = 'pgjwt' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION pgjwt SET SCHEMA extensions;
  END IF;
END $$;

-- Move pg_stat_statements extension if it exists in public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e 
    JOIN pg_namespace n ON e.extnamespace = n.oid 
    WHERE e.extname = 'pg_stat_statements' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION pg_stat_statements SET SCHEMA extensions;
  END IF;
END $$;