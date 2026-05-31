-- Hardens the free-trial guard against the delete-and-re-register abuse pattern.
--
-- Problem: user_trial_log used user_id UUID as primary key with ON DELETE CASCADE.
-- Deleting the auth.users row cascaded to delete the trial log entry, so a user
-- who deleted their account and re-registered with the same email received 2 free
-- tokens again on every re-registration cycle.
--
-- Fix: make email the natural key for trial uniqueness. The email record now
-- survives account deletion (user_id is SET NULL, email stays). Re-registering
-- with the same email is blocked because the email row still exists.

-- ── 1. Add email column (nullable for backfill first) ────────────────────────
ALTER TABLE public.user_trial_log ADD COLUMN IF NOT EXISTS email TEXT;

-- ── 2. Backfill from auth.users for existing rows ───────────────────────────
UPDATE public.user_trial_log utl
SET email = au.email
FROM auth.users au
WHERE au.id = utl.user_id
  AND (utl.email IS NULL OR utl.email = '');

-- ── 3. Drop rows we cannot associate with an email (orphaned by prior deletions)
DELETE FROM public.user_trial_log WHERE email IS NULL OR email = '';

-- ── 4. Enforce NOT NULL on email ─────────────────────────────────────────────
ALTER TABLE public.user_trial_log ALTER COLUMN email SET NOT NULL;

-- ── 5. Replace user_id PK with email PK ─────────────────────────────────────
ALTER TABLE public.user_trial_log DROP CONSTRAINT IF EXISTS user_trial_log_pkey;
ALTER TABLE public.user_trial_log ADD PRIMARY KEY (email);

-- ── 6. Change user_id FK: nullable + SET NULL on delete ─────────────────────
ALTER TABLE public.user_trial_log DROP CONSTRAINT IF EXISTS user_trial_log_user_id_fkey;
ALTER TABLE public.user_trial_log ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.user_trial_log
  ADD CONSTRAINT user_trial_log_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

-- ── 7. Update init_free_user to check by email (survives account deletion) ──
CREATE OR REPLACE FUNCTION public.init_free_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Resolve current email for this user_id.
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IS NULL OR v_email = '' THEN
    RETURN;  -- Cannot determine email — skip silently.
  END IF;

  -- Block if this email or this user_id already received a free trial.
  IF EXISTS (
    SELECT 1 FROM public.user_trial_log
    WHERE email = v_email OR user_id = p_user_id
  ) THEN
    RETURN;
  END IF;

  -- Block if credits row already exists (e.g. paid purchase before first login).
  IF EXISTS (
    SELECT 1 FROM public.query_credits WHERE user_id = p_user_id
  ) THEN
    -- Record the trial without granting tokens (user already has paid credits).
    INSERT INTO public.user_trial_log (email, user_id)
    VALUES (v_email, p_user_id)
    ON CONFLICT (email) DO NOTHING;
    RETURN;
  END IF;

  -- Grant 2 free tokens and record trial atomically.
  WITH ins AS (
    INSERT INTO public.query_credits (user_id, credits_total, credits_used, total_purchased, last_pack)
    VALUES (p_user_id, 2, 0, 0, 'free')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id
  )
  INSERT INTO public.user_trial_log (email, user_id)
  SELECT v_email, ins.user_id
  FROM ins
  ON CONFLICT (email) DO NOTHING;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE 'Migration 048: user_trial_log now keyed by email; ON DELETE SET NULL on user_id.';
END $$;
