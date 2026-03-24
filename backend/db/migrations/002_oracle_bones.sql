-- Oracle bones (甲骨文) consultations alongside I Ching rows
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS oracle_type TEXT NOT NULL DEFAULT 'iching'
    CHECK (oracle_type IN ('iching', 'oracle_bones'));

ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS oracle_bones JSONB;
