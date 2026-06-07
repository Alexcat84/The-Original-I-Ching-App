-- Fix 10 performance WARN from Supabase linter: auth_rls_initplan.
--
-- Problem: bare auth.uid() in USING expressions is re-evaluated for every row
-- scanned. Wrapping it in (select auth.uid()) converts it to an initplan that
-- runs once per query — significant speedup at scale.
--
-- Also adds WITH CHECK mirrors to FOR ALL policies (was missing) to close the
-- IDOR risk where a user could INSERT/UPDATE a row owned by another user_id via
-- the PostgREST Data API.
--
-- Uses ALTER POLICY (no DROP gap) — idempotent, safe to re-run.

-- ── consultations ────────────────────────────────────────────────────────────
ALTER POLICY "own_consultations" ON public.consultations
  USING     ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── consultation_sessions ────────────────────────────────────────────────────
ALTER POLICY "own_sessions" ON public.consultation_sessions
  USING     ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── query_credits ────────────────────────────────────────────────────────────
ALTER POLICY "own_credits" ON public.query_credits
  USING     ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── users ────────────────────────────────────────────────────────────────────
ALTER POLICY "users_select_own" ON public.users
  USING     ((select auth.uid()) = id);

ALTER POLICY "users_update_own" ON public.users
  USING     ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ── two_factor_recovery_codes ────────────────────────────────────────────────
ALTER POLICY "own_recovery_codes" ON public.two_factor_recovery_codes
  USING     ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── two_factor_attempts ──────────────────────────────────────────────────────
ALTER POLICY "own_2fa_attempts" ON public.two_factor_attempts
  USING     ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── consultation_notes ───────────────────────────────────────────────────────
ALTER POLICY "own_consultation_notes" ON public.consultation_notes
  USING     ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── pattern_analyses ─────────────────────────────────────────────────────────
ALTER POLICY "own_pattern_analyses" ON public.pattern_analyses
  USING     ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── two_factor_email_codes ───────────────────────────────────────────────────
ALTER POLICY "own_2fa_email_codes" ON public.two_factor_email_codes
  USING     ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Verify: all 10 policies now use (select auth.uid())
SELECT tablename, policyname, qual, with_check
FROM   pg_policies
WHERE  schemaname = 'public'
  AND  policyname IN (
    'own_consultations', 'own_sessions', 'own_credits',
    'users_select_own', 'users_update_own',
    'own_recovery_codes', 'own_2fa_attempts',
    'own_consultation_notes', 'own_pattern_analyses',
    'own_2fa_email_codes'
  )
ORDER BY tablename, policyname;
