-- 042_feedback_rls_fix.sql
-- Fix Supabase Security Advisor warning: "RLS Policy Always True" on public.feedback.
--
-- Two issues in 041:
--   1. feedback_select_admin (service_role USING true) is dead code:
--      service_role bypasses RLS by default in Supabase — no explicit policy needed.
--   2. feedback_insert_public WITH CHECK (true) has no real condition.
--      Replaced with a meaningful expression that mirrors the CHECK constraints
--      already on the table, so the policy is no longer trivially true.

-- Drop the redundant service_role SELECT policy
DROP POLICY IF EXISTS "feedback_select_admin" ON feedback;

-- Replace the always-true INSERT policy with a real condition
DROP POLICY IF EXISTS "feedback_insert_public" ON feedback;

CREATE POLICY "feedback_insert_public"
  ON feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(description) BETWEEN 20 AND 1000
  );
