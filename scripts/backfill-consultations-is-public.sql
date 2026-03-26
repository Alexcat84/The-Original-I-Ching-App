-- If /r/ links stopped resolving after enforcing is_public=true reads:
-- mark existing rows as publicly resolvable by sharing id (same as prior behavior).
UPDATE public.consultations SET is_public = true WHERE is_public IS DISTINCT FROM true;
