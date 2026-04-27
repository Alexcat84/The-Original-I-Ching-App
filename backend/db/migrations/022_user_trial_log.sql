-- Immutable record: free trial (2 lifetime tokens) was granted via init_free_user.
-- Prevents re-granting if query_credits row is deleted or recreated.

CREATE TABLE public.user_trial_log (
  user_id UUID PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_trial_log IS
  'Set once when init_free_user inserts the 2-token free bootstrap. Blocks repeat free trial even if query_credits is removed.';

ALTER TABLE public.user_trial_log ENABLE ROW LEVEL SECURITY;

-- Backfill: anyone who already has billing state must not receive another bootstrap via init.
INSERT INTO public.user_trial_log (user_id)
SELECT qc.user_id
FROM public.query_credits qc
ON CONFLICT (user_id) DO NOTHING;

-- Atomic: insert free row only if no trial log and no credits row; then record trial in same statement.
CREATE OR REPLACE FUNCTION public.init_free_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH ins AS (
    INSERT INTO public.query_credits (user_id, credits_total, credits_used, total_purchased, last_pack)
    SELECT
      p_user_id,
      2,
      0,
      0,
      'free'
    WHERE NOT EXISTS (SELECT 1 FROM public.user_trial_log t WHERE t.user_id = p_user_id)
      AND NOT EXISTS (SELECT 1 FROM public.query_credits c WHERE c.user_id = p_user_id)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id
  )
  INSERT INTO public.user_trial_log (user_id)
  SELECT ins.user_id
  FROM ins
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;
