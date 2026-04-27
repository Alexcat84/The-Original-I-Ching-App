# Database Audits & Troubleshooting

This folder contains SQL scripts to quickly diagnose and repair critical data/auth drift in Supabase projects.

## Files

- `001_system_health_snapshot.sql`
  - Read-only global health snapshot.
  - Use first when onboarding a new DB or investigating incidents.
  - Checks:
    - `auth.users` / `public.users` / `query_credits` consistency
    - missing credits rows
    - critical trigger/functions presence
    - internal-table RLS/policy surface

- `002_user_drilldown.sql`
  - Read-only user-level diagnostic.
  - Use when one account behaves incorrectly (missing credits, history mismatch, login anomalies).
  - Set `p_user_id` or `p_email` in the `params` CTE before running.

- `003_repair_recipes.sql`
  - Controlled repair script (idempotent statements).
  - Use only after confirming drift via `001` / `002`.
  - Repairs:
    - backfill `public.users` from `auth.users`
    - backfill missing free bootstrap credits
    - recreate `on_auth_user_created` trigger with free bootstrap hook

## Recommended Runbook

1. Run `001_system_health_snapshot.sql`.
2. If impact is user-specific, run `002_user_drilldown.sql`.
3. If drift is confirmed, run `003_repair_recipes.sql`.
4. Re-run `001_system_health_snapshot.sql` to verify all checks are healthy.

## Safety Notes

- Run repair statements from a privileged SQL context (service role/admin).
- Prefer running repairs first in Preview/Staging before Production.
- `003` is designed to be idempotent, but still execute under change control.
- Keep this folder updated whenever new auth/billing tables or functions are introduced.

## Migration Alignment

For clean project bootstrap, ensure these migrations are applied:

- `023_auth_user_free_bootstrap_sync.sql`
- `024_security_baseline_hardening.sql`

These migrations enforce the baseline assumptions audited by this folder.

