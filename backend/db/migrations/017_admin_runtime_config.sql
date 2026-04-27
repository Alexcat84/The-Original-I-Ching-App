CREATE TABLE IF NOT EXISTS public.admin_runtime_config (
  id TEXT PRIMARY KEY,
  image_provider_default TEXT NOT NULL,
  response_mode_default TEXT NOT NULL,
  insights_default BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

