-- db-health-check.sql — The Original I Ching App (prod/staging)
-- Run in Supabase SQL Editor or via psql after deploy / restart / incident.
-- Fase 4 observabilidad — TOAST, pool pressure, cron, content integrity.

-- ─── 1. Table sizes (TOAST reclaim target: consultations < 5 MB) ───────────
SELECT
  c.relname AS table_name,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total,
  pg_size_pretty(pg_relation_size(c.oid)) AS heap,
  pg_size_pretty(pg_relation_size(c.reltoastrelid)) AS toast
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('consultations', 'consultation_content', 'consultation_sessions')
ORDER BY pg_total_relation_size(c.oid) DESC;

-- ─── 2. Content integrity (P0 gate) ─────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM public.consultations) AS consults,
  (SELECT COUNT(*) FROM public.consultation_content) AS content_rows,
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS with_full_text,
  (SELECT COUNT(*) FROM public.consultation_content cc
   WHERE cc.interpretation IS NULL OR length(COALESCE(cc.interpretation, '')) < 100) AS empty_content;

-- ─── 3. Legacy columns dropped (post-069) ───────────────────────────────────
SELECT
  NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'consultations' AND column_name = 'interpretation'
  ) AS legacy_interpretation_dropped,
  NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'consultations' AND column_name = 'oracle_bones'
  ) AS legacy_oracle_bones_dropped;

-- ─── 4. pg_cron prewarm job ─────────────────────────────────────────────────
SELECT jobid, jobname, schedule, active,
       left(command, 100) AS command_preview
FROM cron.job
WHERE jobname LIKE '%prewarm%'
ORDER BY jobid;

-- ─── 5. Connection pressure (snapshot) ───────────────────────────────────────
SELECT
  count(*) FILTER (WHERE state = 'active') AS active,
  count(*) FILTER (WHERE state = 'idle') AS idle,
  count(*) FILTER (WHERE wait_event_type IS NOT NULL) AS waiting
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid();

-- ─── 6. Slow RPC / content reads (requires pg_stat_statements) ──────────────
SELECT
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round(max_exec_time::numeric, 2) AS max_ms,
  left(query, 120) AS query_preview
FROM pg_stat_statements
WHERE query ILIKE '%get_session_content_safe%'
   OR query ILIKE '%persist_consultation_with_content%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- ─── 7. Dead tuples (autovacuum health) ─────────────────────────────────────
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_vacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname IN ('consultations', 'consultation_content')
ORDER BY relname;
