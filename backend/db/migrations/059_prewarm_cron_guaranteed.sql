-- Re-schedule pg_cron prewarm job now that pg_cron extension is enabled.
-- Migration 053 skipped this block with a NOTICE because pg_cron was absent at run time.
-- This migration re-runs the scheduling unconditionally and increases frequency to 15 min.
-- Idempotent: unschedules any previous version before creating the new one.

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE EXCEPTION 'pg_cron extension is not enabled — enable it in Dashboard › Extensions before running this migration';
  END IF;

  BEGIN
    PERFORM cron.unschedule('prewarm-consultations-toast');
  EXCEPTION WHEN others THEN
    NULL;
  END;

  PERFORM cron.schedule(
    'prewarm-consultations-toast',
    '*/15 * * * *',
    $cron$
      SELECT pg_prewarm('consultations');
      SELECT pg_prewarm(reltoastrelid)
      FROM   pg_class
      WHERE  relname       = 'consultations'
        AND  relnamespace  = 'public'::regnamespace
        AND  reltoastrelid <> 0;
    $cron$
  );

  RAISE NOTICE 'pg_cron prewarm job scheduled every 15 min';
END;
$do$;

SELECT jobid, schedule, command, active
FROM   cron.job
WHERE  jobname = 'prewarm-consultations-toast';
