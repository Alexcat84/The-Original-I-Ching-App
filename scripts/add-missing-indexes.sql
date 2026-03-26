-- Optional: run after reviewing existing indexes in verify-db.sql.
CREATE INDEX IF NOT EXISTS idx_consultations_user_created
  ON public.consultations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_public_sharing
  ON public.consultations (public_sharing_id) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_consultation_sessions_user_created
  ON public.consultation_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_credits_user
  ON public.query_credits (user_id);

CREATE INDEX IF NOT EXISTS idx_two_factor_attempts_user_created
  ON public.two_factor_attempts (user_id, created_at DESC);
