import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getUserBillingTier } from "@/lib/credits";
import { pickBestActiveV2SubscriptionFromItems, rcV2SubscriptionStatusFromRaw } from "@/lib/revenuecat-rest";

export const runtime = "nodejs";

type SubscriptionView = {
  id: string | null;
  status: string | null;
  givesAccess: boolean;
  store: string | null;
  productId: string | null;
  currentPeriodEndsAt: string | null;
  autoRenew: boolean | null;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asIsoFromUnknown(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return new Date(ms).toISOString();
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "enabled", "active", "will_renew", "on"].includes(normalized)) return true;
    if (["false", "disabled", "inactive", "off", "will_not_renew"].includes(normalized)) return false;
  }
  return null;
}

function parseAutoRenew(raw: Record<string, unknown>): boolean | null {
  const keys = ["auto_renewal_status", "auto_renew_status", "auto_renewing", "will_renew", "is_auto_renewing"];
  for (const key of keys) {
    const parsed = asBoolean(raw[key]);
    if (parsed !== null) return parsed;
  }
  return null;
}

function parseSubscription(raw: Record<string, unknown>): SubscriptionView {
  return {
    id: asString(raw.id),
    status: rcV2SubscriptionStatusFromRaw(raw),
    givesAccess: raw.gives_access === true,
    store: asString(raw.store),
    productId: asString(raw.product_id) ?? asString(raw.product_identifier),
    currentPeriodEndsAt:
      asIsoFromUnknown(raw.current_period_ends_at) ??
      asIsoFromUnknown(raw.ends_at) ??
      asIsoFromUnknown(raw.renews_at) ??
      asIsoFromUnknown(raw.expires_at) ??
      asIsoFromUnknown(raw.expiration_at),
    autoRenew: parseAutoRenew(raw),
  };
}

function isActiveStatus(status: string | null): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return normalized === "active" || normalized === "trialing" || normalized === "in_grace_period";
}

function subscriptionPeriodEndInFuture(iso: string | null): boolean {
  if (!iso) return false;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) && ms > Date.now();
}

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const secret = process.env.REVENUECAT_SECRET_KEY?.trim();
  const projectId = process.env.REVENUECAT_PROJECT_ID?.trim();
  if (!secret || !projectId) {
    return apiError(503, {
      error: "billing_not_configured",
      code: "BILLING_NOT_CONFIGURED",
      action: "check_config",
      message: "Missing REVENUECAT_SECRET_KEY or REVENUECAT_PROJECT_ID.",
    });
  }

  const customerId = encodeURIComponent(user.userId);
  const baseV2 = "https://api.revenuecat.com/v2";
  const authHeader = { Authorization: `Bearer ${secret}` };

  let listRes: Response;
  try {
    listRes = await fetch(`${baseV2}/projects/${projectId}/customers/${customerId}/subscriptions`, {
      headers: authHeader,
      cache: "no-store",
    });
  } catch {
    return apiError(502, { error: "billing_upstream_failed", code: "BILLING_SYNC_FAILED", action: "retry" });
  }

  if (!listRes.ok) {
    if (listRes.status === 404 || listRes.status === 400) {
      return NextResponse.json({
        ok: true,
        hasActiveSubscription: false,
        tier: await getUserBillingTier(user.userId),
        subscriptions: [] as SubscriptionView[],
        primarySubscription: null,
        managementUrl: null,
      });
    }
    return apiError(502, { error: "billing_upstream_failed", code: "BILLING_SYNC_FAILED", action: "retry" });
  }

  const payload = (await listRes.json().catch(() => null)) as { items?: unknown[] } | null;
  if (!payload || !Array.isArray(payload.items)) {
    return apiError(502, { error: "billing_invalid_response", code: "BILLING_SYNC_FAILED", action: "retry" });
  }

  const rawItems = payload.items.filter(
    (it): it is Record<string, unknown> => typeof it === "object" && it !== null,
  );
  const subscriptions = rawItems.map(parseSubscription);

  const bestRaw = pickBestActiveV2SubscriptionFromItems(payload.items);
  const primary = bestRaw ? parseSubscription(bestRaw.raw) : null;

  let managementUrl: string | null = null;
  if (primary?.id) {
    try {
      const portalRes = await fetch(
        `${baseV2}/projects/${projectId}/subscriptions/${encodeURIComponent(primary.id)}/authenticated_management_url`,
        { headers: authHeader, cache: "no-store" },
      );
      if (portalRes.ok) {
        const portalJson = (await portalRes.json().catch(() => null)) as { management_url?: string } | null;
        managementUrl = asString(portalJson?.management_url) ?? null;
      }
    } catch {
      managementUrl = null;
    }
  }

  return NextResponse.json({
    ok: true,
    tier: await getUserBillingTier(user.userId),
    hasActiveSubscription: Boolean(
      primary &&
        (primary.givesAccess ||
          isActiveStatus(primary.status) ||
          subscriptionPeriodEndInFuture(primary.currentPeriodEndsAt)),
    ),
    subscriptions,
    primarySubscription: primary,
    managementUrl,
  });
}

