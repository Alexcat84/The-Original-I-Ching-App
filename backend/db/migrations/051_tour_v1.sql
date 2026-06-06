-- Track whether a user has completed (or skipped) the onboarding tour.
-- NULL = not yet seen; NOT NULL = completed/skipped at that timestamp.
-- Persists across app reinstalls unlike localStorage.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tour_v1_completed_at TIMESTAMPTZ DEFAULT NULL;
