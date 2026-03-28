import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";

export const runtime = "nodejs";

type RcListSubscriptionsResponse = {
  items?: Array<{
    id?: string;
    status?: string;
    gives_access?: boolean;
    store?: string;
  }>;
};

type RcAuthenticatedManagementUrlResponse = {
  management_url?: string;
};

export async function POST(req: Request) {
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

  const authHeader = { Authorization: `Bearer ${secret}` };
  const customerId = encodeURIComponent(user.userId);
  const baseV2 = "https://api.revenuecat.com/v2";

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
      return apiError(404, {
        error: "no_active_subscription",
        code: "BILLING_NO_ACTIVE_SUBSCRIPTION",
        action: "fix_input",
      });
    }
    return apiError(502, { error: "billing_upstream_failed", code: "BILLING_SYNC_FAILED", action: "retry" });
  }

  let listJson: RcListSubscriptionsResponse;
  try {
    listJson = (await listRes.json()) as RcListSubscriptionsResponse;
  } catch {
    return apiError(502, { error: "billing_invalid_response", code: "BILLING_SYNC_FAILED", action: "retry" });
  }

  const active = (listJson.items ?? []).find(
    (s) => (s.status === "active" || s.status === "trialing") && s.gives_access === true,
  );
  const subscriptionId = active?.id;
  if (!subscriptionId) {
    return apiError(404, {
      error: "no_active_subscription",
      code: "BILLING_NO_ACTIVE_SUBSCRIPTION",
      action: "fix_input",
      message: "No active subscription found for this account.",
    });
  }

  let portalRes: Response;
  try {
    portalRes = await fetch(
      `${baseV2}/projects/${projectId}/subscriptions/${encodeURIComponent(subscriptionId)}/authenticated_management_url`,
      {
        headers: authHeader,
        cache: "no-store",
      },
    );
  } catch {
    return apiError(502, { error: "billing_upstream_failed", code: "BILLING_SYNC_FAILED", action: "retry" });
  }

  if (!portalRes.ok) {
    return apiError(502, { error: "billing_upstream_failed", code: "BILLING_SYNC_FAILED", action: "retry" });
  }

  let portalJson: RcAuthenticatedManagementUrlResponse;
  try {
    portalJson = (await portalRes.json()) as RcAuthenticatedManagementUrlResponse;
  } catch {
    return apiError(502, { error: "billing_invalid_response", code: "BILLING_SYNC_FAILED", action: "retry" });
  }

  const managementUrl = portalJson.management_url?.trim();
  if (!managementUrl) {
    return apiError(404, {
      error: "subscription_management_unavailable",
      code: "BILLING_SYNC_FAILED",
      action: "retry",
      message: "Management URL is not available for this subscription.",
    });
  }

  return NextResponse.json({ ok: true, managementUrl });
}
