import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";

export const runtime = "nodejs";

/**
 * Creates a RevenueCat Customer Portal session for the authenticated user.
 * Returns { ok: true, url: string } on success.
 */
export async function POST(req: Request) {
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>;
  try {
    user = await getAuthenticatedUser(req);
  } catch (e) {
    console.error("[API /api/account/create-portal-session] getAuthenticatedUser failed", e);
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
    console.error("[API /api/account/create-portal-session] RevenueCat env vars not configured");
    return apiError(503, {
      error: "billing_not_configured",
      code: "BILLING_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  const returnUrl = appUrl ? `${appUrl}/checkout/success` : "/checkout/success";

  let rcRes: Response;
  try {
    rcRes = await fetch(
      `https://api.revenuecat.com/v2/projects/${projectId}/customers/${user.userId}/customer_portal_sessions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ return_url: returnUrl }),
      },
    );
  } catch (e) {
    console.error("[API /api/account/create-portal-session] RC fetch failed", e);
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }

  if (rcRes.status === 404) {
    return apiError(404, {
      error: "no_active_subscription",
      code: "BILLING_NO_ACTIVE_SUBSCRIPTION",
      message: "No tienes una suscripción activa.",
      action: "upgrade_plan",
    });
  }

  if (!rcRes.ok) {
    console.error("[API /api/account/create-portal-session] RC returned", rcRes.status);
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }

  let body: unknown;
  try {
    body = await rcRes.json();
  } catch {
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }

  const url = (body as Record<string, unknown>)?.url;
  if (typeof url !== "string" || !url) {
    console.error("[API /api/account/create-portal-session] RC response missing url", body);
    return apiError(503, {
      error: "portal_session_failed",
      code: "PORTAL_SESSION_FAILED",
      action: "retry",
    });
  }

  return NextResponse.json({ ok: true, url });
}
