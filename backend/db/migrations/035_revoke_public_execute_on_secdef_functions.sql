-- MIGRATION: Revoke EXECUTE on SECURITY DEFINER functions from anon / authenticated
-- All functions below are service-role-only (called from server-side API routes or
-- invoked internally by triggers). None should be reachable via /rest/v1/rpc/ by
-- unauthenticated or authenticated clients.
--
-- Migrations 028 and 030 already did REVOKE ALL FROM PUBLIC / GRANT TO service_role
-- for auth_email_registered and reset_2fa_recovery_codes, but Supabase's linter
-- still flags them because REVOKE FROM PUBLIC does not cover explicit grants that
-- Supabase may have added to anon/authenticated. This migration closes that gap
-- for all affected functions with an explicit revoke on each named role.

-- ---------------------------------------------------------------------------
-- consume_token — decrements credits_total; service_role only (API route /api/consult)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.consume_token(UUID, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.consume_token(UUID, INTEGER) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.consume_token(UUID, INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- grant_tokens — credits the user balance; service_role only (RevenueCat webhook)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.grant_tokens(UUID, INTEGER, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_tokens(UUID, INTEGER, TEXT) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.grant_tokens(UUID, INTEGER, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- init_free_user — bootstraps 2-token free trial; service_role only
--   (called from handle_new_auth_user trigger and server-side bootstrap routes)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.init_free_user(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.init_free_user(UUID) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.init_free_user(UUID) TO service_role;

-- ---------------------------------------------------------------------------
-- handle_new_auth_user — trigger function; invoked only by on_auth_user_created
--   trigger, never via RPC. No role needs EXECUTE.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- handle_deleted_auth_user — trigger function; invoked only by on_auth_user_deleted
--   trigger, never via RPC. No role needs EXECUTE.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.handle_deleted_auth_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_deleted_auth_user() FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- auth_email_registered — checks if an email exists in auth.users; service_role only
--   (already had REVOKE/GRANT in 028 — repeat here to cover explicit role grants)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.auth_email_registered(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_email_registered(TEXT) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.auth_email_registered(TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- reset_2fa_recovery_codes — replaces recovery codes atomically; service_role only
--   (already had REVOKE/GRANT in 030 — repeat here to cover explicit role grants)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.reset_2fa_recovery_codes(UUID, TEXT[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reset_2fa_recovery_codes(UUID, TEXT[]) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.reset_2fa_recovery_codes(UUID, TEXT[]) TO service_role;
