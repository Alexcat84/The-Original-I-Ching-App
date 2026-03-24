-- Supabase / Postgres — run via `supabase db push` or migration runner.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.random_public_id(len int DEFAULT 8)
RETURNS text
LANGUAGE sql
AS $$
  SELECT lower(substring(encode(gen_random_bytes(16), 'hex'), 1, len));
$$;

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT CHECK (two_factor_method IN ('sms', 'totp') OR two_factor_method IS NULL),
  phone_number TEXT,
  phone_verified_at TIMESTAMPTZ,
  totp_secret TEXT,
  totp_verified_at TIMESTAMPTZ,
  language TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.two_factor_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.two_factor_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  ip_address TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_2fa_attempts ON public.two_factor_attempts(user_id, created_at DESC);

CREATE TABLE public.consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  theme_category TEXT NOT NULL DEFAULT 'general',
  language TEXT NOT NULL DEFAULT 'es',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'shared')),
  consultation_count INTEGER DEFAULT 0,
  max_consultations INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  public_sharing_id TEXT UNIQUE NOT NULL DEFAULT (public.random_public_id(8))
);

CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.consultation_sessions(id),
  session_position INTEGER NOT NULL DEFAULT 1,
  question TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'es',
  lines JSONB NOT NULL,
  primary_hexagram_number INTEGER NOT NULL,
  primary_hexagram_name TEXT NOT NULL,
  primary_hexagram_chinese TEXT NOT NULL,
  transformed_hexagram_number INTEGER,
  transformed_hexagram_name TEXT,
  changing_lines INTEGER[] NOT NULL,
  mutation_rule TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  interpretation TEXT NOT NULL,
  image_url TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  public_sharing_id TEXT UNIQUE NOT NULL DEFAULT (public.random_public_id(8)),
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.consultation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pattern_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  analysis_text TEXT NOT NULL,
  consultations_analyzed INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.query_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  credits_total INTEGER NOT NULL,
  credits_used INTEGER DEFAULT 0,
  cycle_start TIMESTAMPTZ NOT NULL,
  cycle_end TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_consultations" ON public.consultations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_sessions" ON public.consultation_sessions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_credits" ON public.query_credits
  FOR ALL USING (auth.uid() = user_id);
