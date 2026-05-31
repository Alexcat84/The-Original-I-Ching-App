-- Auto-populate display_name for Google OAuth users.
--
-- Problem: display_name was only set by frontend code that read user_metadata
-- from the cached Supabase session (getSession()). On token refresh the JWT
-- may not re-include full_name, so the check silently fell through and left
-- display_name as NULL — even though full_name exists in auth.users.
--
-- Solution A (this migration): BEFORE INSERT trigger on public.users.
--   When a new public.users row is created, if the auth.users record belongs
--   to a Google OAuth user and has full_name in raw_user_meta_data, the trigger
--   sets display_name to the first word of that name automatically.
--   Runs entirely server-side at signup time — no frontend race condition.
--
-- Solution B: frontend fix (page.tsx) — replaces getSession() with getUser()
--   so existing NULL rows are repaired the next time each user opens the app.
--
-- Solution C (this migration): one-time backfill for accounts that already
--   exist with NULL display_name and whose full_name is available in auth.users.

-- ── Trigger function ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_display_name_from_google()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider   TEXT;
  v_full_name  TEXT;
  v_first_name TEXT;
BEGIN
  -- Only act when display_name is not already set.
  IF NEW.display_name IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT
    raw_app_meta_data->>'provider',
    raw_user_meta_data->>'full_name'
  INTO v_provider, v_full_name
  FROM auth.users
  WHERE id = NEW.id;

  IF v_provider = 'google' AND v_full_name IS NOT NULL AND v_full_name <> '' THEN
    v_first_name := TRIM(SPLIT_PART(TRIM(v_full_name), ' ', 1));
    IF v_first_name <> '' THEN
      NEW.display_name := v_first_name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ── Attach trigger ───────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_set_display_name_from_google ON public.users;

CREATE TRIGGER trg_set_display_name_from_google
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_display_name_from_google();

-- ── Backfill existing NULL rows ──────────────────────────────────────────────

UPDATE public.users u
SET display_name = TRIM(SPLIT_PART(TRIM(au.raw_user_meta_data->>'full_name'), ' ', 1))
FROM auth.users au
WHERE u.id = au.id
  AND u.display_name IS NULL
  AND au.raw_app_meta_data->>'provider' = 'google'
  AND TRIM(au.raw_user_meta_data->>'full_name') IS NOT NULL
  AND TRIM(au.raw_user_meta_data->>'full_name') <> ''
  AND TRIM(SPLIT_PART(TRIM(au.raw_user_meta_data->>'full_name'), ' ', 1)) <> '';

DO $$
BEGIN
  RAISE NOTICE 'Migration 045: display_name trigger and backfill applied.';
END $$;
