-- Protect last_pack from tier downgrade in grant_tokens.
--
-- Before this migration, grant_tokens unconditionally overwrote last_pack with
-- the incoming pack ID (ON CONFLICT DO UPDATE ... last_pack = p_pack_id). This
-- meant a Master user who bought a Seeker pack to top up tokens would have their
-- last_pack silently downgraded to tokens_seeker_20, reducing their thread depth
-- from 8 to 3 messages per session.
--
-- Pack tier order (ascending): free < tokens_seeker_20 < tokens_practitioner_40
--                               < tokens_master_100
--
-- Rule: last_pack only moves UP, never down.

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
    last_pack = CASE
      -- Master is the ceiling — never downgrade from it.
      WHEN public.query_credits.last_pack = 'tokens_master_100'
        THEN 'tokens_master_100'
      -- Practitioner stays unless the new purchase is Master.
      WHEN public.query_credits.last_pack = 'tokens_practitioner_40'
        AND p_pack_id <> 'tokens_master_100'
        THEN 'tokens_practitioner_40'
      -- Any other case (Seeker→Practitioner/Master, Free→anything): use new pack.
      ELSE p_pack_id
    END,
    updated_at = NOW();
END;
$$;

DO $$
BEGIN
  RAISE NOTICE 'grant_tokens updated: last_pack is now tier-protected (never downgraded).';
END $$;
