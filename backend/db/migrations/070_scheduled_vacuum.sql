-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 070 · Weekly VACUUM via pg_cron
--
-- Schedules an automatic VACUUM ANALYZE on the three heaviest tables every
-- Sunday at 04:00 UTC (low-traffic window). Prevents dead-tuple bloat from
-- accumulating between autovacuum runs and keeps TOAST page cache warm.
--
-- Requires: pg_cron extension (enabled by default on Supabase Pro).
-- Safe to re-run: cron.schedule uses job name as upsert key.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable pg_cron if not already active (no-op if already installed).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any stale version of this job before (re)creating it.
SELECT cron.unschedule('weekly-vacuum-iching')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-vacuum-iching'
);

SELECT cron.schedule(
  'weekly-vacuum-iching',
  '0 4 * * 0',  -- Every Sunday at 04:00 UTC
  $$
  VACUUM ANALYZE public.consultation_content;
  VACUUM ANALYZE public.consultations;
  VACUUM ANALYZE public.consultation_sessions;
  $$
);
