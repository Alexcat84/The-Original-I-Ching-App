-- Guard against Warp "Thread killed by timeout manager" errors on cold TOAST reads.
--
-- When interpretation / oracle_bones pages are evicted from shared_buffers (server
-- restart, memory pressure), PostgREST's SELECT can stall for 10-15 s on disk I/O.
-- Warp kills HTTP handler threads at ~10 s, producing "Thread killed by timeout manager"
-- in the logs.  Two mitigations:
--
--   1. get_session_content_safe — SECURITY DEFINER function with statement_timeout = '8s'.
--      The query fails cleanly with error code 57014 before Warp can kill the thread.
--      The Next.js caller returns [] and Phase 2 degrades gracefully (user sees summaries).
--
--   2. pg_cron prewarm job (if the extension is enabled) — reads TOAST pages into
--      shared_buffers every 30 min so steady-state reads are <5 ms.

-- ─── 1. Bounded-timeout content fetch function ──────────────────────────────

CREATE OR REPLACE FUNCTION public.get_session_content_safe(
  p_user_id    uuid,
  p_session_id uuid
)
RETURNS TABLE(
  consultation_id uuid,
  interpretation  text,
  oracle_bones    jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '8s'
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id,
         c.interpretation,
         c.oracle_bones
  FROM   consultations c
  WHERE  c.session_id = p_session_id
    AND  c.user_id    = p_user_id
  ORDER  BY c.session_position ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_session_content_safe(uuid, uuid) TO service_role;

-- ─── 2. pg_cron prewarm job (conditional — only when extension is enabled) ──

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron not enabled — skipping prewarm job (enable via Dashboard > Extensions)';
    RETURN;
  END IF;

  -- Remove any stale job from a previous deploy before re-creating.
  BEGIN
    PERFORM cron.unschedule('prewarm-consultations-toast');
  EXCEPTION WHEN others THEN
    NULL;  -- job didn't exist yet, ignore
  END;

  PERFORM cron.schedule(
    'prewarm-consultations-toast',
    '*/30 * * * *',   -- every 30 minutes
    $cron$
      SELECT pg_prewarm('consultations');
      SELECT pg_prewarm(reltoastrelid)
      FROM   pg_class
      WHERE  relname       = 'consultations'
        AND  relnamespace  = 'public'::regnamespace
        AND  reltoastrelid <> 0;
    $cron$
  );

  RAISE NOTICE 'pg_cron prewarm job scheduled (every 30 min)';
END;
$do$;

-- ─── Verify ─────────────────────────────────────────────────────────────────

SELECT routine_name
FROM   information_schema.routines
WHERE  routine_schema = 'public'
  AND  routine_name   = 'get_session_content_safe';
