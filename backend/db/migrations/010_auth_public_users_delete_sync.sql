-- Keep public.users synchronized when accounts are deleted from auth.users.
-- Also cleans up historical orphan rows that can block re-registration by email.

CREATE OR REPLACE FUNCTION public.handle_deleted_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.users
  WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deleted_auth_user();

-- One-time cleanup for rows that were left in public.users without auth.users.
DELETE FROM public.users p
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users a
  WHERE a.id = p.id
);
