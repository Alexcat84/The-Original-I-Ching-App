import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { getUserSessionSummaries, isChatPersistenceConfigured } from "@/lib/session-store";
import { withSupabaseSemaphore } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Lightweight session-list endpoint for the native APK sync layer.
 * Runs a single PostgREST query (sessions summary only) instead of the
 * 4-query /api/account/bootstrap. The native side only needs `sessions[]`
 * to populate its SQLite cache — it does not use billing, profile, or legal data.
 *
 * Replaces the native syncChats() call to /api/account/bootstrap, which was
 * causing a double-bootstrap burst (8 concurrent PostgREST connections) every
 * time a user logged in.
 */
export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  if (!isChatPersistenceConfigured()) {
    return NextResponse.json({ sessions: [] });
  }

  const sessions = await withSupabaseSemaphore(() =>
    getUserSessionSummaries(user.userId).catch(() => []),
  );

  return NextResponse.json({
    sessions: sessions.map((entry) => ({
      session: entry.session,
      messageCount: entry.messageCount,
      firstConsultationAt: entry.firstConsultationAt,
      updatedAt: entry.updatedAt,
      firstQuestion: entry.firstQuestion,
    })),
  });
}
