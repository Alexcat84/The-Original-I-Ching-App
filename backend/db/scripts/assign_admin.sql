-- Asignar rol de admin a un usuario existente
-- Ejecutar en el SQL Editor de Supabase (requiere service_role o acceso directo)
--
-- Uso:
--   1. Reemplaza 'admin@example.com' con el email real del usuario
--   2. Ejecuta el bloque completo
--   3. Verifica que is_admin = true en el resultado

DO $$
DECLARE
  v_email  TEXT := 'admin@example.com';  -- <-- reemplazar
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM public.users
  WHERE lower(trim(email)) = lower(trim(v_email));

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado: %', v_email;
  END IF;

  UPDATE public.users
  SET is_admin = true
  WHERE id = v_user_id;

  RAISE NOTICE '✅ Admin asignado — email: % | uuid: %', v_email, v_user_id;
END $$;

-- Verificación
SELECT id, email, is_admin, created_at
FROM public.users
WHERE is_admin = true
ORDER BY created_at;
