-- Records user acceptance of the Terms of Service and Privacy Policy.
-- Append-only by version; written by server routes with the service role.

CREATE TABLE IF NOT EXISTS public.user_legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_via TEXT NOT NULL CHECK (accepted_via IN ('email_signup', 'google_oauth', 'post_login')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_legal_acceptances_unique_version UNIQUE (user_id, terms_version, privacy_version)
);

CREATE INDEX IF NOT EXISTS idx_user_legal_acceptances_user_latest
  ON public.user_legal_acceptances(user_id, accepted_at DESC);

ALTER TABLE public.user_legal_acceptances ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_legal_acceptances FROM anon, authenticated;

DROP POLICY IF EXISTS "user_legal_acceptances_deny_all" ON public.user_legal_acceptances;
CREATE POLICY "user_legal_acceptances_deny_all"
  ON public.user_legal_acceptances
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
