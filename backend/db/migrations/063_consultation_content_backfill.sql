-- Phase 2 TOAST split — Step 2: backfill consultation_content from consultations.
--
-- Copies interpretation + oracle_bones for every row that has at least one non-null
-- TOAST column.  ON CONFLICT DO NOTHING makes this safe to re-run.
--
-- After this migration completes, consultation_content holds the same TOAST data
-- that was previously only in consultations.  Both tables carry the data until
-- Phase 3 nulls the original columns and runs VACUUM FULL.

INSERT INTO public.consultation_content (
  consultation_id,
  user_id,
  session_id,
  interpretation,
  oracle_bones,
  created_at
)
SELECT
  id,
  user_id,
  session_id,
  interpretation,
  oracle_bones,
  created_at
FROM public.consultations
WHERE interpretation IS NOT NULL
   OR oracle_bones   IS NOT NULL
ON CONFLICT (consultation_id) DO NOTHING;

-- NOTE: VACUUM ANALYZE cannot run inside a transaction block (Supabase SQL Editor wraps
-- all statements in one).  After this migration completes, run separately:
--   VACUUM ANALYZE public.consultation_content;
-- This is optional — the planner will gather stats on the next autovacuum cycle anyway.
