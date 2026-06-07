-- Phase 2 TOAST split — Step 3: trigger + updated read function.
--
-- Two changes:
--   1. sync_consultation_content trigger: keeps consultation_content current whenever
--      consultations is written (new consultations + future interpretation edits).
--   2. get_session_content_safe: retargeted to read from consultation_content instead
--      of consultations.  All invariants preserved (SECURITY INVOKER, 2s timeout,
--      EXCEPTION handler, REVOKE from anon/authenticated).
--   3. pg_cron prewarm job updated to warm consultation_content TOAST pages.

-- ─── Trigger function ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_consultation_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.consultation_content (
    consultation_id,
    user_id,
    session_id,
    interpretation,
    oracle_bones,
    created_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.session_id,
    NEW.interpretation,
    NEW.oracle_bones,
    COALESCE(NEW.created_at, now())
  )
  ON CONFLICT (consultation_id) DO UPDATE SET
    interpretation = EXCLUDED.interpretation,
    oracle_bones   = EXCLUDED.oracle_bones;

  RETURN NEW;
END;
$$;

-- Trigger functions invoked by PostgreSQL internally — no direct-call grants needed.
REVOKE ALL ON FUNCTION public.sync_consultation_content() FROM PUBLIC;

CREATE OR REPLACE TRIGGER trg_sync_consultation_content
  AFTER INSERT OR UPDATE OF interpretation, oracle_bones
  ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_consultation_content();

-- ─── Updated read function ───────────────────────────────────────────────────
--
-- Reads TOAST from consultation_content (isolated TOAST pages, separate table).
-- JOINs consultations only for session_position ordering — a non-TOAST heap column,
-- always fast regardless of shared_buffers state.
-- Returns [] on timeout (same as before), caller degrades to interpretation_summary.

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
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  SET LOCAL statement_timeout = '2000';

  RETURN QUERY
  SELECT cc.consultation_id,
         cc.interpretation,
         cc.oracle_bones
  FROM   public.consultation_content cc
  JOIN   public.consultations        c  ON c.id = cc.consultation_id
  WHERE  cc.session_id = p_session_id
    AND  cc.user_id    = p_user_id
  ORDER  BY c.session_position ASC;

EXCEPTION
  WHEN query_canceled THEN
    RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.get_session_content_safe(uuid, uuid) TO service_role;

-- ─── pg_cron prewarm job — retarget to consultation_content ─────────────────
--
-- After Phase 2, get_session_content_safe reads TOAST from consultation_content,
-- not consultations.  Warm consultation_content TOAST every 15 min so the first
-- chat-open after a quiet period still completes within the 2s timeout.

DO $$
BEGIN
  PERFORM cron.unschedule('prewarm-consultations-toast');
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

SELECT cron.schedule(
  'prewarm-consultations-toast',
  '*/15 * * * *',
  $$
    SELECT pg_prewarm('consultation_content', 'buffer', 'main');
    SELECT pg_prewarm('consultation_content', 'buffer', 'toast');
  $$
);
