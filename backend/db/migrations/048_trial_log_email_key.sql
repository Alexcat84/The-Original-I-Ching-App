-- NO-OP: free trial email blocking already implemented in 046_trial_email_log.sql
--
-- Migration 046 created trial_email_log (SHA-256 email hash, no FK, no CASCADE)
-- and updated init_free_user to check that table first. Applying structural
-- changes to user_trial_log here would be redundant and would overwrite
-- init_free_user with a version that does NOT check trial_email_log.
--
-- This file is intentionally empty.

DO $$
BEGIN
  RAISE NOTICE 'Migration 048: no-op (free trial email guard already in 046).';
END $$;
