-- Rewrite get_session_content_safe to guarantee HTTP 200 (not error) on cold TOAST.
--
-- Root cause of persistent "Thread killed by timeout manager":
--   The Warp HTTP server timeout is shorter than our previous statement_timeout = '8s'.
--   Cold TOAST reads stall 10-15 s; Warp kills the HTTP thread before PostgreSQL can
--   return the 8 s timeout error — so the guard never fires from Warp's perspective.
--
-- Fix: two changes in the function body (not the definition):
--   1. SET LOCAL statement_timeout = '2000' — 2 s, safely under any Warp threshold.
--   2. EXCEPTION WHEN query_canceled THEN RETURN — catches the timeout and returns 0 rows.
--      PostgREST sees RETURNS TABLE with 0 rows → sends HTTP 200 (not 500).
--      Warp's HTTP thread completes in ≤2 s → timeout manager never fires.
--
-- Warm-buffer path: TOAST already in shared_buffers → query completes in <1 ms, full
-- content returned. 2 s provides ample margin even under heavy server load.

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
  -- 2 s is safely under any Warp HTTP timeout observed on Supabase Pro.
  -- Warm TOAST reads complete in <1 ms; this only activates on cold buffer.
  SET LOCAL statement_timeout = '2000';

  RETURN QUERY
  SELECT c.id,
         c.interpretation,
         c.oracle_bones
  FROM   consultations c
  WHERE  c.session_id = p_session_id
    AND  c.user_id    = p_user_id
  ORDER  BY c.session_position ASC;

EXCEPTION
  WHEN query_canceled THEN
    -- statement_timeout fired — TOAST cold, query stalled.
    -- Returning 0 rows gives PostgREST a clean 200 OK response.
    -- Warp HTTP thread completes immediately; no "Thread killed by timeout manager".
    -- The Next.js caller receives [] and degrades to interpretation_summary placeholders.
    RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.get_session_content_safe(uuid, uuid) TO service_role;

-- Verify: function exists and is SECURITY INVOKER
SELECT routine_name, security_type
FROM   information_schema.routines
WHERE  routine_schema = 'public'
  AND  routine_name   = 'get_session_content_safe';
