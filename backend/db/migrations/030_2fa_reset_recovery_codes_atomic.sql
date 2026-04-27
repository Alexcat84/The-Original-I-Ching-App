-- Replaces the non-atomic delete+insert pattern in the 2FA verify route.
-- Wrapping in a single function gives ACID guarantees: the old codes are
-- removed and the new ones are inserted in the same transaction, so there
-- is never a window where the user has no valid recovery codes.

CREATE OR REPLACE FUNCTION public.reset_2fa_recovery_codes(
  p_user_id UUID,
  p_hashed_codes TEXT[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.two_factor_recovery_codes WHERE user_id = p_user_id;
  INSERT INTO public.two_factor_recovery_codes (user_id, code_hash)
  SELECT p_user_id, unnest(p_hashed_codes);
END;
$$;

REVOKE ALL ON FUNCTION public.reset_2fa_recovery_codes(UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_2fa_recovery_codes(UUID, TEXT[]) TO service_role;
