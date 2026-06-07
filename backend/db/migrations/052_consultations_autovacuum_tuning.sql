-- Tune autovacuum for the consultations table to prevent TOAST staleness.
-- The default autovacuum settings (scale_factor=0.2, vacuum_cost_delay=2ms)
-- are too conservative for a table whose interpretation column is TOAST-stored
-- at 10-15KB per row. After a cold-buffer restart event, stale TOAST data
-- causes index scans to take 10-15s instead of <5ms. Aggressive autovacuum
-- keeps statistics fresh and TOAST chunks hot in shared_buffers.
ALTER TABLE public.consultations SET (
  autovacuum_vacuum_scale_factor     = 0.01,   -- vacuum after 1% row churn (vs default 20%)
  autovacuum_analyze_scale_factor    = 0.005,  -- analyze after 0.5% row churn (vs default 10%)
  autovacuum_vacuum_cost_delay       = 2,      -- ms (default 2 — keep it low for fast completion)
  autovacuum_vacuum_insert_scale_factor = 0.01 -- also vacuum on inserts (consultation table is insert-heavy)
);

-- Verify the settings were applied.
SELECT relname, reloptions
FROM pg_class
WHERE relname = 'consultations' AND relnamespace = 'public'::regnamespace;
