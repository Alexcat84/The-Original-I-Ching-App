-- Keep public.users synchronized when accounts are deleted from auth.users.
-- NOTE: handle_deleted_auth_user() and on_auth_user_deleted trigger (BEFORE DELETE)
-- are defined in their final form by 012_auth_delete_public_users_before.sql.

-- One-time cleanup for rows left in public.users without a matching auth.users row.
DELETE FROM public.users p
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users a WHERE a.id = p.id
);
