import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getUserBillingTier, getTokenBalance, getSessionLimit } from "@/lib/credits";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const [creditsRemaining, lastPack, sessionLimit] = await Promise.all([
    getTokenBalance(user.userId),
    getUserBillingTier(user.userId),
    getSessionLimit(user.userId),
  ]);

  return NextResponse.json({
    ok: true,
    creditsRemaining,
    lastPack,
    sessionLimit,
  });
}
