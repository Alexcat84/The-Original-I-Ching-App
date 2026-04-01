type RcSubscriptionRaw = Record<string, unknown>;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toEpochMs(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    // Some providers serialize UNIX seconds while others return milliseconds.
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return NaN;
}

function normalizedStatus(raw: RcSubscriptionRaw): string {
  const keys = ["status", "state", "subscription_status"] as const;
  for (const key of keys) {
    const value = asString(raw[key]);
    if (value) return value.toLowerCase();
  }
  return "";
}

function periodEndMs(raw: RcSubscriptionRaw): number {
  const keys = [
    "current_period_ends_at",
    "expires_at",
    "expiration_at",
    "ends_at",
    "renews_at",
  ] as const;
  for (const key of keys) {
    const ms = toEpochMs(raw[key]);
    if (Number.isFinite(ms)) return ms;
  }
  return NaN;
}

function autoRenewEnabled(raw: RcSubscriptionRaw): boolean {
  const keys = ["auto_renewal_status", "auto_renew_status", "auto_renewing", "will_renew", "is_auto_renewing"] as const;
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "enabled", "active", "will_renew", "on"].includes(normalized)) return true;
    }
  }
  return false;
}

function isLikelyActive(raw: RcSubscriptionRaw): boolean {
  const status = normalizedStatus(raw);
  if (status === "expired" || status === "canceled" || status === "revoked") return false;
  if (status === "active" || status === "trialing" || status === "in_grace_period") return true;
  if (raw.gives_access === true) return true;
  if (autoRenewEnabled(raw)) return true;
  const endMs = periodEndMs(raw);
  return Number.isFinite(endMs) && endMs > Date.now();
}

/**
 * Picks a primary active subscription row without depending on product→tier mapping.
 * This is used for management URL / portal access where active-ness is enough.
 */
export function pickPrimaryActiveV2Subscription(items: unknown[]): RcSubscriptionRaw | null {
  const rows = items.filter(
    (it): it is RcSubscriptionRaw => typeof it === "object" && it !== null,
  );
  const activeRows = rows.filter(isLikelyActive);
  if (activeRows.length === 0) return null;

  const ranked = activeRows
    .map((raw) => {
      const status = normalizedStatus(raw);
      const givesAccess = raw.gives_access === true;
      const endMs = periodEndMs(raw);
      return {
        raw,
        score: givesAccess ? 2 : status === "active" || status === "trialing" || status === "in_grace_period" ? 1 : 0,
        endMs: Number.isFinite(endMs) ? endMs : 0,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.endMs - a.endMs;
    });

  return ranked[0]?.raw ?? null;
}
