-- Add email-based 2FA support.
-- - Extend users.two_factor_method enum-like check with 'email'
-- - Add one-time email code storage table with expiry + consume tracking

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_two_factor_method_check;

ALTER TABLE public.users
ADD CONSTRAINT users_two_factor_method_check
CHECK (two_factor_method IN ('sms', 'totp', 'email') OR two_factor_method IS NULL);

CREATE TABLE IF NOT EXISTS public.two_factor_email_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_2fa_email_codes_user_created
  ON public.two_factor_email_codes(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_2fa_email_codes_user_expires
  ON public.two_factor_email_codes(user_id, expires_at DESC);

ALTER TABLE public.two_factor_email_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_2fa_email_codes" ON public.two_factor_email_codes;
CREATE POLICY "own_2fa_email_codes" ON public.two_factor_email_codes
  FOR ALL USING (auth.uid() = user_id);

