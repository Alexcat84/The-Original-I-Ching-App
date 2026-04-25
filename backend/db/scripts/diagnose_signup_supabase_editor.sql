-- =============================================================================
-- Diagnóstico: POST /auth/v1/signup → 500 / unexpected_failure (staging)
-- =============================================================================
-- Uso en Supabase → SQL Editor: ejecuta UN BLOQUE a la vez (separadores abajo).
-- Todo es lectura salvo donde diga lo contrario. Comentarios en inglés en SQL.
-- =============================================================================

-- ============================ BLOQUE 1 ====================================
-- Triggers en auth.users (insert/delete deben existir y estar habilitados)
SELECT t.tgname,
       t.tgtype::int AS tgtype_raw,
       CASE t.tgenabled
         WHEN 'O' THEN 'origin'
         WHEN 'D' THEN 'disabled'
         WHEN 'R' THEN 'replica'
         WHEN 'A' THEN 'always'
         ELSE t.tgenabled::text
       END AS enabled_mode,
       pg_get_triggerdef(t.oid, true) AS trigger_def
FROM pg_trigger t
WHERE t.tgrelid = 'auth.users'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- ============================ BLOQUE 2 ====================================
-- ¿Cada auth.users tiene fila en public.users?
SELECT 'auth_without_public' AS check_name, count(*)::int AS n
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = a.id)
UNION ALL
SELECT 'public_without_auth', count(*)::int
FROM public.users p
WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id = p.id)
UNION ALL
SELECT 'auth_users_total', count(*)::int FROM auth.users
UNION ALL
SELECT 'public_users_total', count(*)::int FROM public.users;

-- ============================ BLOQUE 3 ====================================
-- Huérfanos en public.users (sin auth) — suelen romper re-registro por email
SELECT u.id, u.email, u.created_at
FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id)
ORDER BY u.created_at DESC
LIMIT 100;

-- ============================ BLOQUE 4 ====================================
-- Mismo email normalizado en varias filas de public.users
SELECT lower(trim(email)) AS email_norm, count(*)::int AS n, array_agg(id::text ORDER BY id) AS ids
FROM public.users
GROUP BY 1
HAVING count(*) > 1;

-- ============================ BLOQUE 5 ====================================
-- Huérfano public cuyo email coincide con OTRO auth.id (bloquea signup con ese email)
SELECT p.id AS orphan_public_id, p.email, a.id AS auth_id_same_email
FROM public.users p
JOIN auth.users a ON lower(trim(a.email)) = lower(trim(p.email))
WHERE p.id IS DISTINCT FROM a.id
  AND NOT EXISTS (SELECT 1 FROM auth.users a2 WHERE a2.id = p.id)
LIMIT 100;

-- ============================ BLOQUE 6 ====================================
-- Emails vacíos en public.users (UNIQUE('') solo permite uno)
SELECT id, email, created_at
FROM public.users
WHERE email IS NULL OR trim(email) = '';

-- ============================ BLOQUE 7 ====================================
-- Código actual del trigger (revisa DELETE huérfanos + INSERT + init_free_user)
SELECT pg_get_functiondef('public.handle_new_auth_user()'::regprocedure);

-- ============================ BLOQUE 8 ====================================
-- init_free_user (si falla dentro del trigger, Auth devuelve 500 opaco)
SELECT pg_get_functiondef('public.init_free_user(uuid)'::regprocedure);

-- ============================ BLOQUE 9 ====================================
-- RPC usado por /api/auth/register (opcional; migración 028)
SELECT p.oid::regprocedure AS rpc_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'auth_email_registered';

-- ============================ BLOQUE 10 ===================================
-- Identidades por usuario (Google + email en el mismo auth.users = normal)
SELECT u.id, u.email, i.provider
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 100;

-- ============================ BLOQUE 11 ===================================
-- Constraints en public.users (UNIQUE email, PK)
SELECT conname, pg_get_constraintdef(oid, true) AS def
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
ORDER BY conname;
