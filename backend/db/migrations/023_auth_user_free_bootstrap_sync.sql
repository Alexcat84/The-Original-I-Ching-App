-- Ensure every new auth user receives the one-time free bootstrap tokens.
-- Required after introducing consumable tokens + user_trial_log guards.

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

  -- Grant the one-time free bootstrap if missing.
  PERFORM public.init_free_user(NEW.id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill users created before this trigger update.
-- Safe/idempotent because init_free_user is guarded by user_trial_log and query_credits uniqueness.
SELECT public.init_free_user(a.id)
FROM auth.users a
LEFT JOIN public.query_credits qc ON qc.user_id = a.id
WHERE qc.user_id IS NULL;

