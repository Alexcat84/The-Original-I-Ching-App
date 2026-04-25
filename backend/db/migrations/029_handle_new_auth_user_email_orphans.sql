-- Stale public.users rows (no matching auth.users) can keep an email and block
-- new email/password signups: INSERT hits UNIQUE(email) and GoTrue returns unexpected_failure.
-- Clean only true orphans that duplicate NEW.email before syncing the new row.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND length(trim(NEW.email)) > 0 THEN
    DELETE FROM public.users p
    WHERE lower(trim(p.email)) = lower(trim(NEW.email))
      AND p.id IS DISTINCT FROM NEW.id
      AND NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id = p.id);
  END IF;

  INSERT INTO public.users (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

  PERFORM public.init_free_user(NEW.id);

  RETURN NEW;
END;
$$;
