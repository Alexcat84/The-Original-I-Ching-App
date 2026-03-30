-- Hardening for environments where query_credits schema drifted.
-- Ensures columns expected by billing runtime exist.

ALTER TABLE public.query_credits
  ADD COLUMN IF NOT EXISTS credits_type TEXT;

UPDATE public.query_credits
SET credits_type = 'monthly'
WHERE credits_type IS NULL;

ALTER TABLE public.query_credits
  ALTER COLUMN credits_type SET DEFAULT 'monthly';

ALTER TABLE public.query_credits
  ALTER COLUMN credits_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'query_credits_credits_type_check'
      AND conrelid = 'public.query_credits'::regclass
  ) THEN
    ALTER TABLE public.query_credits
      ADD CONSTRAINT query_credits_credits_type_check
      CHECK (credits_type IN ('monthly', 'lifetime'));
  END IF;
END $$;
