-- Speed up account chat history hydration queries.
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_user_created_at
  ON public.consultation_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_user_session_position
  ON public.consultations(user_id, session_id, session_position ASC);

CREATE INDEX IF NOT EXISTS idx_consultations_session_created_at
  ON public.consultations(session_id, created_at DESC);
