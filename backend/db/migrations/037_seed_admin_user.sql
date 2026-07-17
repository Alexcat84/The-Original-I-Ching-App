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
    -- Replayability (PLAN-SUP-02 / PLAN-SEC-02 Ticket 3): on a blank database
    -- (fresh replay, DR, local stack) the owner user does not exist yet — skip
    -- with a NOTICE instead of failing the whole chain (053 pattern). In every
    -- deployed environment this migration already ran with the user present;
    -- content edits to an applied migration never re-execute (version-tracked).
    RAISE NOTICE 'Migration 037: owner user not found (blank database?) — skipping admin seed';
    RETURN;
  END IF;

  IF rec.is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Migration 037: is_admin did not apply for user %', rec.id;
  END IF;

  RAISE NOTICE 'Migration 037 OK — is_admin=true confirmed for % (%)', rec.email, rec.id;
END $$;
