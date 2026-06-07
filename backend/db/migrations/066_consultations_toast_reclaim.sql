-- Phase 3 reclaim: null duplicated TOAST columns on consultations.
-- Data lives in consultation_content (Fase 2); dual-write trigger still populates
-- both on INSERT/UPDATE until columns are dropped in a later migration.
--
-- ⚠️  CRITICAL — NEVER apply without migration 068 applied FIRST.
--     Applying 066 before 068 caused P0 incident 2026-06-07: sync trigger propagated
--     NULLs to consultation_content and wiped ALL user interpretation text.
--     See: docs/auditorias/INCIDENT_2026-06-07_CONSULTATION_CONTENT_WIPE.md
--     Runbook: docs/runbooks/MIGRATION_DATA_INTEGRITY.md
--
-- GATE (all required):
--   1. Migration 068 applied (sync_consultation_content NULL-safe).
--   2. Baseline R3 query — record content_with_full_text COUNT.
--   3. PITR/backup confirmed.
--   4. Post-apply R3 — content_with_full_text MUST NOT decrease.
--   5. Smoke: open chat → reload → full interpretation visible.
--
-- Step 1 (this file): NULL out legacy TOAST payloads.
UPDATE public.consultations
SET interpretation = NULL,
    oracle_bones = NULL
WHERE interpretation IS NOT NULL
   OR oracle_bones IS NOT NULL;

-- Step 2: VACUUM FULL — MUST run outside a transaction / in a maintenance window.
-- Execute separately in Supabase SQL Editor (blocks consultations table):
--
--   VACUUM FULL public.consultations;
--
-- Expected post-VACUUM: consultations total ~152 kB heap (releases ~270 MB bloated TOAST).
