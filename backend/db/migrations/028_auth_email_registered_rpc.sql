-- Used by apps/web /api/auth/register (service role) before anon signUp.
-- Detects emails already present in auth.users (any provider, e.g. Google) so we return 409
-- instead of relying on GoTrue opaque unexpected_failure when password signup collides.

CREATE OR REPLACE FUNCTION public.auth_email_registered(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.email IS NOT NULL
      AND lower(trim(au.email)) = lower(trim(p_email))
  );
$$;

COMMENT ON FUNCTION public.auth_email_registered(TEXT) IS
  'True if auth.users already has this email (any identity). Register route only; service_role.';

REVOKE ALL ON FUNCTION public.auth_email_registered(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_email_registered(TEXT) TO service_role;
