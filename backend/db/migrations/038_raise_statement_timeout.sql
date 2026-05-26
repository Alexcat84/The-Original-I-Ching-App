-- Raise statement_timeout for PostgREST roles.
-- Default Supabase role config sets authenticated=8s and anon=3s, which is
-- too tight for session-loading queries that fetch large TOAST columns
-- (interpretation ~6-8 KB per row × up to 8 rows in a Master thread).
-- A single well-indexed query for one session completes in ~1-3s under normal
-- load; 30s gives enough headroom for cold-buffer conditions without allowing
-- runaway queries.
ALTER ROLE authenticated  SET statement_timeout = '30s';
ALTER ROLE anon           SET statement_timeout = '10s';
ALTER ROLE authenticator  SET statement_timeout = '30s';

-- Verify.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT rolname, rolconfig
    FROM pg_roles
    WHERE rolname IN ('authenticated', 'anon', 'authenticator')
    ORDER BY rolname
  LOOP
    RAISE NOTICE 'Role % → config: %', r.rolname, r.rolconfig;
  END LOOP;
END $$;
