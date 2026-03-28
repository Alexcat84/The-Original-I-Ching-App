-- Tiers v4: add lifetime semantics for Free and reset existing Free users from deployment.
ALTER TABLE public.query_credits
  ADD COLUMN IF NOT EXISTS credits_type TEXT NOT NULL DEFAULT 'monthly'
  CHECK (credits_type IN ('monthly', 'lifetime'));

-- Align Free users to lifetime trial and start-now migration policy.
UPDATE public.query_credits
SET
  credits_total = 2,
  credits_used = 0,
  credits_type = 'lifetime',
  cycle_start = NOW(),
  cycle_end = '2999-12-31T00:00:00.000Z'::timestamptz,
  updated_at = NOW()
WHERE tier = 'free';

-- Keep paid tiers as monthly.
UPDATE public.query_credits
SET credits_type = 'monthly'
WHERE tier IN ('seeker', 'practitioner', 'master', 'oracle');

-- Optional retention field for projects that already have a subscriptions table.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD COLUMN IF NOT EXISTS subscription_inactive_since TIMESTAMPTZ;
  END IF;
END $$;
