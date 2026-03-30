-- Delete public.users (and all ON DELETE CASCADE children) BEFORE the auth.users row is removed.
-- Supabase dashboard DELETE on auth.users was returning 500 when public.users delete ran only
-- AFTER auth removal or when FK / ordering caused the transaction to fail.

CREATE OR REPLACE FUNCTION public.handle_deleted_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deleted_auth_user();
