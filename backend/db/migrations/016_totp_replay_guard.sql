-- Prevent TOTP replay within the same (or older) OTP time-step.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS totp_last_used_step BIGINT;

