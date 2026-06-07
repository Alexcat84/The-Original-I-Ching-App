-- Add missing indexes on FK columns flagged by Supabase performance linter.
-- All 4 tables are currently small (audit: tables vacías / low row count) but
-- indexes are cheap to create now and prevent seq-scans at scale.
-- All statements use IF NOT EXISTS — safe to re-run.

-- consultation_notes: FK on consultation_id (JOIN path) + FK on user_id (RLS scan)
CREATE INDEX IF NOT EXISTS idx_consultation_notes_consultation_id
  ON public.consultation_notes(consultation_id);

CREATE INDEX IF NOT EXISTS idx_consultation_notes_user_id
  ON public.consultation_notes(user_id);

-- pattern_analyses: FK on user_id (RLS scan + user history lookup)
CREATE INDEX IF NOT EXISTS idx_pattern_analyses_user_id
  ON public.pattern_analyses(user_id);

-- two_factor_recovery_codes: FK on user_id (2FA verification path)
CREATE INDEX IF NOT EXISTS idx_two_factor_recovery_codes_user_id
  ON public.two_factor_recovery_codes(user_id);

-- Verify: all 4 indexes exist
SELECT indexname, tablename, indexdef
FROM   pg_indexes
WHERE  schemaname = 'public'
  AND  indexname IN (
    'idx_consultation_notes_consultation_id',
    'idx_consultation_notes_user_id',
    'idx_pattern_analyses_user_id',
    'idx_two_factor_recovery_codes_user_id'
  )
ORDER BY tablename, indexname;
