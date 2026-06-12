-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 072 · refund_token RPC + token_refund_log
--
-- Compensación atómica de consume_token (032) ante fallo post-cobro.
-- Audit CRIT-02. Solo invocable por service_role.
--
-- Política de reembolso (plan de acción 2026-06-11 §2.4, §2.5):
--   - tokens > 0 → reembolso real; credits_total += tokens, credits_used -= tokens
--   - tokens = 0 → registro de auditoría sin reembolso (stream con fragmentos ya
--     entregados: la lectura existe, resolución manual vía grant_tokens si el
--     usuario reclama)
--   - verificación pre-reembolso en app (§2.5): si la consulta existe en DB
--     (éxito ambiguo: upsert confirmado pero respuesta HTTP perdida), la ruta
--     hace return temprano con log de aplicación — NO registra en esta tabla.
--     refund_token nunca es invocado para skips; la tabla solo contiene
--     reembolsos reales (tokens > 0) y registros de streaming (tokens = 0).
--
-- Safe to re-run: CREATE OR REPLACE / CREATE TABLE IF NOT EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.token_refund_log (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID NOT NULL,
  tokens     INTEGER NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS token_refund_log_user_idx
  ON public.token_refund_log (user_id, created_at DESC);

ALTER TABLE public.token_refund_log ENABLE ROW LEVEL SECURITY;
-- No policies: service-role-only posture (same as admin_runtime_config in 024).

CREATE OR REPLACE FUNCTION public.refund_token(
  p_user_id UUID,
  p_tokens  INTEGER,
  p_reason  TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  -- Guard: negative p_tokens would consume tokens via this function.
  IF p_tokens IS NULL OR p_tokens < 0 THEN
    RETURN -1;
  END IF;

  -- tokens = 0: audit record without actual refund (§2.4 streaming case).
  IF p_tokens = 0 THEN
    INSERT INTO public.token_refund_log (user_id, tokens, reason)
    VALUES (p_user_id, 0, p_reason);
    RETURN 0;
  END IF;

  UPDATE public.query_credits
  SET
    credits_total = credits_total + p_tokens,
    credits_used  = GREATEST(0, credits_used - p_tokens),
    updated_at    = NOW()
  WHERE user_id = p_user_id
  RETURNING credits_total INTO v_remaining;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  INSERT INTO public.token_refund_log (user_id, tokens, reason)
  VALUES (p_user_id, p_tokens, p_reason);

  RETURN v_remaining;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refund_token(UUID, INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_token(UUID, INTEGER, TEXT)
  TO service_role;

DO $$
BEGIN
  RAISE NOTICE 'refund_token + token_refund_log created and secured to service_role.';
END $$;
