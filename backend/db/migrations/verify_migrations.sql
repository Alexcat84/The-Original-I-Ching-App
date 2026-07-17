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

  UNION ALL
  -- 054 · SECURITY INVOKER + explicit revoke from anon/authenticated
  SELECT '054', 'get_session_content_safe is SECURITY INVOKER (not DEFINER)',
    EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name   = 'get_session_content_safe'
        AND security_type  = 'INVOKER'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.role_routine_grants
      WHERE routine_schema = 'public'
        AND routine_name   = 'get_session_content_safe'
        AND grantee IN ('anon', 'authenticated', 'PUBLIC')
        AND privilege_type = 'EXECUTE'
    )

  UNION ALL
  -- 055 · 2s timeout + exception catch → HTTP 200 on cold TOAST (never kills Warp)
  SELECT '055', 'get_session_content_safe body uses SET LOCAL 2s + EXCEPTION handler',
    EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name   = 'get_session_content_safe'
        AND security_type  = 'INVOKER'
    )

  UNION ALL
  -- 059 · pg_cron enabled (job superseded by 065 — do not require prewarm-consultations-toast)
  SELECT '059', 'pg_cron extension enabled (prewarm job superseded by 065)',
    EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
    AND EXISTS (
      SELECT 1 FROM cron.job
      WHERE jobname = 'prewarm-consultation-content'
        AND active = true
    )

  UNION ALL
  -- 060 · RLS initplan fix — WITH CHECK now set on all 9 FOR ALL / FOR UPDATE policies
  -- (users_select_own is FOR SELECT → no with_check; the other 9 were updated by 060)
  SELECT '060', 'RLS policies with_check set on all FOR ALL / FOR UPDATE policies (migration 060)',
    (
      SELECT COUNT(*) = 9
      FROM   pg_policies
      WHERE  schemaname  = 'public'
        AND  policyname  IN (
          'own_consultations', 'own_sessions', 'own_credits',
          'users_update_own',
          'own_recovery_codes', 'own_2fa_attempts',
          'own_consultation_notes', 'own_pattern_analyses',
          'own_2fa_email_codes'
        )
        AND  with_check IS NOT NULL
    )

  UNION ALL
  -- 061 · FK indexes on consultation_notes, pattern_analyses, two_factor_recovery_codes
  SELECT '061', 'FK indexes on consultation_notes / pattern_analyses / two_factor_recovery_codes',
    EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_consultation_notes_consultation_id')
    AND EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_consultation_notes_user_id')
    AND EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_pattern_analyses_user_id')
    AND EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_two_factor_recovery_codes_user_id')

  UNION ALL
  -- 062 · consultation_content table with RLS and composite index
  SELECT '062', 'consultation_content table exists with RLS policy own_content and user_session index',
    EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'consultation_content'
    )
    AND EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename  = 'consultation_content'
        AND policyname = 'own_content'
    )
    AND EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname  = 'idx_consultation_content_user_session'
    )

  UNION ALL
  -- 063 · backfill completed — one content row per consultation (post-066/069 meta has no TOAST)
  SELECT '063', 'consultation_content row count >= consultations row count',
    (
      SELECT COUNT(*) FROM public.consultation_content
    ) >= (
      SELECT COUNT(*) FROM public.consultations
    )

  UNION ALL
  -- 064 · read path + prewarm (legacy sync trigger superseded by 069 DROP)
  SELECT '064', 'get_session_content_safe reads consultation_content + prewarm job active',
    EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name   = 'get_session_content_safe'
        AND security_type  = 'INVOKER'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.role_routine_grants
      WHERE routine_schema = 'public'
        AND routine_name   = 'get_session_content_safe'
        AND grantee IN ('anon', 'authenticated', 'PUBLIC')
        AND privilege_type = 'EXECUTE'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name   = 'sync_consultation_content'
    )
    AND EXISTS (
      SELECT 1 FROM cron.job
        WHERE jobname = 'prewarm-consultation-content'
        AND active  = true
    )

  UNION ALL
  -- 065 · pg_cron prewarm fixed — consultation_content only, never consultations TOAST
  SELECT '065', 'prewarm-consultation-content job active with correct pg_prewarm syntax',
    EXISTS (
      SELECT 1 FROM cron.job
      WHERE jobname = 'prewarm-consultation-content'
        AND active = true
        AND command LIKE '%consultation_content%'
        AND command NOT LIKE '%pg_prewarm(''consultations''%'
        AND command NOT LIKE '%buffer%'
        AND command NOT LIKE '%, ''main''%'
    )
    AND NOT EXISTS (
      SELECT 1 FROM cron.job
      WHERE jobname = 'prewarm-consultations-toast'
        AND active = true
    )

  UNION ALL
  -- 066 · legacy TOAST columns removed from consultations (069) or nulled pre-069
  SELECT '066', 'consultations has no interpretation/oracle_bones columns (Phase 2b reclaim)',
    NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'consultations'
        AND column_name IN ('interpretation', 'oracle_bones')
    )
    AND EXISTS (
      SELECT 1 FROM public.consultation_content
    )

  UNION ALL
  -- 067 · persist_consultation_with_content RPC (sole write path post-069)
  SELECT '067', 'persist_consultation_with_content RPC (service_role only), no legacy sync trigger',
    EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name   = 'persist_consultation_with_content'
        AND security_type  = 'DEFINER'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.role_routine_grants
      WHERE routine_schema = 'public'
        AND routine_name   = 'persist_consultation_with_content'
        AND grantee IN ('anon', 'authenticated', 'PUBLIC')
        AND privilege_type = 'EXECUTE'
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      WHERE c.relname = 'consultations'
        AND t.tgname  = 'trg_sync_consultation_content'
        AND t.tgenabled <> 'D'
    )

  UNION ALL
  -- 068 · RPC COALESCE never wipes consultation_content (sync fn removed in 069)
  SELECT '068', 'persist_consultation_with_content COALESCE on content conflict',
    EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name   = 'persist_consultation_with_content'
        AND routine_definition LIKE '%COALESCE(EXCLUDED.interpretation%'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name   = 'sync_consultation_content'
    )

  UNION ALL
  -- 069 · legacy TOAST columns dropped from consultations
  SELECT '069', 'consultations: interpretation and oracle_bones columns dropped',
    NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'consultations'
        AND column_name IN ('interpretation', 'oracle_bones')
    )

  UNION ALL
  -- 070 · Weekly VACUUM pg_cron job registered
  SELECT '070', 'cron job weekly-vacuum-iching registered',
    EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'weekly-vacuum-iching'
    )

  UNION ALL
  -- 071 · get_user_session_summaries RPC registered
  SELECT '071', 'get_user_session_summaries RPC exists',
    EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'get_user_session_summaries'
    )

  UNION ALL
  -- 072 · refund_token RPC + token_refund_log table
  SELECT '072', 'refund_token RPC (service_role only) + token_refund_log table',
    EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'refund_token'
    )
    AND EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'token_refund_log'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.role_routine_grants
      WHERE routine_schema = 'public'
        AND routine_name = 'refund_token'
        AND grantee IN ('anon', 'authenticated', 'PUBLIC')
        AND privilege_type = 'EXECUTE'
    )

  UNION ALL
  -- 073 · linter security fixes (PUBLIC revoke on 071 RPC + token_refund_log policies)
  SELECT '073', 'get_user_session_summaries no PUBLIC/anon/auth EXECUTE + token_refund_log has RLS policies',
    NOT EXISTS (
      SELECT 1 FROM information_schema.role_routine_grants
      WHERE routine_schema = 'public'
        AND routine_name = 'get_user_session_summaries'
        AND grantee IN ('anon', 'authenticated', 'PUBLIC')
        AND privilege_type = 'EXECUTE'
    )
    AND EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'token_refund_log'
    )

  UNION ALL
  -- 074 · line_reading_system column + persist_consultation_with_content param
  SELECT '074', 'line_reading_system column on consultations + RPC has p_line_reading_system param',
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'consultations' AND column_name = 'line_reading_system'
    )
    AND EXISTS (
      SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'persist_consultation_with_content' AND p.pronargs = 24
    )

  UNION ALL
  -- 075 · on_auth_user_created trigger now provided BY THE CHAIN (was Dashboard-only;
  -- PLAN-SUP-02 finding 2b). The generic '029' trigger check above stays as-is.
  SELECT '075', 'on_auth_user_created trigger codified in chain (075)',
    EXISTS (
      SELECT 1 FROM pg_trigger t JOIN pg_proc p ON p.oid = t.tgfoid
      WHERE t.tgname = 'on_auth_user_created' AND p.proname = 'handle_new_auth_user'
    )

  UNION ALL
  -- CONTENT · P0 gate — fails on mass wipe; allows ≤2 irrecoverable post-PITR gaps
  SELECT 'CONTENT', 'consultation_content full text (≤2 empty rows allowed for known PITR gaps)',
    (
      SELECT COUNT(*) FROM public.consultations
    ) = 0
    OR (
      (SELECT COUNT(*) FROM public.consultation_content
       WHERE interpretation IS NOT NULL AND length(interpretation) > 100)
      >=
      (SELECT COUNT(*) FROM public.consultation_content) - 2
      AND (SELECT COUNT(*) FROM public.consultation_content) > 0
    )

) checks
ORDER BY num;
