-- Preserve one-time Free lifetime usage across paid upgrades/downgrades.
ALTER TABLE public.query_credits
  ADD COLUMN IF NOT EXISTS free_lifetime_used INT NOT NULL DEFAULT 0
  CHECK (free_lifetime_used >= 0);

-- Backfill from existing lifetime rows so previously consumed free credits are not lost.
UPDATE public.query_credits
SET free_lifetime_used = LEAST(
  2,
  GREATEST(
    COALESCE(free_lifetime_used, 0),
    CASE WHEN credits_type = 'lifetime' THEN COALESCE(credits_used, 0) ELSE 0 END
  )
);
