import { NextResponse } from "next/server";
import { Logger } from "next-axiom";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// All locale-specific confirmation words from home-chrome-ui deleteAccountConfirmWord
const VALID_CONFIRMATIONS = new Set(["DELETE", "ELIMINAR", "SUPPRIMER", "LÖSCHEN", "ELIMINA"]);

export async function POST(req: Request) {
  const log = new Logger({ source: "api/account/delete" });

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(400, { error: "invalid_body", code: "INVALID_BODY", action: "fix_input" });
  }
  const confirmation = (body as Record<string, unknown>)?.confirmation;
  if (typeof confirmation !== "string" || !VALID_CONFIRMATIONS.has(confirmation.trim().toUpperCase())) {
    return apiError(400, {
      error: "confirmation_required",
      code: "CONFIRMATION_REQUIRED",
      action: "fix_input",
      message: 'Send { "confirmation": "DELETE" } to confirm.',
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    log.error("account_delete_no_supabase_admin", { userId: user.userId.slice(0, 8) });
    await log.flush();
    return apiError(500, { error: "server_error", code: "SERVER_ERROR", action: "retry" });
  }

  const userId = user.userId;

  // 1. Anonymize RevenueCat webhook events (purchase records kept for legal/tax).
  // app_user_id is UUID — cannot store a prefixed string; NULL preserves the row
  // for audit/tax purposes without linking it to any identifiable user.
  const { error: webhookErr } = await supabase
    .from("revenuecat_webhook_events")
    .update({ app_user_id: null })
    .eq("app_user_id", userId);
  if (webhookErr) {
    log.warn("account_delete_webhook_anonymize_failed", { userId: userId.slice(0, 8), error: webhookErr.message });
  }

  // 2. Call RevenueCat API to delete subscriber data (best effort).
  const rcSecret = process.env.REVENUECAT_SECRET_KEY;
  if (rcSecret) {
    try {
      const rcRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${rcSecret}` },
      });
      if (!rcRes.ok && rcRes.status !== 404) {
        log.warn("account_delete_revenuecat_api_failed", { userId: userId.slice(0, 8), status: rcRes.status });
      }
    } catch (e) {
      log.warn("account_delete_revenuecat_fetch_error", { userId: userId.slice(0, 8), error: String(e) });
    }
  }

  // 3. Delete from Supabase Auth — trigger on_auth_user_deleted cascades public.users → all child tables.
  const { error: authDeleteErr } = await supabase.auth.admin.deleteUser(userId);
  if (authDeleteErr) {
    log.error("account_delete_auth_failed", { userId: userId.slice(0, 8), error: authDeleteErr.message });
    await log.flush();
    return apiError(500, { error: "delete_failed", code: "DELETE_FAILED", action: "retry" });
  }

  log.info("account_deleted", { userId: userId.slice(0, 8) });
  await log.flush();
  return NextResponse.json({ deleted: true });
}
