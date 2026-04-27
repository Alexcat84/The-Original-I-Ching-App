-- Ensure every existing auth user receives the one-time free bootstrap tokens.
-- NOTE: handle_new_auth_user() and on_auth_user_created trigger are defined
-- in their final form by 029_handle_new_auth_user_email_orphans.sql.

-- Backfill users created before the consumable token model was introduced.
-- Safe/idempotent: init_free_user is guarded by user_trial_log and query_credits uniqueness.
SELECT public.init_free_user(a.id)
FROM auth.users a
LEFT JOIN public.query_credits qc ON qc.user_id = a.id
WHERE qc.user_id IS NULL;
