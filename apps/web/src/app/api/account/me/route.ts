import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { getAccountBillingSnapshot } from "@/lib/credits";
import { getSessionLimit as getSessionLimitFromPack } from "@/lib/token-packs";

export const runtime = "nodejs";
const LOG_TOKEN_BALANCE_DEBUG =
  process.env.LOG_TOKEN_BALANCE_DEBUG === "1" || process.env.LOG_TOKEN_BALANCE_DEBUG === "true";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  const billing = await getAccountBillingSnapshot(user.userId);
  const userProfile = await (async () => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const supabase = getSupabaseAdmin();
    if (!supabase) return { enabled: false, method: null as string | null, displayName: null as string | null };
    const { data } = await supabase
      .from("users")
      .select("two_factor_enabled, two_factor_method, display_name")
      .eq("id", user.userId)
      .maybeSingle();
    return {
      enabled: Boolean(data?.two_factor_enabled),
      method: (data?.two_factor_method as string | null) ?? null,
      displayName: (data?.display_name as string | null) ?? null,
    };
  })();
  if (LOG_TOKEN_BALANCE_DEBUG) {
    console.log("[token-debug][account/me] snapshot", {
      user: user.userId.slice(0, 8),
      tokens_available: billing.creditsRemaining,
      tokens_used_lifetime: billing.creditsUsed,
      tokens_purchased_lifetime: billing.tokensPurchasedLifetime,
      last_pack: billing.lastPack,
    });
  }
  return NextResponse.json({
    id: user.userId,
    email: user.email,
    tokens_available: billing.creditsRemaining,
    tokens_used_lifetime: billing.creditsUsed,
    tokens_purchased_lifetime: billing.tokensPurchasedLifetime,
    session_limit: getSessionLimitFromPack(billing.lastPack),
    last_pack: billing.lastPack,
    twoFactorEnabled: userProfile.enabled,
    twoFactorMethod: userProfile.method,
    display_name: userProfile.displayName,
  });
}
