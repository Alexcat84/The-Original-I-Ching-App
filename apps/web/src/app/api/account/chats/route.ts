import { NextResponse } from "next/server";
import { Logger } from "next-axiom";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import {
  deleteUserSession,
  getUserSessionSummaries,
  getUserSessionThreadContent,
  getUserSessionThreadMeta,
  getUserSessionWithConsultations,
  getUserSessionsWithConsultations,
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
  // Two-phase thread loading:
  // ?meta=1   → metadata only (no interpretation/oracle_bones TOAST) — always <5ms
  // ?content=1 → interpretation + oracle_bones only — may be slow on cold buffers
  // no param  → full row (current / backward-compatible behavior)
  const metaOnly = url.searchParams.get("meta") === "1";
  const contentOnly = url.searchParams.get("content") === "1";

  if (sessionId) {
    try {
      if (metaOnly) {
        const entry = await getUserSessionThreadMeta(user.userId, sessionId);
        if (!entry) return apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" });
        return NextResponse.json({ session: entry.session, consultations: entry.consultations, phase: "meta" });
      }
      if (contentOnly) {
        const rows = await getUserSessionThreadContent(user.userId, sessionId);
        return NextResponse.json({ consultationContent: rows, phase: "content" });
      }
      const entry = await getUserSessionWithConsultations(user.userId, sessionId);
      if (!entry) return apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" });
      return NextResponse.json({ session: entry.session, consultations: entry.consultations });
    } catch {
      return apiError(503, { error: "db_error", code: "DB_ERROR", action: "retry" });
    }
  }

  if (summary) {
    const sessions = await getUserSessionSummaries(user.userId);
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

  const sessions = await getUserSessionsWithConsultations(user.userId);
  return NextResponse.json({
    sessions: sessions.map((entry) => ({
      session: entry.session,
      consultations: entry.consultations,
    })),
  });
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

