-- Phase 3 reclaim: null duplicated TOAST columns on consultations.
-- Data lives in consultation_content (Fase 2); dual-write trigger still populates
-- both on INSERT/UPDATE until columns are dropped in a later migration.
--
-- GATE: apply only after P0+P1 deployed and 10 min smoke with 0 Warp errors.
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
