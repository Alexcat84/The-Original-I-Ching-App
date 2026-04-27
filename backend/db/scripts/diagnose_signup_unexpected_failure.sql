-- Run in Supabase SQL Editor when POST /auth/v1/signup returns x_sb_error_code: unexpected_failure.
-- Comments in English; safe read-only checks.

-- 1) Trigger on auth.users (should exist after migrations 003 / 013 / 023)
SELECT t.tgname, t.tgenabled AS enabled_i_o_d_r
FROM pg_trigger t
WHERE t.tgrelid = 'auth.users'::regclass
  AND NOT t.tgisinternal
ORDER BY 1;

-- 2) Bootstrap function used by handle_new_auth_user (migration 022+023)
SELECT p.oid::regprocedure AS init_free_user_signature
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'init_free_user';

-- 3) Function source for handle_new_auth_user (verify it calls init_free_user)
SELECT pg_get_functiondef('public.handle_new_auth_user()'::regprocedure);

-- 4) Orphan public.users emails not in auth (can confuse debugging)
SELECT u.id, u.email
FROM public.users u
LEFT JOIN auth.users a ON a.id = u.id
WHERE a.id IS NULL
LIMIT 50;

-- 5) Same logical email on multiple public.users rows (UNIQUE is case-sensitive; rare but blocks signup)
SELECT lower(trim(email)) AS email_norm, count(*)::int AS n, array_agg(id::text) AS ids
FROM public.users
GROUP BY 1
HAVING count(*) > 1;

-- 6) Orphan public row (no auth for p.id) whose email matches some auth user — blocks new signup on that email
SELECT p.id AS orphan_public_id, p.email, a.id AS auth_id_for_same_email
FROM public.users p
JOIN auth.users a ON lower(trim(a.email)) = lower(trim(p.email))
WHERE p.id IS DISTINCT FROM a.id
  AND NOT EXISTS (SELECT 1 FROM auth.users a2 WHERE a2.id = p.id)
LIMIT 50;
