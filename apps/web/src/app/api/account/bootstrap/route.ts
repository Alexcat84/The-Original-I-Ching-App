import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { getAccountBillingSnapshot } from "@/lib/credits";
import { getUserSessionSummaries, isChatPersistenceConfigured } from "@/lib/session-store";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "@/lib/legal-consent";
import { getSessionLimit as getSessionLimitFromPack } from "@/lib/token-packs";
import { withSupabaseSemaphore } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Single login bootstrap call — replaces the concurrent /api/account/me +
 * /api/account/chats?summary=1 pair fired at page load.
 * Runs billing, profile, legal, and session-summary queries sequentially
 * (one PostgREST connection at a time within a single semaphore slot).
 */
export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  const supabase = getSupabaseAdmin();

  const persistenceOk = isChatPersistenceConfigured();

  const { billing, sessions, profileRow, legalRow } = await withSupabaseSemaphore(async () => {
    const billingSnapshot = await getAccountBillingSnapshot(user.userId);
    const sessionSummaries = persistenceOk
      ? await getUserSessionSummaries(user.userId).catch(() => [])
      : [];
    const profile = supabase
      ? (
          await supabase
            .from("users")
            .select("two_factor_enabled, two_factor_method, display_name, is_admin, tour_v1_completed_at")
            .eq("id", user.userId)
            .maybeSingle()
        ).data
      : null;
    const legal = supabase
      ? (
          await supabase
            .from("user_legal_acceptances")
            .select("id")
            .eq("user_id", user.userId)
            .eq("terms_version", CURRENT_TERMS_VERSION)
            .eq("privacy_version", CURRENT_PRIVACY_VERSION)
            .maybeSingle()
        ).data
      : null;
    return {
      billing: billingSnapshot,
      sessions: sessionSummaries,
      profileRow: profile,
      legalRow: legal,
    };
  });

  return NextResponse.json({
    // ── Account (same shape as /api/account/me) ───────────────────────────
    id: user.userId,
    email: user.email,
    tokens_available: billing.creditsRemaining,
    tokens_used_lifetime: billing.creditsUsed,
    tokens_purchased_lifetime: billing.tokensPurchasedLifetime,
    session_limit: getSessionLimitFromPack(billing.lastPack),
    last_pack: billing.lastPack,
    twoFactorEnabled: Boolean(profileRow?.two_factor_enabled),
    twoFactorMethod: (profileRow?.two_factor_method as string | null) ?? null,
    display_name: (profileRow?.display_name as string | null) ?? null,
    is_admin: profileRow?.is_admin === true,
    tour_v1_completed: Boolean(profileRow?.tour_v1_completed_at),
    legal_terms_version: CURRENT_TERMS_VERSION,
    legal_privacy_version: CURRENT_PRIVACY_VERSION,
    legal_acceptance_current: Boolean(legalRow?.id),
    // ── Sessions (same shape as /api/account/chats?summary=1) ────────────
    sessions: sessions.map((entry) => ({
      session: entry.session,
      messageCount: entry.messageCount,
      firstConsultationAt: entry.firstConsultationAt,
      updatedAt: entry.updatedAt,
      firstQuestion: entry.firstQuestion,
    })),
  });
}
