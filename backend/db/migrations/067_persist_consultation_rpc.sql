-- Phase 3 — atomic persist: meta row in consultations (no TOAST) + content in consultation_content.
-- Replaces app-side INSERT with interpretation/oracle_bones on consultations (~12 KB TOAST/write).

-- Allow NULL interpretation on meta-only inserts (content lives in consultation_content).
ALTER TABLE public.consultations
  ALTER COLUMN interpretation DROP NOT NULL;

-- ─── RPC: persist_consultation_with_content ───────────────────────────────────

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
    interpretation,
    oracle_type,
    oracle_bones,
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
    NULL,
    COALESCE(p_oracle_type, 'iching'),
    NULL,
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
    interpretation = EXCLUDED.interpretation,
    oracle_bones   = EXCLUDED.oracle_bones;

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

-- ─── Trigger: sync only on UPDATE (INSERT handled by RPC) ─────────────────────

DROP TRIGGER IF EXISTS trg_sync_consultation_content ON public.consultations;

CREATE TRIGGER trg_sync_consultation_content
  AFTER UPDATE OF interpretation, oracle_bones
  ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_consultation_content();
