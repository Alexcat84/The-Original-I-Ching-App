-- Privacy hardening: disable public consultation/session sharing.
-- Existing rows become private and future inserts default to private.

UPDATE public.consultations
SET is_public = FALSE
WHERE is_public = TRUE;

ALTER TABLE public.consultations
ALTER COLUMN is_public SET DEFAULT FALSE;

