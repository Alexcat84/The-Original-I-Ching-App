import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";

export const runtime = "nodejs";

const RC_V2 = "https://api.revenuecat.com/v2";

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
  console.log("[portal] RC customer lookup:", JSON.stringify(data));
  const d = data as Record<string, unknown>;
  // The original app_user_id is in `id` on the customer object
  const originalId = typeof d.id === "string" && d.id.trim() ? d.id.trim() : null;
  if (originalId) console.log("[portal] RC original app_user_id:", originalId);
  return originalId;
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

  const returnUrl = appUrl ? `${appUrl}/checkout/success` : "/checkout/success";
  console.log("[portal] app_user_id (Supabase UUID):", user.userId);
  console.log("[portal] return_url:", returnUrl);

  // Step 1: try with the Supabase UUID directly
  let attempt: { status: number; body: string };
  try {
    attempt = await createPortalSession(secretKey, projectId, user.userId, returnUrl);
  } catch (e) {
    console.error("[portal] RC fetch failed (step 1)", e);
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }

  if (attempt.status !== 404) {
    // Success or a non-404 error — handle without alias fallback
    if (!isOkStatus(attempt.status)) {
      return apiError(503, {
        error: "portal_session_failed",
        code: "PORTAL_SESSION_FAILED",
        action: "retry",
      });
    }
    return portalSessionResponse(attempt.body);
  }

  // Step 2: UUID is an alias — look up the original RC app_user_id
  console.log("[portal] step 1 returned 404 — looking up RC original app_user_id");
  const originalId = await lookupRCOriginalUserId(secretKey, projectId, user.userId);
  if (!originalId || originalId === user.userId) {
    // No original ID found or same as alias — cannot proceed
    return apiError(404, {
      error: "no_active_subscription",
      code: "BILLING_NO_ACTIVE_SUBSCRIPTION",
      message: "No tienes una suscripción activa.",
      action: "upgrade_plan",
    });
  }

  // Step 3: retry with the original ID
  let retry: { status: number; body: string };
  try {
    retry = await createPortalSession(secretKey, projectId, originalId, returnUrl);
  } catch (e) {
    console.error("[portal] RC fetch failed (step 3)", e);
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
