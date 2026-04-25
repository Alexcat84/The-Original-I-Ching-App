-- =============================================================================
-- PURGE: remove all auth + app data except two accounts (Supabase SQL Editor)
-- =============================================================================
-- KEEP (do not edit unless you change the accounts to preserve):
--   oalabi353@gmail.com      -> 4c64ca26-37ad-41b6-b9c6-8a96ad2dd6f9
--   alexcatbaster@gmail.com  -> 9aa235ee-7950-496b-a5c7-a6817845b746
--      (Confirm UUID in Auth > Users; if your row differs, edit both INSERT lines.)
--
-- This script:
--   1) Deletes RevenueCat ledger rows tied to users you are removing (no FK).
--   2) Deletes RevenueCat alias rows referencing those UUIDs as text.
--   3) Deletes auth.users for everyone else. Trigger `on_auth_user_deleted`
--      removes public.users first; ON DELETE CASCADE clears public children.
--
-- DANGER: irreversible. Run on STAGING first. Review output of the SELECT
-- before the DELETE block. Use a transaction; COMMIT only when satisfied.
-- =============================================================================

BEGIN;

CREATE TEMP TABLE _keep_users (id UUID PRIMARY KEY) ON COMMIT DROP;
INSERT INTO _keep_users (id) VALUES
  ('4c64ca26-37ad-41b6-b9c6-8a96ad2dd6f9'::uuid),
  ('9aa235ee-7950-496b-a5c7-a6817845b746'::uuid);

-- Preview emails that will be REMOVED (must match what you expect)
SELECT u.id, u.email
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM _keep_users k WHERE k.id = u.id)
ORDER BY u.email;

-- Preview count
SELECT count(*)::int AS users_to_delete
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM _keep_users k WHERE k.id = u.id);

-- RevenueCat: webhook idempotency (app_user_id is UUID, no FK to users)
DELETE FROM public.revenuecat_webhook_events e
WHERE e.app_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM _keep_users k WHERE k.id = e.app_user_id);

-- RevenueCat: aliases stored as TEXT (UUID strings or anonymous IDs)
DELETE FROM public.revenuecat_customer_aliases a
WHERE (
    a.canonical_app_user_id ~ '^[0-9a-fA-F-]{36}$'
    AND NOT EXISTS (
      SELECT 1 FROM _keep_users k WHERE k.id = a.canonical_app_user_id::uuid
    )
  )
  OR (
    a.app_user_id ~ '^[0-9a-fA-F-]{36}$'
    AND NOT EXISTS (
      SELECT 1 FROM _keep_users k WHERE k.id = a.app_user_id::uuid
    )
  );

-- Auth: removes identities/sessions per Supabase cascade; trigger deletes public.users + cascades
DELETE FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM _keep_users k WHERE k.id = u.id);

-- Sanity: only two public.users left (should match _keep_users)
SELECT id, email FROM public.users ORDER BY email;

COMMIT;
