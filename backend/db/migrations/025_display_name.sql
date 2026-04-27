-- Add display_name to users table for onboarding personalization.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS display_name TEXT;
