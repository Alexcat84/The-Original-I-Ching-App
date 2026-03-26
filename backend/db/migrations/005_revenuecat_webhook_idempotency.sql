-- Idempotency ledger for RevenueCat webhooks.
-- Prevents duplicate processing when RevenueCat retries the same event payload.

CREATE TABLE IF NOT EXISTS public.revenuecat_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  event_hash TEXT NOT NULL UNIQUE,
  event_type TEXT,
  app_user_id UUID,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenuecat_webhook_events_user_processed
  ON public.revenuecat_webhook_events (app_user_id, processed_at DESC);
