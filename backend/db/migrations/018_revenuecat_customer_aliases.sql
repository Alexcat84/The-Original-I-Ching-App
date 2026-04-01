-- Persist RevenueCat alias graph for legacy anonymous->identified customers.
-- Allows backend portal-session flows to resolve canonical `$RCAnonymousID` from a Supabase UUID.

CREATE TABLE IF NOT EXISTS public.revenuecat_customer_aliases (
  id BIGSERIAL PRIMARY KEY,
  app_user_id TEXT NOT NULL UNIQUE,
  canonical_app_user_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'webhook',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenuecat_customer_aliases_canonical
  ON public.revenuecat_customer_aliases (canonical_app_user_id);

