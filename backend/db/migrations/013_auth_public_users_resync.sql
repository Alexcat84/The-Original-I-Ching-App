-- Hardening migration: ensure every auth.users row exists in public.users.
-- Fixes environments where migration 003 wasn't applied, which breaks
-- query_credits/two_factor foreign keys and billing sync upserts.

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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill and keep email updated for existing users.
INSERT INTO public.users (id, email)
SELECT a.id, COALESCE(a.email, '')
FROM auth.users a
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
