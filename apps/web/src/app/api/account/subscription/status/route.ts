import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getAccountBillingSnapshot } from "@/lib/credits";

export const runtime = "nodejs";

function buildPlansUrl(appUserId: string): string | null {
  const raw = process.env.NEXT_PUBLIC_PLANS_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    url.searchParams.set("app_user_id", appUserId);
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const billing = await getAccountBillingSnapshot(user.userId);
  const managementUrl = buildPlansUrl(user.userId);

  return NextResponse.json({
    ok: true,
    hasActiveSubscription: false,
    subscriptions: [],
    primarySubscription: null,
    managementUrl,
    tokens_available: billing.creditsRemaining,
    tokens_used_lifetime: billing.creditsUsed,
    tokens_purchased_lifetime: billing.tokensPurchasedLifetime,
    last_pack: billing.lastPack,
    session_limit: billing.sessionLimit,
  });
}

