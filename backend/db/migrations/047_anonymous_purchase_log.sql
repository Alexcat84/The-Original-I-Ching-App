-- Stores RevenueCat webhook events where app_user_id is a $RCAnonymousID.
-- These purchases are real but cannot be automatically attributed to a Supabase user.
-- Support must resolve them manually: find the user, run grant_tokens_idempotent,
-- then mark the row resolved.

CREATE TABLE IF NOT EXISTS public.anonymous_purchase_log (
  id              BIGSERIAL PRIMARY KEY,
  event_hash      TEXT        NOT NULL UNIQUE,
  event_type      TEXT        NOT NULL,
  rc_anonymous_id TEXT        NOT NULL,
  product_id      TEXT        NOT NULL,
  tokens          INTEGER     NOT NULL,
  raw_event       JSONB,
  resolved        BOOLEAN     NOT NULL DEFAULT FALSE,
  resolved_for    UUID,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.anonymous_purchase_log IS
  'RC webhook purchases received with $RCAnonymousID — need manual user attribution.';

-- Only service role can touch this table (no user-facing RLS needed).
ALTER TABLE public.anonymous_purchase_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE 'Migration 047: anonymous_purchase_log created.';
END $$;
