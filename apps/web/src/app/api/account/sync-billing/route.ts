import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { syncUserTierFromRevenueCatRest } from "@/lib/revenuecat-rest";

export const runtime = "nodejs";

/**
 * Pulls the current subscriber from RevenueCat (REST) and updates Postgres tier/credits.
 * Complements webhooks (e.g. after Web SDK identify, or if a webhook was missed).
 */
export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const result = await syncUserTierFromRevenueCatRest(user.userId);
  if (!result.ok) {
    const status = result.error === "not_configured" ? 503 : 502;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    tier: result.tier,
    source: result.source,
  });
}
