-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 076 · Fix the weekly VACUUM job (broken since 070)
--
-- PROBLEM
-- Migration 070 scheduled the job with three separate statements:
--
--   VACUUM ANALYZE public.consultation_content;
--   VACUUM ANALYZE public.consultations;
--   VACUUM ANALYZE public.consultation_sessions;
--
-- pg_cron sends the job command through the simple query protocol. Postgres
-- wraps a multi-statement command in an implicit transaction block, and VACUUM
-- cannot run inside one. Every single execution failed with SQLSTATE 25001,
-- "VACUUM cannot run inside a transaction block", from 2026-06-10 onward:
-- roughly eleven consecutive Sundays in production, silently.
--
-- It went unnoticed because the gate in verify_migrations.sql only asserted the
-- job was REGISTERED, never that it succeeded. Registration was always true.
--
-- FIX
-- VACUUM accepts a table list, so the same work fits in ONE statement. A single
-- statement is not wrapped in a transaction block, so VACUUM is allowed.
-- Splitting into three cron jobs would also work, but one statement keeps a
-- single schedule entry and cannot drift out of sync.
--
-- Not destructive: touches only pg_cron scheduling, no application data.
-- Safe to re-run: unschedule is guarded, and cron.schedule upserts by job name.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop the broken job before recreating it. Guarded because cron.unschedule
-- raises if the job does not exist (blank-DB replay reaches here with no job).
SELECT cron.unschedule('weekly-vacuum-iching')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-vacuum-iching'
);

-- One statement, three tables. Do NOT add a second statement or a semicolon
-- separator here: that reintroduces the transaction block and the job dies
-- again with 25001. The gate for 076 enforces this.
SELECT cron.schedule(
  'weekly-vacuum-iching',
  '0 4 * * 0',  -- Every Sunday at 04:00 UTC (low-traffic window)
  $$VACUUM (ANALYZE) public.consultation_content, public.consultations, public.consultation_sessions$$
);
