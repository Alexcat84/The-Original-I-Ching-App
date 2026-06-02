-- Revoke direct RPC access to trigger-only functions.
--
-- set_display_name_from_google() is a BEFORE INSERT trigger function on
-- public.users. It uses SECURITY DEFINER to read auth.users, which is correct.
-- However, because it lives in the public schema, PostgREST exposes it as
-- /rest/v1/rpc/set_display_name_from_google, callable by anon and authenticated.
-- Calling it directly outside a trigger context raises an error (trigger
-- functions can only be called as triggers), but it is still an unnecessary
-- attack surface.
--
-- Fix: revoke EXECUTE from anon and authenticated.
-- Trigger execution is controlled by the trigger definition and is NOT gated
-- by EXECUTE grants — the trigger continues to fire normally after this revoke.

REVOKE EXECUTE ON FUNCTION public.set_display_name_from_google() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_display_name_from_google() FROM authenticated;

DO $$
BEGIN
  RAISE NOTICE 'Migration 049: revoked RPC execute on set_display_name_from_google for anon and authenticated.';
END $$;
