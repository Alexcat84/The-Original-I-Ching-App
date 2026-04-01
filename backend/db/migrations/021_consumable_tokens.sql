-- MIGRATION: Subscription -> Consumable Token Packs
-- Remove subscription cycle columns and move to balance-based packs.

ALTER TABLE public.query_credits
  DROP COLUMN IF EXISTS tier,
  DROP COLUMN IF EXISTS cycle_start,
  DROP COLUMN IF EXISTS cycle_end,
  DROP COLUMN IF EXISTS credits_type;

-- free_lifetime_used was used by the old tier model; no longer needed.
ALTER TABLE public.query_credits
  DROP COLUMN IF EXISTS free_lifetime_used;

ALTER TABLE public.query_credits
  ADD COLUMN IF NOT EXISTS total_purchased INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_pack TEXT NOT NULL DEFAULT 'free';

CREATE UNIQUE INDEX IF NOT EXISTS query_credits_user_id_key
  ON public.query_credits(user_id);

-- Atomic token grant called by RC webhook.
CREATE OR REPLACE FUNCTION public.grant_tokens(
  p_user_id UUID,
  p_tokens INTEGER,
  p_pack_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.query_credits
    (user_id, credits_total, credits_used, total_purchased, last_pack)
  VALUES
    (p_user_id, p_tokens, 0, p_tokens, p_pack_id)
  ON CONFLICT (user_id) DO UPDATE SET
    credits_total = public.query_credits.credits_total + p_tokens,
    total_purchased = public.query_credits.total_purchased + p_tokens,
    last_pack = p_pack_id,
    updated_at = NOW();
END;
$$;

-- Idempotent free bootstrap: each user receives 2 free tokens once.
CREATE OR REPLACE FUNCTION public.init_free_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.query_credits
    (user_id, credits_total, credits_used, total_purchased, last_pack)
  VALUES
    (p_user_id, 2, 0, 0, 'free')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Consume one token atomically.
-- Returns remaining tokens after consume, or -1 if none.
CREATE OR REPLACE FUNCTION public.consume_token(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  UPDATE public.query_credits
  SET
    credits_total = credits_total - 1,
    credits_used = credits_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND credits_total > 0
  RETURNING credits_total INTO v_remaining;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  RETURN v_remaining;
END;
$$;
