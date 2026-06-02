-- Fix Supabase security linter warnings:
--
-- WARN: set_display_name_from_google() callable by anon/authenticated
--   Migration 049 revoked from anon and authenticated, but PostgreSQL's
--   implicit grant to PUBLIC was never removed.  Since anon/authenticated
--   inherit from PUBLIC they still had EXECUTE.  Fix: revoke from PUBLIC.
--   Triggers are NOT gated by EXECUTE grants — the trigger keeps firing.
--
-- INFO: RLS enabled with no policies on two internal tables
--   anonymous_purchase_log and trial_email_log have RLS enabled (correct)
--   but no explicit policies, which the linter flags.  These tables are
--   accessed exclusively via SECURITY DEFINER functions / service_role, both
--   of which bypass RLS.  Adding a deny-all restrictive policy silences the
--   linter while making the intent explicit.

-- ── 1. Revoke EXECUTE on trigger function from PUBLIC ────────────────────────

REVOKE EXECUTE ON FUNCTION public.set_display_name_from_google() FROM PUBLIC;

-- ── 2. Explicit deny-all policies for internal-only tables ───────────────────

-- anonymous_purchase_log: written only by the RC webhook via service_role.
-- No direct user access is intended.
CREATE POLICY "deny_direct_access"
  ON public.anonymous_purchase_log
  AS RESTRICTIVE
  FOR ALL
  USING (false);

-- trial_email_log: written only by init_free_user (SECURITY DEFINER).
-- No direct user access is intended.
CREATE POLICY "deny_direct_access"
  ON public.trial_email_log
  AS RESTRICTIVE
  FOR ALL
  USING (false);

DO $$
BEGIN
  RAISE NOTICE 'Migration 050: revoked PUBLIC execute on set_display_name_from_google; added deny-all policies on anonymous_purchase_log and trial_email_log.';
END $$;
