-- Fix init_free_user search_path for pgcrypto (digest function)
--
-- Migration 046 introduced a digest() call to hash the user's email, but the
-- SECURITY DEFINER function had `SET search_path = public`. In Supabase, pgcrypto
-- is installed in the `extensions` schema. This caused the digest() call to throw
-- a "function does not exist" error, which rolled back the handle_new_auth_user
-- trigger and completely blocked account creation/login for re-registering users.
--
-- This migration updates the search_path to `public, extensions` so the digest()
-- function resolves correctly.

CREATE OR REPLACE FUNCTION public.init_free_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_email      TEXT;
  v_email_hash TEXT;
BEGIN
  -- Resolve and hash the user's email.
  SELECT lower(trim(email)) INTO v_email
  FROM auth.users
  WHERE id = p_user_id;

  IF v_email IS NOT NULL AND v_email <> '' THEN
    v_email_hash := encode(digest(v_email, 'sha256'), 'hex');

    -- Email already used a free trial in a previous account registration.
    -- Provision the credits row with 0 tokens — the email forfeited its trial.
    IF EXISTS (SELECT 1 FROM public.trial_email_log WHERE email_hash = v_email_hash) THEN
      INSERT INTO public.query_credits
        (user_id, credits_total, credits_used, total_purchased, last_pack)
      VALUES (p_user_id, 0, 0, 0, 'free')
      ON CONFLICT (user_id) DO NOTHING;
      RETURN;
    END IF;
  END IF;

  -- First-time email: grant 2 free tokens (original logic preserved).
  WITH ins AS (
    INSERT INTO public.query_credits (user_id, credits_total, credits_used, total_purchased, last_pack)
    SELECT p_user_id, 2, 0, 0, 'free'
    WHERE NOT EXISTS (SELECT 1 FROM public.user_trial_log t WHERE t.user_id = p_user_id)
      AND NOT EXISTS (SELECT 1 FROM public.query_credits c WHERE c.user_id = p_user_id)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id
  )
  INSERT INTO public.user_trial_log (user_id)
  SELECT ins.user_id FROM ins
  ON CONFLICT (user_id) DO NOTHING;

  -- Record the email hash permanently so future re-registrations are blocked.
  IF v_email_hash IS NOT NULL THEN
    INSERT INTO public.trial_email_log (email_hash)
    VALUES (v_email_hash)
    ON CONFLICT (email_hash) DO NOTHING;
  END IF;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE 'Migration 048 applied: init_free_user search_path fixed to include extensions schema.';
END $$;
