-- Block free trial re-grant after account delete + re-register with same email.
--
-- Root cause: user_trial_log has ON DELETE CASCADE on public.users. When a user
-- deletes their account, the trial record is wiped. Re-registering with the same
-- Google/email address gets a fresh UUID and a new free trial — infinite free
-- consultations via delete→re-register loop.
--
-- Solution: a separate `trial_email_log` table that stores the SHA-256 hash of
-- the lowercase email. This table has NO foreign key to users — it is NEVER
-- cascaded and persists permanently across account deletions.
--
-- init_free_user is updated to check trial_email_log FIRST (permanent guard),
-- then falls back to the existing user_trial_log check (UUID guard).
-- Raw email is never stored — only a one-way hash.

-- ── Permanent email trial log ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.trial_email_log (
  email_hash       TEXT        PRIMARY KEY,
  first_granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.trial_email_log IS
  'Immutable record of email hashes that have received the 2-token free trial. '
  'Not linked to users — survives account deletion to block delete+re-register abuse.';

ALTER TABLE public.trial_email_log ENABLE ROW LEVEL SECURITY;
-- No public/anon policies: all writes go through the SECURITY DEFINER function.

-- ── Backfill from existing trial records ──────────────────────────────────────

INSERT INTO public.trial_email_log (email_hash, first_granted_at)
SELECT
  encode(digest(lower(trim(au.email)), 'sha256'), 'hex'),
  utl.granted_at
FROM public.user_trial_log utl
JOIN auth.users au ON au.id = utl.user_id
WHERE au.email IS NOT NULL
  AND trim(au.email) <> ''
ON CONFLICT (email_hash) DO NOTHING;

-- ── Updated init_free_user ─────────────────────────────────────────────────────
-- Checks trial_email_log (email hash, permanent) before user_trial_log (UUID,
-- ephemeral). If the email has already been used for a free trial in any previous
-- account, the new account gets 0 tokens instead of 2.

CREATE OR REPLACE FUNCTION public.init_free_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  RAISE NOTICE 'Migration 046: trial_email_log created. Free trial now blocked by email across account deletions.';
END $$;
