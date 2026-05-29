-- Rollback for migration 018_revenuecat_customer_aliases.sql
-- The revenuecat_customer_aliases table and its alias-resolution logic were
-- never wired into the active webhook handler (grant_tokens_idempotent uses
-- app_user_id directly). The associated TypeScript module revenuecat-alias-map.ts
-- had zero callers and was confirmed dead code.
DROP TABLE IF EXISTS public.revenuecat_customer_aliases CASCADE;
