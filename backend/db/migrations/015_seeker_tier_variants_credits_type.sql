-- Seeker monthly / annual are stored as tier seeker_monthly | seeker_annual with monthly cycles.
UPDATE public.query_credits
SET credits_type = 'monthly'
WHERE tier IN ('seeker_monthly', 'seeker_annual');
