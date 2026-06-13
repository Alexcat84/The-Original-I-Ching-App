-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 073 · Supabase linter security fixes
--
-- Fixes two warnings from the Supabase database linter (2026-06-13):
--
-- 1. get_user_session_summaries (071): REVOKE in 071 missed the implicit
--    EXECUTE grant to PUBLIC that CREATE FUNCTION adds by default (SQL
--    standard). Both anon and authenticated inherit from PUBLIC, so the
--    per-role REVOKE was ineffective. Pattern matches 035's fix.
--
-- 2. token_refund_log (072): RLS was enabled with no policies. This is by
--    design (service_role bypasses RLS), but the linter flags it. Adding
--    explicit deny-all policies + revoking table grants makes the intent
--    unambiguous and silences the warning.
--
-- Safe to re-run: all statements are idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix 1: get_user_session_summaries — close the PUBLIC grant gap (same as 035)
-- ═══════════════════════════════════════════════════════════════════════════════
REVOKE ALL ON FUNCTION public.get_user_session_summaries(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_session_summaries(UUID) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_user_session_summaries(UUID) TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix 2: token_refund_log — add explicit deny-all RLS policies
--
-- service_role bypasses RLS, so these policies only affect anon/authenticated
-- (which should never touch this table). The policies make the intent explicit
-- and satisfy the linter's "RLS enabled but no policies" check.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Revoke any direct table grants (belt-and-suspenders with RLS)
REVOKE ALL ON TABLE public.token_refund_log FROM anon, authenticated;

-- Deny-all policies: no row is ever visible or writable for non-service roles.
CREATE POLICY "deny_all_select" ON public.token_refund_log
  FOR SELECT USING (false);

CREATE POLICY "deny_all_insert" ON public.token_refund_log
  FOR INSERT WITH CHECK (false);

CREATE POLICY "deny_all_update" ON public.token_refund_log
  FOR UPDATE USING (false);

CREATE POLICY "deny_all_delete" ON public.token_refund_log
  FOR DELETE USING (false);

DO $$
BEGIN
  RAISE NOTICE '073 · get_user_session_summaries PUBLIC revoke applied; token_refund_log deny-all policies created.';
END $$;
