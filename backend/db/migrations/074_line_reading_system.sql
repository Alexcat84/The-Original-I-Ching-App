-- Add the Huang/Zhu Xi changing-line reading system as a persisted, readable field.
-- Default 'huang' preserves all existing rows and all existing behavior.

ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS line_reading_system text NOT NULL DEFAULT 'huang';

-- Idempotent: ADD CONSTRAINT has no IF NOT EXISTS, so drop any prior copy first
-- (a partial/re-run of this migration would otherwise fail with "already exists").
ALTER TABLE public.consultations
  DROP CONSTRAINT IF EXISTS consultations_line_reading_system_check;
ALTER TABLE public.consultations
  ADD CONSTRAINT consultations_line_reading_system_check
  CHECK (line_reading_system IN ('huang', 'zhuxi'));

-- Parameter count changes (23 -> 24): CREATE OR REPLACE would silently create a second,
-- overloaded function instead of replacing the existing one. Drop the exact prior
-- signature first (matches 069_drop_consultations_legacy_toast_columns.sql verbatim).
DROP FUNCTION IF EXISTS public.persist_consultation_with_content(
  uuid, uuid, uuid, integer, text, text, jsonb, integer, text, text,
  integer, text, integer[], text, text, text, text, text, text, text,
  text, jsonb, boolean
);

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
  p_is_public                    boolean,
  p_line_reading_system          text DEFAULT 'huang'
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
    is_public,
    line_reading_system
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
    COALESCE(p_is_public, false),
    COALESCE(p_line_reading_system, 'huang')
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
  text, jsonb, boolean, text
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.persist_consultation_with_content(
  uuid, uuid, uuid, integer, text, text, jsonb, integer, text, text,
  integer, text, integer[], text, text, text, text, text, text, text,
  text, jsonb, boolean, text
) FROM anon;

REVOKE ALL ON FUNCTION public.persist_consultation_with_content(
  uuid, uuid, uuid, integer, text, text, jsonb, integer, text, text,
  integer, text, integer[], text, text, text, text, text, text, text,
  text, jsonb, boolean, text
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.persist_consultation_with_content(
  uuid, uuid, uuid, integer, text, text, jsonb, integer, text, text,
  integer, text, integer[], text, text, text, text, text, text, text,
  text, jsonb, boolean, text
) TO service_role;
