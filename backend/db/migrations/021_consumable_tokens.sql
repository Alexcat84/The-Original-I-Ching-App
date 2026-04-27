-- MIGRATION: Subscription -> Consumable Token Packs
-- Remove subscription cycle columns and move to balance-based packs.
-- NOTE: grant_tokens, consume_token, and init_free_user are defined in their
-- final form by 024_security_baseline_hardening.sql and 022_user_trial_log.sql.

ALTER TABLE public.query_credits
  DROP COLUMN IF EXISTS tier,
  DROP COLUMN IF EXISTS cycle_start,
  DROP COLUMN IF EXISTS cycle_end,
  DROP COLUMN IF EXISTS credits_type,
  DROP COLUMN IF EXISTS free_lifetime_used;

ALTER TABLE public.query_credits
  ADD COLUMN IF NOT EXISTS total_purchased INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_pack TEXT NOT NULL DEFAULT 'free';

CREATE UNIQUE INDEX IF NOT EXISTS query_credits_user_id_key
  ON public.query_credits(user_id);
