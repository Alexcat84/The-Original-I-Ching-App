-- Repair recipes (run only when audit confirms drift).
-- These statements are idempotent and intended for controlled troubleshooting.

-- ---------------------------------------------------------------------------
-- 1) Backfill missing public.users rows from auth.users
-- ---------------------------------------------------------------------------
INSERT INTO public.users (id, email)
SELECT a.id, COALESCE(a.email, '')
FROM auth.users a
LEFT JOIN public.users u ON u.id = a.id
WHERE u.id IS NULL
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- ---------------------------------------------------------------------------
-- 2) Backfill missing free bootstrap credits for users without query_credits
-- ---------------------------------------------------------------------------
SELECT public.init_free_user(a.id)
FROM auth.users a
LEFT JOIN public.query_credits qc ON qc.user_id = a.id
WHERE qc.user_id IS NULL;

-- ---------------------------------------------------------------------------
-- 3) Recreate auth trigger with free bootstrap hook
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

  PERFORM public.init_free_user(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

