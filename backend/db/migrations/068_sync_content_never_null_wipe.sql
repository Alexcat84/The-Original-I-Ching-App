-- Hotfix: sync_consultation_content must never propagate NULL wipes into consultation_content.
-- Root cause: 066 NULLed consultations.interpretation; UPDATE trigger copied NULLs and erased all content.

CREATE OR REPLACE FUNCTION public.sync_consultation_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Meta-only updates (Phase 3 RPC inserts NULL interpretation on consultations by design).
  IF NEW.interpretation IS NULL AND NEW.oracle_bones IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.consultation_content (
    consultation_id,
    user_id,
    session_id,
    interpretation,
    oracle_bones,
    created_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.session_id,
    NEW.interpretation,
    NEW.oracle_bones,
    COALESCE(NEW.created_at, now())
  )
  ON CONFLICT (consultation_id) DO UPDATE SET
    interpretation = COALESCE(EXCLUDED.interpretation, consultation_content.interpretation),
    oracle_bones   = COALESCE(EXCLUDED.oracle_bones, consultation_content.oracle_bones);

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_consultation_content() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_consultation_content() FROM anon;
REVOKE ALL ON FUNCTION public.sync_consultation_content() FROM authenticated;

-- Belt-and-suspenders: RPC conflict path must not clobber existing content with NULL.
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
    interpretation = COALESCE(EXCLUDED.interpretation, consultation_content.interpretation),
    oracle_bones   = COALESCE(EXCLUDED.oracle_bones, consultation_content.oracle_bones);

  RETURN v_public_sharing_id;
END;
$$;
