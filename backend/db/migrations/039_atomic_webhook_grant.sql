-- Atomic idempotent token grant for RevenueCat webhooks.
-- Combines the deduplication insert and the grant_tokens call in a single
-- transaction so a DB failure during dedup can never produce a double grant:
-- either both operations succeed or neither does.
--
-- Returns:
--   'granted'          — event was new; tokens were credited.
--   'already_processed'— duplicate event_hash; no grant performed.
CREATE OR REPLACE FUNCTION public.grant_tokens_idempotent(
  p_event_hash TEXT,
  p_event_type TEXT,
  p_user_id    UUID,
  p_tokens     INTEGER,
  p_pack       TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the event record. Raises unique_violation (23505) if already seen.
  INSERT INTO public.revenuecat_webhook_events (event_hash, event_type, app_user_id)
  VALUES (p_event_hash, p_event_type, p_user_id);

  -- Reached only on first-time events. Grant tokens in the same transaction.
  PERFORM public.grant_tokens(p_user_id, p_tokens, p_pack);

  RETURN 'granted';
EXCEPTION
  WHEN unique_violation THEN
    RETURN 'already_processed';
END;
$$;

-- Restrict execution to service_role only (same policy as consume_token / grant_tokens).
REVOKE EXECUTE ON FUNCTION public.grant_tokens_idempotent(TEXT, TEXT, UUID, INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.grant_tokens_idempotent(TEXT, TEXT, UUID, INTEGER, TEXT)
  TO service_role;

-- Verify.
DO $$
BEGIN
  RAISE NOTICE 'grant_tokens_idempotent created and secured to service_role.';
END $$;
