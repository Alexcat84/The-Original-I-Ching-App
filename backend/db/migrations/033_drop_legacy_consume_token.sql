-- MIGRATION: Drop legacy single-parameter consume_token created by migration 024.
-- Migration 032 added consume_token(UUID, INTEGER DEFAULT 1) via CREATE OR REPLACE,
-- but because the parameter signature differs, PostgreSQL created a NEW overload
-- instead of replacing the original. Both functions now coexist, which can cause
-- PostgREST ambiguity when resolving the correct overload.
-- This migration removes the legacy single-parameter version.

DROP FUNCTION IF EXISTS public.consume_token(UUID);
