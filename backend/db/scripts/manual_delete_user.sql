-- Emergency: remove one account when Authentication → Delete user returns 500.
-- SQL Editor (Supabase): use role postgres or one that can write auth.users.
--
-- Replace REPLACE_WITH_USER_UUID below with the UID from Authentication → Users, then run once.

DO $$
DECLARE
  uid uuid := 'REPLACE_WITH_USER_UUID'::uuid;
BEGIN
  DELETE FROM public.two_factor_attempts WHERE user_id = uid;
  DELETE FROM public.two_factor_email_codes WHERE user_id = uid;
  DELETE FROM public.two_factor_recovery_codes WHERE user_id = uid;
  DELETE FROM public.consultation_notes WHERE user_id = uid;
  DELETE FROM public.consultations WHERE user_id = uid;
  DELETE FROM public.consultation_sessions WHERE user_id = uid;
  DELETE FROM public.pattern_analyses WHERE user_id = uid;
  DELETE FROM public.user_trial_log WHERE user_id = uid;
  DELETE FROM public.query_credits WHERE user_id = uid;
  DELETE FROM public.users WHERE id = uid;
  DELETE FROM auth.users WHERE id = uid;
END $$;
