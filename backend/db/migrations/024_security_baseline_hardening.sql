-- Security baseline hardening:
-- 1) Fix mutable search_path warnings for token RPC functions
-- 2) Eliminate RLS advisor findings by enabling RLS on admin_runtime_config
-- 3) Add explicit deny-all policies to internal tables that are service-role only

-- ---------------------------------------------------------------------------
-- Functions: immutable search_path
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.grant_tokens(
  p_user_id UUID,
  p_tokens INTEGER,
  p_pack_id TEXT
)
RETURNS void
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
    credits_total = public.query_credits.credits_total + p_tokens,
    total_purchased = public.query_credits.total_purchased + p_tokens,
    last_pack = p_pack_id,
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_token(p_user_id UUID)
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

-- ---------------------------------------------------------------------------
-- Internal tables: explicit service-role-only posture
-- ---------------------------------------------------------------------------

ALTER TABLE public.admin_runtime_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenuecat_customer_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenuecat_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trial_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_runtime_config FROM anon, authenticated;
REVOKE ALL ON TABLE public.revenuecat_customer_aliases FROM anon, authenticated;
REVOKE ALL ON TABLE public.revenuecat_webhook_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_trial_log FROM anon, authenticated;

DROP POLICY IF EXISTS "admin_runtime_config_deny_all" ON public.admin_runtime_config;
CREATE POLICY "admin_runtime_config_deny_all"
  ON public.admin_runtime_config
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "revenuecat_customer_aliases_deny_all" ON public.revenuecat_customer_aliases;
CREATE POLICY "revenuecat_customer_aliases_deny_all"
  ON public.revenuecat_customer_aliases
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "revenuecat_webhook_events_deny_all" ON public.revenuecat_webhook_events;
CREATE POLICY "revenuecat_webhook_events_deny_all"
  ON public.revenuecat_webhook_events
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "user_trial_log_deny_all" ON public.user_trial_log;
CREATE POLICY "user_trial_log_deny_all"
  ON public.user_trial_log
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

