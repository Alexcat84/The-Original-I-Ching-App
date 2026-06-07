-- Fix security advisor warnings introduced by migration 053:
--
--   0028 anon_security_definer_function_executable
--   0029 authenticated_security_definer_function_executable
--
-- get_session_content_safe was created as SECURITY DEFINER, which exposes it
-- to anon/authenticated via /rest/v1/rpc even though REVOKE FROM PUBLIC was
-- issued — because PostgREST's role resolution re-grants access through the
-- database default privilege mechanism.
--
-- Fix: switch to SECURITY INVOKER.  The SET statement_timeout = '8s' clause
-- is a function-level configuration parameter; PostgreSQL applies it for the
-- duration of every call regardless of the security mode (documented behaviour
-- since PG 8.3).  The caller is always service_role (via getSupabaseAdmin()),
-- which has full SELECT on consultations and bypasses RLS — so INVOKER is safe.

CREATE OR REPLACE FUNCTION public.get_session_content_safe(
  p_user_id    uuid,
  p_session_id uuid
)
RETURNS TABLE(
  consultation_id uuid,
  interpretation  text,
  oracle_bones    jsonb
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
SET statement_timeout = '8s'
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id,
         c.interpretation,
         c.oracle_bones
  FROM   consultations c
  WHERE  c.session_id = p_session_id
    AND  c.user_id    = p_user_id
  ORDER  BY c.session_position ASC;
END;
$$;

-- Belt-and-suspenders: revoke from every public-facing role explicitly.
REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_session_content_safe(uuid, uuid) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.get_session_content_safe(uuid, uuid) TO service_role;

-- Verify
SELECT routine_name,
       security_type
FROM   information_schema.routines
WHERE  routine_schema = 'public'
  AND  routine_name   = 'get_session_content_safe';
