import { NextResponse } from "next/server";
import { Logger } from "next-axiom";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { withSupabaseSemaphore } from "@/lib/supabase-admin";
import {
  deleteUserSession,
  getUserSessionSummaries,
  getUserSessionThreadContent,
  getUserSessionThreadMeta,
  getUserSessionThreadUnified,
  mergeConsultationsWithContent,
  isChatPersistenceConfigured,
} from "@/lib/session-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isChatPersistenceConfigured()) {
    return apiError(503, {
      error: "chat_persistence_not_configured",
      code: "CHAT_PERSISTENCE_NOT_CONFIGURED",
      action: "check_config",
    });
  }
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  const url = new URL(req.url);
  const summary = url.searchParams.get("summary") === "1";
  const sessionId = url.searchParams.get("sessionId");
  // Unified thread load (preferred): meta + content in one request, sequential DB ops.
  const threadUnified = url.searchParams.get("thread") === "1";
  // Two-phase thread loading (legacy APK):
  // ?meta=1   → metadata only (no interpretation/oracle_bones TOAST) — always <5ms
  // ?content=1 → interpretation + oracle_bones only — may be slow on cold buffers
  const metaOnly = url.searchParams.get("meta") === "1";
  const contentOnly = url.searchParams.get("content") === "1";

  if (sessionId) {
    try {
      if (threadUnified) {
        const entry = await withSupabaseSemaphore(() =>
          getUserSessionThreadUnified(user.userId, sessionId),
        );
        if (!entry) return apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" });
        return NextResponse.json({ session: entry.session, consultations: entry.consultations, phase: "thread" });
      }
      if (metaOnly) {
        const entry = await withSupabaseSemaphore(() => getUserSessionThreadMeta(user.userId, sessionId));
        if (!entry) return apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" });
        return NextResponse.json({ session: entry.session, consultations: entry.consultations, phase: "meta" });
      }
      if (contentOnly) {
        const rows = await withSupabaseSemaphore(() => getUserSessionThreadContent(user.userId, sessionId));
        return NextResponse.json({ consultationContent: rows, phase: "content" });
      }
      // Parallel fetch: meta (no TOAST, always fast) + content via RPC with
      // 8 s statement_timeout (protected against Warp thread kills on cold buffer).
      // If content fetch times out, consultations degrade to summary placeholders.
      const [entry, contentRows] = await withSupabaseSemaphore(async () => {
        const meta = await getUserSessionThreadMeta(user.userId, sessionId);
        const content = await getUserSessionThreadContent(user.userId, sessionId).catch(() => []);
        return [meta, content] as const;
      });
      if (!entry) return apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" });
      const consultations = mergeConsultationsWithContent(entry.consultations, contentRows);
      return NextResponse.json({ session: entry.session, consultations });
    } catch {
      return apiError(503, { error: "db_error", code: "DB_ERROR", action: "retry" });
    }
  }

  if (summary) {
    const sessions = await withSupabaseSemaphore(() => getUserSessionSummaries(user.userId));
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

  // No sessionId or summary param — this path read all TOAST for all sessions
  // (getUserSessionsWithConsultations) which reliably caused Warp timeouts on
  // cold shared_buffers. No current client sends this request; return 400 so
  // any accidental caller gets a clear error instead of a silent Warp kill.
  return apiError(400, { error: "missing_param", code: "MISSING_PARAM", action: "fix_input" });
}

export async function DELETE(req: Request) {
  const log = new Logger({ source: "api/account/chats" });
  if (!isChatPersistenceConfigured()) {
    return apiError(503, {
      error: "chat_persistence_not_configured",
      code: "CHAT_PERSISTENCE_NOT_CONFIGURED",
      action: "check_config",
    });
  }
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return apiError(400, { error: "invalid_session_id", code: "SESSION_ID_REQUIRED", action: "fix_input" });
  }
  const ok = await deleteUserSession(user.userId, sessionId);
  if (!ok) {
    // Session not in DB (already deleted or only in local cache) — idempotent: treat as success.
    log.info("chat_delete_not_found_idempotent", { userId: user.userId.slice(0, 8), sessionId: sessionId.slice(0, 8) });
    await log.flush();
    return NextResponse.json({ ok: true });
  }
  log.info("chat_deleted", { userId: user.userId.slice(0, 8), sessionId: sessionId.slice(0, 8) });
  await log.flush();
  return NextResponse.json({ ok: true });
}

