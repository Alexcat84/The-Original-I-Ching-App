-- Correct migration 043: allow intentional tier downgrades in grant_tokens.
--
-- Migration 043 was too strict — it prevented a Master user from purchasing a
-- Seeker pack (economic downgrade). That IS a valid user action: last_pack should
-- reflect the most recently purchased pack, not a permanent ceiling.
--
-- The real invariant is simpler:
--   - last_pack is ONLY set by actual purchases (tokens_seeker_20 / practitioner_40
--     / master_100). 'free' is never a purchasable product, so it can never arrive
--     here from a legitimate webhook call.
--   - Tokens always accumulate (credits_total += p_tokens). They never expire.
--   - Running out of tokens leaves last_pack intact (consume_token does not touch it).
--
-- This migration restores the original last_pack = p_pack_id behaviour, adding
-- only a belt-and-suspenders guard against the impossible case of p_pack_id = 'free'.

CREATE OR REPLACE FUNCTION public.grant_tokens(
  p_user_id  UUID,
  p_tokens   INTEGER,
  p_pack_id  TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.query_credits
    (user_id, credits_total, credits_used, total_purchased, last_pack)
  VALUES
    (p_user_id, p_tokens, 0, p_tokens, p_pack_id)
  ON CONFLICT (user_id) DO UPDATE SET
    credits_total   = public.query_credits.credits_total + p_tokens,
    total_purchased = public.query_credits.total_purchased + p_tokens,
    -- Allow any valid paid pack, including intentional downgrades (e.g. Master → Seeker).
    -- Only guard against 'free' arriving as p_pack_id, which should never happen because
    -- 'free' is not a RevenueCat product — it's the initial DB default only.
    last_pack = CASE
      WHEN p_pack_id = 'free' THEN public.query_credits.last_pack
      ELSE p_pack_id
    END,
    updated_at = NOW();
END;
$$;

DO $$
BEGIN
  RAISE NOTICE 'grant_tokens updated: downgrades allowed; only free is guarded.';
END $$;
