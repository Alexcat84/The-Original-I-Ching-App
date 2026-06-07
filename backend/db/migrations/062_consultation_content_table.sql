-- Phase 2 TOAST split — Step 1: create consultation_content table.
--
-- The consultations table carries ~270 MB of TOAST across interpretation and
-- oracle_bones columns (~4 MB/row × 65 rows).  Every chat-open triggers
-- get_session_content_safe → cold TOAST read → 10-15 s stall → Warp timeout.
--
-- Solution: move the TOAST columns to a dedicated table so:
--   • Metadata queries on consultations (sidebar, ordering) never touch TOAST.
--   • get_session_content_safe reads from this table exclusively (see 064).
--   • Phase 3 (future): null out original columns + VACUUM FULL reclaims 270 MB.

CREATE TABLE IF NOT EXISTS public.consultation_content (
  consultation_id UUID        PRIMARY KEY
    REFERENCES public.consultations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL,
  session_id      UUID        NOT NULL,
  interpretation  TEXT,
  oracle_bones    JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consultation_content ENABLE ROW LEVEL SECURITY;

-- RLS: same pattern as own_consultations — initplan form avoids per-row auth.uid() call.
CREATE POLICY own_content ON public.consultation_content
  FOR ALL
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Composite index for the primary read path: filter by session, keyed by user.
CREATE INDEX IF NOT EXISTS idx_consultation_content_user_session
  ON public.consultation_content (user_id, session_id);
