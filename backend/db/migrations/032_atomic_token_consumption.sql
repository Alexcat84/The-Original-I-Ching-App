-- MIGRATION: Atomic Token Consumption
-- 1) Update consume_token to accept tokens_to_consume parameter.
-- 2) Deduct all tokens in a single atomic UPDATE, preventing race conditions.
-- 3) Return the remaining balance after deduction or -1 if insufficient.

CREATE OR REPLACE FUNCTION public.consume_token(p_user_id UUID, tokens_to_consume INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  UPDATE public.query_credits
  SET
    credits_total = credits_total - tokens_to_consume,
    credits_used = credits_used + tokens_to_consume,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND credits_total >= tokens_to_consume
  RETURNING credits_total INTO v_remaining;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  RETURN v_remaining;
END;
$$;
