import { NextResponse } from "next/server";
import { Logger } from "next-axiom";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import {
  deleteUserSession,
  getUserSessionSummaries,
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

  if (sessionId) {
    const entry = await getUserSessionWithConsultations(user.userId, sessionId);
    if (!entry) {
      return apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" });
    }
    return NextResponse.json({
      session: entry.session,
      consultations: entry.consultations,
    });
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
    log.warn("chat_delete_not_found", { userId: user.userId.slice(0, 8), sessionId: sessionId.slice(0, 8) });
    await log.flush();
    return apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" });
  }
  log.info("chat_deleted", { userId: user.userId.slice(0, 8), sessionId: sessionId.slice(0, 8) });
  await log.flush();
  return NextResponse.json({ ok: true });
}

