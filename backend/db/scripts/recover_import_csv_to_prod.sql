-- PROD (wgborqkfnxfarkdaotsd) — after CSV imported into recovery_consultation_import
-- Run each section in order in SQL Editor.

-- ─── 1. Pre-check (should show import_rows=64, matched=64) ───────────────────
SELECT
  (SELECT COUNT(*) FROM public.recovery_consultation_import) AS import_rows,
  (SELECT COUNT(*) FROM public.recovery_consultation_import
   WHERE interpretation IS NOT NULL AND length(interpretation) > 50) AS import_with_text,
  (SELECT COUNT(*) FROM public.recovery_consultation_import r
   JOIN public.consultation_content cc ON cc.consultation_id = r.consultation_id) AS matched_in_content,
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS content_with_text_before;

-- ─── 2. Merge (UPSERT — works even if content row exists with NULL) ─────────
INSERT INTO public.consultation_content (
  consultation_id,
  user_id,
  session_id,
  interpretation,
  oracle_bones
)
SELECT
  r.consultation_id,
  c.user_id,
  c.session_id,
  r.interpretation,
  r.oracle_bones
FROM public.recovery_consultation_import AS r
JOIN public.consultations AS c ON c.id = r.consultation_id
ON CONFLICT (consultation_id) DO UPDATE SET
  interpretation = EXCLUDED.interpretation,
  oracle_bones   = COALESCE(EXCLUDED.oracle_bones, public.consultation_content.oracle_bones);

-- ─── 3. Optional: interpretation_summary on meta ─────────────────────────────
UPDATE public.consultations AS c
SET interpretation_summary = left(r.interpretation, 420)
FROM public.recovery_consultation_import AS r
WHERE c.id = r.consultation_id
  AND (c.interpretation_summary IS NULL OR c.interpretation_summary = '');

-- ─── 4. Post-check (content_with_text_after should be ~64) ───────────────────
SELECT
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS content_with_text_after,
  (SELECT COUNT(*) FROM public.recovery_consultation_import r
   JOIN public.consultation_content cc ON cc.consultation_id = r.consultation_id
   WHERE cc.interpretation IS NOT NULL AND length(cc.interpretation) > 100) AS import_rows_now_in_content;

-- Sample
SELECT r.consultation_id, left(r.interpretation, 50) AS imported,
       left(cc.interpretation, 50) AS in_content, length(cc.interpretation) AS len
FROM public.recovery_consultation_import r
JOIN public.consultation_content cc ON cc.consultation_id = r.consultation_id
LIMIT 3;

-- ─── 5. Cleanup after app smoke OK ───────────────────────────────────────────
-- DROP TABLE public.recovery_consultation_import;
