-- User-focused diagnostic drilldown.
-- Set either p_user_id or p_email in the params CTE before running.

WITH params AS (
  SELECT
    NULL::UUID AS p_user_id,
    'camarasipcasa30@gmail.com'::TEXT AS p_email
),
target AS (
  SELECT a.id, a.email, a.created_at
  FROM auth.users a
  CROSS JOIN params p
  WHERE (p.p_user_id IS NOT NULL AND a.id = p.p_user_id)
     OR (p.p_user_id IS NULL AND p.p_email IS NOT NULL AND LOWER(a.email) = LOWER(p.p_email))
  LIMIT 1
)
SELECT
  t.id AS auth_user_id,
  t.email AS auth_email,
  t.created_at AS auth_created_at
FROM target t;

-- public.users row
SELECT
  u.id,
  u.email,
  u.two_factor_enabled,
  u.two_factor_method,
  u.created_at
FROM public.users u
JOIN target t ON t.id = u.id;

-- query_credits row
SELECT
  qc.user_id,
  qc.credits_total,
  qc.credits_used,
  qc.total_purchased,
  qc.last_pack,
  qc.updated_at
FROM public.query_credits qc
JOIN target t ON t.id = qc.user_id;

-- user_trial_log row
SELECT
  utl.user_id,
  utl.granted_at
FROM public.user_trial_log utl
JOIN target t ON t.id = utl.user_id;

-- consultation summary
SELECT
  COUNT(*)::BIGINT AS consultations_count,
  MIN(c.created_at) AS first_consultation_at,
  MAX(c.created_at) AS last_consultation_at
FROM public.consultations c
JOIN target t ON t.id = c.user_id;

-- chat sessions summary
SELECT
  COUNT(*)::BIGINT AS sessions_count,
  MIN(s.created_at) AS first_session_at,
  MAX(s.created_at) AS last_session_at
FROM public.consultation_sessions s
JOIN target t ON t.id = s.user_id;

