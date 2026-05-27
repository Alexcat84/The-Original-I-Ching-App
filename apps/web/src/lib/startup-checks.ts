const CRITICAL_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

let _checked = false;

// Call once per cold start from critical API routes. Logs missing vars loudly
// so misconfigured deployments surface immediately rather than failing silently
// per-request with cryptic null-pointer errors.
export function assertCriticalConfig(): void {
  if (_checked || process.env.NODE_ENV !== "production") return;
  _checked = true;
  const missing = CRITICAL_VARS.filter((v) => !process.env[v]?.trim());
  if (missing.length > 0) {
    console.error(
      `[startup] CRITICAL CONFIG MISSING in production: ${missing.join(", ")}. ` +
        "Requests to auth/consult/admin routes will fail. Set these in Vercel environment variables.",
    );
  }
}
