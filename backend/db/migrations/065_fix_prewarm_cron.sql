-- Fix pg_cron prewarm job broken by migration 064 (invalid pg_prewarm fork syntax).
--
-- Root cause of recurring Warp errors: migration 059 scheduled prewarm of
-- consultations TOAST (~270 MB bloated, ~20 s per run). Migration 064 retargeted
-- to consultation_content but used invalid forks ('buffer', 'toast') — job failed
-- every 15 min with no benefit.
--
-- This migration:
--   1. Unschedules the broken job name(s).
--   2. Schedules prewarm-consultation-content with single-arg pg_prewarm (059 pattern).
--   3. NEVER prewarms consultations TOAST (contraproducente on bloated table).

DO $$
BEGIN
  PERFORM cron.unschedule('prewarm-consultations-toast');
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

DO $$
BEGIN
  PERFORM cron.unschedule('prewarm-consultation-content');
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

-- Replayability guard (PLAN-SUP-02): pg_cron is Dashboard-enabled, never by a
-- migration; on a blank database cron.schedule / cron.job do not exist. 053
-- pattern. Content edits to an applied migration never re-execute.
DO $do$
DECLARE r RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron not enabled — skipping prewarm scheduling';
    RETURN;
  END IF;
  PERFORM cron.schedule(
    'prewarm-consultation-content',
    '*/15 * * * *',
    $$
      SELECT pg_prewarm('consultation_content'::regclass);
      SELECT pg_prewarm(c.reltoastrelid)
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'consultation_content'
        AND n.nspname = 'public'
        AND c.reltoastrelid <> 0;
    $$
  );
  FOR r IN SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'prewarm-consultation-content' LOOP
    RAISE NOTICE 'prewarm job: id=% name=% schedule=% active=%', r.jobid, r.jobname, r.schedule, r.active;
  END LOOP;
END $do$;
