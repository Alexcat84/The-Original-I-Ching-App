-- ─────────────────────────────────────────────────────────────────────────────
-- Migration verification script — The Original I Ching App
-- Run in Supabase SQL Editor. Each row shows migration number + status.
-- ─────────────────────────────────────────────────────────────────────────────

SELECT num, description,
  CASE WHEN check_result THEN '✓ OK' ELSE '✗ MISSING' END AS status
FROM (

  -- 001 · Core tables
  SELECT '001' AS num, 'Core tables (users, consultations, sessions)' AS description,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='consultations')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='consultation_sessions')
    AS check_result

  UNION ALL
  -- 002 · Oracle bones column
  SELECT '002', 'oracle_type column on consultations',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='consultations' AND column_name='oracle_type')

  UNION ALL
  -- 005 · RC webhook idempotency table
  SELECT '005', 'revenuecat_webhook_events table',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='revenuecat_webhook_events')

  UNION ALL
  -- 007 · Email 2FA codes table
  SELECT '007', 'two_factor_email_codes table',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='two_factor_email_codes')

  UNION ALL
  -- 008 · Chat history indexes
  SELECT '008', 'idx_consultation_sessions_user_created_at index',
    EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_consultation_sessions_user_created_at')

  UNION ALL
  -- 012 · Auth delete sync trigger/function
  SELECT '012', 'handle_deleted_auth_user function + on_auth_user_deleted trigger',
    EXISTS (SELECT 1 FROM pg_proc WHERE proname='handle_deleted_auth_user')
    AND EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_auth_user_deleted')

  UNION ALL
  -- 016 · TOTP replay guard column
  SELECT '016', 'totp_last_used_step column on users',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='totp_last_used_step')

  UNION ALL
  -- 017 · Admin runtime config
  SELECT '017', 'admin_runtime_config table',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='admin_runtime_config')

  UNION ALL
  -- 021 · Consumable tokens
  SELECT '021', 'query_credits table + grant_tokens function',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='query_credits')
    AND EXISTS (SELECT 1 FROM pg_proc WHERE proname='grant_tokens')

  UNION ALL
  -- 022 · User trial log
  SELECT '022', 'user_trial_log table',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_trial_log')

  UNION ALL
  -- 025 · Display name
  SELECT '025', 'display_name column on users',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='display_name')

  UNION ALL
  -- 026 · is_admin flag
  SELECT '026', 'is_admin column on users',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='is_admin')

  UNION ALL
  -- 027 · Legal acceptances
  SELECT '027', 'user_legal_acceptances table',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_legal_acceptances')

  UNION ALL
  -- 028 · Email registered RPC
  SELECT '028', 'auth_email_registered function',
    EXISTS (SELECT 1 FROM pg_proc WHERE proname='auth_email_registered')

  UNION ALL
  -- 029 · New auth user handler (final version with orphan cleanup)
  SELECT '029', 'on_auth_user_created trigger',
    EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_auth_user_created')

  UNION ALL
  -- 031 · Interpretation summary
  SELECT '031', 'interpretation_summary column on consultations',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='consultations' AND column_name='interpretation_summary')

  UNION ALL
  -- 034 · Translator column
  SELECT '034', 'translator column on consultations',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='consultations' AND column_name='translator')

  UNION ALL
  -- 036 · Session id index on consultations
  SELECT '036', 'idx_consultations_session_id index',
    EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_consultations_session_id')

  UNION ALL
  -- 039 · Atomic webhook grant function
  SELECT '039', 'grant_tokens_idempotent function',
    EXISTS (SELECT 1 FROM pg_proc WHERE proname='grant_tokens_idempotent')

  UNION ALL
  -- 040 · Drop RC customer aliases (should NOT exist)
  SELECT '040', 'revenuecat_customer_aliases table dropped (must NOT exist)',
    NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='revenuecat_customer_aliases')

  UNION ALL
  -- 041 · Feedback table
  SELECT '041', 'feedback table',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='feedback')

  UNION ALL
  -- 045 · Google display name trigger
  SELECT '045', 'trg_set_display_name_from_google trigger',
    EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_set_display_name_from_google')

  UNION ALL
  -- 046 · Permanent email trial log
  SELECT '046', 'trial_email_log table + init_free_user checks email hash',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trial_email_log')
    AND EXISTS (SELECT 1 FROM pg_proc WHERE proname='init_free_user'
                AND prosrc LIKE '%trial_email_log%')

  UNION ALL
  -- 047 · Anonymous purchase log
  SELECT '047', 'anonymous_purchase_log table',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='anonymous_purchase_log')

  UNION ALL
  -- 048 · init_free_user search_path fix (pgcrypto digest)
  SELECT '048', 'init_free_user search_path includes extensions schema',
    EXISTS (SELECT 1 FROM pg_proc WHERE proname='init_free_user'
            AND proconfig::text LIKE '%extensions%')

  UNION ALL
  -- 049 · revoke RPC execute on trigger-only function
  SELECT '049', 'anon cannot execute set_display_name_from_google via RPC',
    NOT EXISTS (
      SELECT 1 FROM information_schema.role_routine_grants
      WHERE routine_schema = 'public'
        AND routine_name = 'set_display_name_from_google'
        AND grantee IN ('anon', 'authenticated')
        AND privilege_type = 'EXECUTE'
    )

  UNION ALL
  -- 050 · security linter fixes
  SELECT '050', 'PUBLIC cannot execute set_display_name_from_google + deny-all policies on internal tables',
    NOT EXISTS (
      SELECT 1 FROM information_schema.role_routine_grants
      WHERE routine_schema = 'public'
        AND routine_name = 'set_display_name_from_google'
        AND grantee = 'PUBLIC'
        AND privilege_type = 'EXECUTE'
    )
    AND EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'anonymous_purchase_log' AND policyname = 'deny_direct_access'
    )
    AND EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'trial_email_log' AND policyname = 'deny_direct_access'
    )

  UNION ALL
  -- 051 · tour_v1_completed_at column on users
  SELECT '051', 'users.tour_v1_completed_at column exists',
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'users'
        AND column_name  = 'tour_v1_completed_at'
    )

  UNION ALL
  -- 052 · autovacuum tuning on consultations
  SELECT '052', 'consultations autovacuum_vacuum_scale_factor tuned to 0.01',
    EXISTS (
      SELECT 1 FROM pg_class
      WHERE relname = 'consultations'
        AND relnamespace = 'public'::regnamespace
        AND reloptions::text LIKE '%autovacuum_vacuum_scale_factor=0.01%'
    )

  UNION ALL
  -- 053 · TOAST timeout guard + prewarm
  SELECT '053', 'get_session_content_safe function exists (TOAST timeout guard)',
    EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name   = 'get_session_content_safe'
    )

) checks
ORDER BY num;
