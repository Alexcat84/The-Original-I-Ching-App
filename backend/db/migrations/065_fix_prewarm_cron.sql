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

SELECT cron.schedule(
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

SELECT jobid, jobname, schedule, active, command
FROM cron.job
WHERE jobname = 'prewarm-consultation-content';
