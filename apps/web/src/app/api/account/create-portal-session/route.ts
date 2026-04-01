import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { CHECKOUT_SUCCESS_PATH } from "@/lib/checkout-routes";
import { lookupCanonicalRevenueCatAppUserId } from "@/lib/revenuecat-alias-map";

export const runtime = "nodejs";

const RC_V2 = "https://api.revenuecat.com/v2";

function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function collectStringValuesDeep(node: unknown, out: string[]): void {
  if (typeof node === "string") {
    out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectStringValuesDeep(item, out);
    return;
  }
  if (node && typeof node === "object") {
    for (const value of Object.values(node as Record<string, unknown>)) {
      collectStringValuesDeep(value, out);
    }
  }
}

function collectIdsFromUnknownArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      ids.push(item);
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    for (const key of ["id", "app_user_id", "original_app_user_id", "alias"] as const) {
      const maybe = obj[key];
      if (typeof maybe === "string") ids.push(maybe);
    }
  }
  return ids;
}

function collectIdsFromUnknownObject(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const obj = value as Record<string, unknown>;
  const ids: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof k === "string" && k.trim()) ids.push(k);
    if (typeof v === "string") ids.push(v);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const key of ["id", "app_user_id", "original_app_user_id", "alias"] as const) {
        const maybe = (v as Record<string, unknown>)[key];
        if (typeof maybe === "string") ids.push(maybe);
      }
    }
  }
  return ids;
}

function extractPortalCandidateIds(
  raw: unknown,
  aliasId: string,
): { candidates: string[]; picked: string | null } {
  if (!raw || typeof raw !== "object") {
    return { candidates: [], picked: null };
  }
  const obj = raw as Record<string, unknown>;
  const customer =
    obj.customer && typeof obj.customer === "object" && obj.customer !== null
      ? (obj.customer as Record<string, unknown>)
      : null;

  const topKnown = uniqueNonEmpty([
    typeof obj.original_app_user_id === "string" ? obj.original_app_user_id : null,
    typeof obj.id === "string" ? obj.id : null,
    typeof obj.app_user_id === "string" ? obj.app_user_id : null,
    ...(typeof obj.aliases === "string"
      ? [obj.aliases]
      : [...collectIdsFromUnknownArray(obj.aliases), ...collectIdsFromUnknownObject(obj.aliases)]),
    ...(typeof obj.app_user_ids === "string"
      ? [obj.app_user_ids]
      : [
          ...collectIdsFromUnknownArray(obj.app_user_ids),
          ...collectIdsFromUnknownObject(obj.app_user_ids),
        ]),
  ]);
  const customerKnown = customer
    ? uniqueNonEmpty([
        typeof customer.original_app_user_id === "string" ? customer.original_app_user_id : null,
        typeof customer.id === "string" ? customer.id : null,
        typeof customer.app_user_id === "string" ? customer.app_user_id : null,
        ...(typeof customer.aliases === "string"
          ? [customer.aliases]
          : [
              ...collectIdsFromUnknownArray(customer.aliases),
              ...collectIdsFromUnknownObject(customer.aliases),
            ]),
        ...(typeof customer.app_user_ids === "string"
          ? [customer.app_user_ids]
          : [
              ...collectIdsFromUnknownArray(customer.app_user_ids),
              ...collectIdsFromUnknownObject(customer.app_user_ids),
            ]),
      ])
    : [];

  const deepStrings: string[] = [];
  collectStringValuesDeep(raw, deepStrings);
  const deepAnonymousIds = uniqueNonEmpty(
    deepStrings.filter((s) => s.includes("$RCAnonymousID")),
  );

  const candidates = uniqueNonEmpty([...topKnown, ...customerKnown, ...deepAnonymousIds]);
  const withoutAlias = candidates.filter((id) => id !== aliasId);
  const anonymousCandidate = withoutAlias.find((id) => id.startsWith("$RCAnonymousID:")) ?? null;
  const picked = anonymousCandidate ?? withoutAlias[0] ?? null;
  return { candidates, picked };
}

async function createPortalSession(
  secretKey: string,
  projectId: string,
  appUserId: string,
  returnUrl: string,
): Promise<{ status: number; body: string }> {
  const url = `${RC_V2}/projects/${projectId}/customers/${encodeURIComponent(appUserId)}/customer_portal_sessions`;
  console.log("[portal] POST customer_portal_sessions for:", appUserId);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ return_url: returnUrl }),
  });
  const body = await res.text();
  console.log("[portal] RC response status:", res.status, "body:", body);
  return { status: res.status, body };
}

