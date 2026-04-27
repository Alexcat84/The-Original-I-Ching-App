-- Hardening migration: ensure every auth.users row exists in public.users.
-- NOTE: handle_new_auth_user() and on_auth_user_created trigger are defined
-- in their final form by 029_handle_new_auth_user_email_orphans.sql.

-- Backfill and keep email updated for all existing auth users.
INSERT INTO public.users (id, email)
SELECT a.id, COALESCE(a.email, '')
FROM auth.users a
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
