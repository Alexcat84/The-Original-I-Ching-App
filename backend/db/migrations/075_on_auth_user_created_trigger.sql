-- Codify the on_auth_user_created trigger in the migration chain.
--
-- Finding 2b of PLAN-SUP-02 (discovered by GATE-SEC-01): this trigger was
-- created via the Supabase Dashboard in production and existed in NO migration.
-- Migration 029 defines the function (handle_new_auth_user) in its final form,
-- and verify_migrations.sql has always CHECKED for the trigger — but the chain
-- itself never provided it, so any blank-database replay (disaster recovery,
-- local stack, new environment) produced a database where signups created
-- auth.users rows with no public.users row and no free-tier credits.
--
-- Idempotent in every deployed environment: the trigger already exists there
-- with this exact definition; DROP + CREATE re-establishes it unchanged.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    RAISE EXCEPTION 'Migration 075: on_auth_user_created trigger was not created';
  END IF;
  RAISE NOTICE 'Migration 075 OK — on_auth_user_created now provided by the chain';
END $$;
