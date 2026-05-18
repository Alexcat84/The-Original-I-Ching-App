-- Add index on consultations.session_id to prevent statement timeouts
-- when deleting all consultations belonging to a session.
-- The DELETE in deleteUserSession filters by both session_id and user_id;
-- session_id alone is selective enough to avoid a full-table scan.
CREATE INDEX IF NOT EXISTS idx_consultations_session_id
  ON public.consultations (session_id);
