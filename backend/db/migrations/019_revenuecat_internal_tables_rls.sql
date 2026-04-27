-- Harden internal RevenueCat tables used by server-only flows.
-- These tables should never be directly readable by anon/authenticated clients.

ALTER TABLE public.revenuecat_customer_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenuecat_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.revenuecat_customer_aliases FROM anon, authenticated;
REVOKE ALL ON TABLE public.revenuecat_webhook_events FROM anon, authenticated;

