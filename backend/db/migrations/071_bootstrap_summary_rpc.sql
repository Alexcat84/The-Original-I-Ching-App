-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 071 · get_user_session_summaries RPC
--
-- Replaces the two-query pattern in getUserSessionSummaries (session-store.ts):
--   Query 1: SELECT * FROM consultation_sessions WHERE user_id = $1
--   Query 2: SELECT ... FROM consultations WHERE user_id = $1
-- with a single JOIN executed in Postgres. Reduces PostgREST connections per
-- bootstrap from 5 to 3 (two queries → one RPC call).
--
-- Security: SECURITY DEFINER so service_role can call it; anon/authenticated
-- are explicitly revoked to prevent direct REST calls.
-- Safe to re-run: CREATE OR REPLACE.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_session_summaries(p_user_id UUID)
RETURNS TABLE (
  session_id            UUID,
  title                 TEXT,
  theme_category        TEXT,
  language              TEXT,
  public_sharing_id     TEXT,
  session_created_at    TIMESTAMPTZ,
  consultation_count    BIGINT,
  first_question        TEXT,
  first_consultation_at TIMESTAMPTZ,
  last_consultation_at  TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cs.id,
    cs.title,
    cs.theme_category,
    cs.language,
    cs.public_sharing_id,
    cs.created_at,
    COUNT(c.id)::BIGINT,
    -- First question from the earliest consultation in the session (by session_position).
    (
      SELECT c_first.question
      FROM consultations c_first
      WHERE c_first.session_id = cs.id
        AND c_first.user_id    = p_user_id
      ORDER BY c_first.session_position ASC
      LIMIT 1
    ),
    MIN(c.created_at),
    MAX(c.created_at)
  FROM consultation_sessions cs
  LEFT JOIN consultations c
    ON c.session_id = cs.id
    AND c.user_id   = p_user_id
  WHERE cs.user_id = p_user_id
  GROUP BY
    cs.id, cs.title, cs.theme_category, cs.language,
    cs.public_sharing_id, cs.created_at
  ORDER BY cs.created_at DESC;
$$;

-- Only service_role (server-side) may call this function.
REVOKE EXECUTE ON FUNCTION public.get_user_session_summaries(UUID) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_user_session_summaries(UUID) TO service_role;
