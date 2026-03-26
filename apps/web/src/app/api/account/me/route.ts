import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { CREDITS_PER_MONTH, getUserBillingTier } from "@/lib/credits";
import { CONTEXT_LIMITS, type TierKey } from "@iching-oracle/context-engine";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  const tier = await getUserBillingTier(user.userId);
  const tierKey = (tier in CONTEXT_LIMITS ? tier : "free") as TierKey;
  return NextResponse.json({
    email: user.email,
    tier: tierKey,
    creditsLimit: CREDITS_PER_MONTH[tierKey],
    sessionDepthLimit: CONTEXT_LIMITS[tierKey].sessionDepth,
  });
}
