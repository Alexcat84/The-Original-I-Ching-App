-- Phase 2b / production scale — remove legacy TOAST columns from consultations.
-- Content lives exclusively in consultation_content (RPC persist_consultation_with_content).
--
-- GATE (required before apply):
--   1. Migrations 067 + 068 applied.
--   2. All writes use persist_consultation_with_content (no app INSERT with interpretation on consultations).
--   3. Smoke: open chat → reload → full interpretation visible.
--   4. Optional reclaim: VACUUM FULL public.consultations via psql direct/pooler (outside transaction).
--
-- Post-apply: consultations heap-only (~80 kB); TOAST only on consultation_content.

-- Legacy dual-write trigger no longer needed (columns removed).
DROP TRIGGER IF EXISTS trg_sync_consultation_content ON public.consultations;
DROP FUNCTION IF EXISTS public.sync_consultation_content();

-- RPC: meta insert without interpretation/oracle_bones columns.
CREATE OR REPLACE FUNCTION public.persist_consultation_with_content(
  p_user_id                      uuid,
  p_id                           uuid,
  p_session_id                   uuid,
  p_session_position             integer,
  p_question                     text,
  p_language                     text,
  p_lines                        jsonb,
  p_primary_hexagram_number      integer,
  p_primary_hexagram_name        text,
  p_primary_hexagram_chinese     text,
  p_transformed_hexagram_number  integer,
  p_transformed_hexagram_name    text,
  p_changing_lines               integer[],
  p_mutation_rule                text,
  p_translator                   text,
  p_category                     text,
  p_interpretation_summary       text,
  p_image_url                    text,
  p_thumbnail_url                text,
  p_oracle_type                  text,
  p_interpretation               text,
  p_oracle_bones                 jsonb,
  p_is_public                    boolean
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_public_sharing_id text;
BEGIN
  IF p_user_id IS NULL OR p_id IS NULL OR p_session_id IS NULL THEN
    RAISE EXCEPTION 'persist_consultation_with_content: missing required ids';
  END IF;

  INSERT INTO public.consultations (
    id,
    user_id,
    session_id,
    session_position,
    question,
    language,
    lines,
    primary_hexagram_number,
    primary_hexagram_name,
    primary_hexagram_chinese,
    transformed_hexagram_number,
    transformed_hexagram_name,
    changing_lines,
    mutation_rule,
    translator,
    category,
    interpretation_summary,
    oracle_type,
    image_url,
    thumbnail_url,
    is_public
  ) VALUES (
    p_id,
    p_user_id,
    p_session_id,
    p_session_position,
    p_question,
    p_language,
    p_lines,
    p_primary_hexagram_number,
    p_primary_hexagram_name,
    p_primary_hexagram_chinese,
    p_transformed_hexagram_number,
    p_transformed_hexagram_name,
    p_changing_lines,
    p_mutation_rule,
    p_translator,
    p_category,
    p_interpretation_summary,
    COALESCE(p_oracle_type, 'iching'),
    p_image_url,
    p_thumbnail_url,
    COALESCE(p_is_public, false)
  )
  RETURNING public_sharing_id INTO v_public_sharing_id;

  INSERT INTO public.consultation_content (
    consultation_id,
    user_id,
    session_id,
    interpretation,
    oracle_bones
  ) VALUES (
    p_id,
    p_user_id,
    p_session_id,
    p_interpretation,
    p_oracle_bones
  )
  ON CONFLICT (consultation_id) DO UPDATE SET
    interpretation = COALESCE(EXCLUDED.interpretation, consultation_content.interpretation),
    oracle_bones   = COALESCE(EXCLUDED.oracle_bones, consultation_content.oracle_bones);

  RETURN v_public_sharing_id;
END;
$$;

REVOKE ALL ON FUNCTION public.persist_consultation_with_content(
  uuid, uuid, uuid, integer, text, text, jsonb, integer, text, text,
  integer, text, integer[], text, text, text, text, text, text, text,
  text, jsonb, boolean
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.persist_consultation_with_content(
  uuid, uuid, uuid, integer, text, text, jsonb, integer, text, text,
  integer, text, integer[], text, text, text, text, text, text, text,
  text, jsonb, boolean
) FROM anon;

REVOKE ALL ON FUNCTION public.persist_consultation_with_content(
  uuid, uuid, uuid, integer, text, text, jsonb, integer, text, text,
  integer, text, integer[], text, text, text, text, text, text, text,
  text, jsonb, boolean
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.persist_consultation_with_content(
  uuid, uuid, uuid, integer, text, text, jsonb, integer, text, text,
  integer, text, integer[], text, text, text, text, text, text, text,
  text, jsonb, boolean
) TO service_role;

ALTER TABLE public.consultations
  DROP COLUMN IF EXISTS interpretation,
  DROP COLUMN IF EXISTS oracle_bones;
