-- Run after 001–003. Clears Supabase Security Advisor: RLS on exposed tables + fixed search_path on random_public_id.

-- Harden function (avoids search_path hijacking; gen_random_bytes from pgcrypto)
CREATE OR REPLACE FUNCTION public.random_public_id(len int DEFAULT 8)
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public, extensions
AS $$
  SELECT lower(substring(encode(gen_random_bytes(16), 'hex'), 1, len));
$$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "own_recovery_codes" ON public.two_factor_recovery_codes;
CREATE POLICY "own_recovery_codes" ON public.two_factor_recovery_codes
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_2fa_attempts" ON public.two_factor_attempts;
CREATE POLICY "own_2fa_attempts" ON public.two_factor_attempts
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_consultation_notes" ON public.consultation_notes;
CREATE POLICY "own_consultation_notes" ON public.consultation_notes
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_pattern_analyses" ON public.pattern_analyses;
CREATE POLICY "own_pattern_analyses" ON public.pattern_analyses
  FOR ALL USING (auth.uid() = user_id);
