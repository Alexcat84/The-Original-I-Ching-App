-- System-wide read-only audit snapshot.
-- Run this file top-to-bottom in Supabase SQL Editor when troubleshooting.

-- ---------------------------------------------------------------------------
-- A) Core auth/data consistency
-- ---------------------------------------------------------------------------
SELECT
  'auth_users_total' AS metric,
  COUNT(*)::BIGINT AS value
FROM auth.users
UNION ALL
SELECT
  'public_users_total' AS metric,
  COUNT(*)::BIGINT AS value
FROM public.users
UNION ALL
SELECT
  'query_credits_total' AS metric,
  COUNT(*)::BIGINT AS value
FROM public.query_credits
UNION ALL
SELECT
  'auth_without_public_users' AS metric,
  COUNT(*)::BIGINT AS value
FROM auth.users a
LEFT JOIN public.users u ON u.id = a.id
WHERE u.id IS NULL
UNION ALL
SELECT
  'public_without_auth_users' AS metric,
  COUNT(*)::BIGINT AS value
FROM public.users u
LEFT JOIN auth.users a ON a.id = u.id
WHERE a.id IS NULL
UNION ALL
SELECT
  'auth_without_query_credits' AS metric,
  COUNT(*)::BIGINT AS value
FROM auth.users a
LEFT JOIN public.query_credits qc ON qc.user_id = a.id
WHERE qc.user_id IS NULL;

-- ---------------------------------------------------------------------------
-- B) Credit ledger sanity checks
-- ---------------------------------------------------------------------------
SELECT
  user_id,
  credits_total,
  credits_used,
  total_purchased,
  last_pack,
  updated_at
FROM public.query_credits
WHERE credits_total < 0
   OR credits_used < 0
   OR total_purchased < 0
   OR last_pack IS NULL
ORDER BY updated_at DESC;

-- ---------------------------------------------------------------------------
-- C) Critical trigger/function presence
-- ---------------------------------------------------------------------------
SELECT
  t.tgname,
  t.tgrelid::regclass AS table_name,
  t.tgenabled AS trigger_enabled
FROM pg_trigger t
WHERE t.tgname = 'on_auth_user_created'
  AND t.tgisinternal = FALSE;

SELECT
  p.proname,
  pg_get_function_identity_arguments(p.oid) AS args,
  CASE
    WHEN pg_get_functiondef(p.oid) ILIKE '%set search_path = public%' THEN 'ok'
    ELSE 'missing_search_path_guard'
  END AS search_path_guard
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('handle_new_auth_user', 'init_free_user', 'grant_tokens', 'consume_token')
ORDER BY p.proname;

-- ---------------------------------------------------------------------------
-- D) RLS + policy surface for internal tables
-- ---------------------------------------------------------------------------
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'admin_runtime_config',
    'revenuecat_customer_aliases',
    'revenuecat_webhook_events',
    'user_trial_log'
  )
ORDER BY tablename;

SELECT
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'admin_runtime_config',
    'revenuecat_customer_aliases',
    'revenuecat_webhook_events',
    'user_trial_log'
  )
ORDER BY tablename, policyname;

