-- Keeps public.users.id aligned with auth.users.id so FKs and RLS work.
-- NOTE: handle_new_auth_user() and on_auth_user_created trigger are defined
-- in their final form by 029_handle_new_auth_user_email_orphans.sql.

-- Backfill existing auth users (e.g. created before this migration)
INSERT INTO public.users (id, email)
SELECT u.id, COALESCE(u.email, '')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
