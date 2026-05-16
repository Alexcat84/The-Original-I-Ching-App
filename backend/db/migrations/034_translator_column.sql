-- MIGRATION 034: Add translator column to consultations
-- Records which I Ching translator was used for each reading.
-- NULL means the column did not exist when the row was created (pre-migration).
-- New readings will store one of: 'wilhelm', 'legge', 'zhouyi', 'master_combined'.
-- Oracle Bones consultations always store NULL (no translator applies).

ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS translator TEXT;
