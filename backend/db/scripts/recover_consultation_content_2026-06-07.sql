-- Recovery v2 — clone backup 2026-06-07 05:44 UTC (pre-062 consultation_content table)
-- Clone: text in public.consultations.interpretation / oracle_bones
-- Prod: merge INTO public.consultation_content
-- Run §1 on CLONE; §2 export on CLONE; §3 on PROD

-- ═══════════════════════════════════════════════════════════════════════════════
-- §1 CLONE — verify data exists in legacy columns
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT
  (SELECT COUNT(*) FROM public.consultations) AS consults,
  (SELECT COUNT(*) FROM public.consultations
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS legacy_with_full_text,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'consultation_content') AS has_content_table;

-- Sample rows
SELECT id, left(question, 40) AS q, length(interpretation) AS text_len, created_at
FROM public.consultations
WHERE interpretation IS NOT NULL AND length(interpretation) > 100
ORDER BY created_at DESC
LIMIT 5;

-- ═══════════════════════════════════════════════════════════════════════════════
-- §2 CLONE — generate UPDATE for prod consultation_content (copy results → prod)
-- Only updates rows that exist in prod with empty content
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT format(
  $u$UPDATE public.consultation_content SET
  interpretation = %L,
  oracle_bones = %s
WHERE consultation_id = %L::uuid
  AND (interpretation IS NULL OR length(COALESCE(interpretation, '')) < 100);$u$,
  c.interpretation,
  CASE
    WHEN c.oracle_bones IS NULL THEN 'NULL'
    ELSE quote_literal(c.oracle_bones::text) || '::jsonb'
  END,
  c.id::text
) AS merge_sql
FROM public.consultations c
WHERE c.interpretation IS NOT NULL
  AND length(c.interpretation) > 100
ORDER BY c.id;

-- Optional: interpretation_summary on prod meta (if null)
SELECT format(
  $u$UPDATE public.consultations SET interpretation_summary = %L
WHERE id = %L::uuid AND (interpretation_summary IS NULL OR interpretation_summary = '');$u$,
  left(c.interpretation, 420),
  c.id::text
) AS summary_sql
FROM public.consultations c
WHERE c.interpretation IS NOT NULL AND length(c.interpretation) > 100
ORDER BY c.id;

-- ═══════════════════════════════════════════════════════════════════════════════
-- §3 PROD — pre / post checks (wgborqkfnxfarkdaotsd)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Pre: how many need recovery
-- SELECT COUNT(*) FROM public.consultation_content
-- WHERE interpretation IS NULL OR length(COALESCE(interpretation, '')) < 100;

-- Post: how many recovered
-- SELECT COUNT(*) FROM public.consultation_content
-- WHERE interpretation IS NOT NULL AND length(interpretation) > 100;

-- Orphans: in prod but not in clone backup (created after 2026-06-07 05:44 UTC)
-- SELECT id, created_at, left(question, 50) FROM public.consultations
-- WHERE created_at > '2026-06-07 05:44:18+00' ORDER BY created_at;