async function lookupRCOriginalUserId(
  secretKey: string,
  projectId: string,
  aliasId: string,
): Promise<string | null> {
  const url = `${RC_V2}/projects/${projectId}/customers/${encodeURIComponent(aliasId)}`;
  console.log("[portal] GET RC customer for alias:", aliasId);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}`, Accept: "application/json" },
      cache: "no-store",
    });
  } catch (e) {
    console.error("[portal] RC customer lookup fetch failed", e);
    return null;
  }
  const text = await res.text();
  console.log("[portal] RC customer lookup status:", res.status, "body:", text);
  if (!res.ok) return null;
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  console.log("[portal] RC customer FULL body:", JSON.stringify(data, null, 2));
  const extracted = extractPortalCandidateIds(data, aliasId);
  console.log("[portal] RC customer candidate ids:", extracted.candidates);
  if (extracted.picked) {
    console.log("[portal] RC picked portal app_user_id:", extracted.picked);
  }
  return extracted.picked;
}

/**
 * Creates a RevenueCat Customer Portal session for the authenticated user.
 * RC's customer_portal_sessions endpoint requires the *original* app_user_id,
 * not an alias. If the Supabase UUID is only an alias, we look up the customer
 * to get the original ID and retry.
 */
export async function POST(req: Request) {
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>;
  try {
    user = await getAuthenticatedUser(req);
  } catch (e) {
    console.error("[portal] getAuthenticatedUser failed", e);
    return apiError(502, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const secretKey = process.env.REVENUECAT_SECRET_KEY?.trim();
  const projectId = process.env.REVENUECAT_PROJECT_ID?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!secretKey || !projectId) {
    console.error("[portal] RevenueCat env vars not configured");
    return apiError(503, {
      error: "billing_not_configured",
      code: "BILLING_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  const returnUrl = appUrl ? `${appUrl}${CHECKOUT_SUCCESS_PATH}` : CHECKOUT_SUCCESS_PATH;
  console.log("[portal] app_user_id (Supabase UUID):", user.userId);
  console.log("[portal] return_url:", returnUrl);

  const mappedCanonical = await lookupCanonicalRevenueCatAppUserId(user.userId);
  if (mappedCanonical) {
    console.log("[portal] mapped canonical app_user_id from DB:", mappedCanonical);
  }
  const candidateIds = uniqueNonEmpty([user.userId, mappedCanonical]);

  let last404 = false;
  for (const candidate of candidateIds) {
    let attempt: { status: number; body: string };
    try {
      attempt = await createPortalSession(secretKey, projectId, candidate, returnUrl);
    } catch (e) {
      console.error("[portal] RC fetch failed for candidate:", candidate, e);
      return apiError(503, {
        error: "portal_session_failed",
        code: "PORTAL_SESSION_FAILED",
        action: "retry",
      });
    }
    if (attempt.status === 404) {
      last404 = true;
      continue;
    }
    if (!isOkStatus(attempt.status)) {
      return apiError(503, {
        error: "portal_session_failed",
        code: "PORTAL_SESSION_FAILED",
        action: "retry",
      });
    }
    return portalSessionResponse(attempt.body);
  }

  // UUID may still be an alias and DB map may be stale/missing.
  console.log("[portal] all known candidates returned 404 — looking up RC original app_user_id");
  const originalId = await lookupRCOriginalUserId(secretKey, projectId, user.userId);
  if (!originalId || candidateIds.includes(originalId)) {
    if (last404) {
      return apiError(404, {
        error: "no_active_subscription",
        code: "BILLING_NO_ACTIVE_SUBSCRIPTION",
        message: "No tienes una suscripción activa.",
        action: "upgrade_plan",
      });
    }
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }

  let retry: { status: number; body: string };
  try {
    retry = await createPortalSession(secretKey, projectId, originalId, returnUrl);
  } catch (e) {
    console.error("[portal] RC fetch failed (originalId retry)", e);
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }

  if (retry.status === 404) {
    return apiError(404, {
      error: "no_active_subscription",
      code: "BILLING_NO_ACTIVE_SUBSCRIPTION",
      message: "No tienes una suscripción activa.",
      action: "upgrade_plan",
    });
  }
  if (!isOkStatus(retry.status)) {
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }
  return portalSessionResponse(retry.body);
}

function isOkStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

function portalSessionResponse(rawBody: string) {
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.error("[portal] failed to parse RC response as JSON");
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }
  const url = (body as Record<string, unknown>)?.url;
  if (typeof url !== "string" || !url) {
    console.error("[portal] RC response missing url", body);
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }
  return NextResponse.json({ ok: true, url });
}
