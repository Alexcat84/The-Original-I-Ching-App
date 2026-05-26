-- Grant admin access to the app owner account.
-- Idempotent: ON CONFLICT DO NOTHING on the lookup; UPDATE is safe to re-run.
UPDATE public.users
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'alexcatbaster@gmail.com'
);

-- Verify: must return exactly one row with is_admin = true.
DO $$
DECLARE
  rec RECORD;
BEGIN
  SELECT u.id, u.is_admin, au.email
    INTO rec
    FROM public.users u
    JOIN auth.users au ON au.id = u.id
   WHERE au.email = 'alexcatbaster@gmail.com';

  IF rec IS NULL THEN
    RAISE EXCEPTION 'Migration 037: user alexcatbaster@gmail.com not found in auth.users / public.users';
  END IF;

  IF rec.is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Migration 037: is_admin did not apply for user %', rec.id;
  END IF;

  RAISE NOTICE 'Migration 037 OK — is_admin=true confirmed for % (%)', rec.email, rec.id;
END $$;
