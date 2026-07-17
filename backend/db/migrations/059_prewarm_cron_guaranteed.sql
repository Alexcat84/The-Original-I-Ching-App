-- Re-schedule pg_cron prewarm job now that pg_cron extension is enabled.
-- Migration 053 skipped this block with a NOTICE because pg_cron was absent at run time.
-- This migration re-runs the scheduling unconditionally and increases frequency to 15 min.
-- Idempotent: unschedules any previous version before creating the new one.

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Replayability (PLAN-SUP-02): pg_cron is enabled via Dashboard, never by a
    -- migration, so a blank-database replay dies here by design. Aligned to the
    -- 053 NOTICE+skip pattern (decision recorded in PLAN-SUP-02: the EXCEPTION
    -- was intentional for prod, where the extension was present and this ran
    -- fine; content edits to an applied migration never re-execute).
    RAISE NOTICE 'pg_cron not enabled — skipping prewarm scheduling (enable via Dashboard > Extensions)';
    RETURN;
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

-- Verification echo, guarded for blank-database replay (cron schema absent).
DO $$
DECLARE r RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RETURN;
  END IF;
  FOR r IN SELECT jobid, schedule, active FROM cron.job WHERE jobname = 'prewarm-consultations-toast' LOOP
    RAISE NOTICE 'prewarm job: id=% schedule=% active=%', r.jobid, r.schedule, r.active;
  END LOOP;
END $$;
