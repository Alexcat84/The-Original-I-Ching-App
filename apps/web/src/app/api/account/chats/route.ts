import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { withSupabaseSemaphore } from "@/lib/supabase-admin";
import {
  buildSupabaseOpTelemetry,
  createApiLogger,
  type ApiLogger,
} from "@/lib/supabase-telemetry";
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

function chatsOpTelemetry(api: ApiLogger, op: string, userId: string, sessionId?: string) {
  return buildSupabaseOpTelemetry(api, op, { userId, sessionId });
}

export async function GET(req: Request) {
  const api = createApiLogger("api/account/chats", req, "/api/account/chats");
  const startedAt = Date.now();

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
  const threadUnified = url.searchParams.get("thread") === "1";
  const metaOnly = url.searchParams.get("meta") === "1";
  const contentOnly = url.searchParams.get("content") === "1";

  const phase = sessionId
    ? threadUnified
      ? "thread"
      : metaOnly
        ? "meta"
        : contentOnly
          ? "content"
          : "legacy_parallel"
    : summary
      ? "summary"
      : "invalid";

  const finish = async (res: NextResponse, extra?: Record<string, unknown>) => {
    api.log.info("chats_get", {
      requestId: api.requestId,
      phase,
      userId: user.userId.slice(0, 8),
      sessionId: sessionId?.slice(0, 8) ?? null,
      durationMs: Date.now() - startedAt,
      status: res.status,
      ...extra,
    });
    await api.log.flush();
    return res;
  };

  if (sessionId) {
    try {
      if (threadUnified) {
        const entry = await withSupabaseSemaphore(
          () => getUserSessionThreadUnified(user.userId, sessionId),
          chatsOpTelemetry(api, "consultations_thread", user.userId, sessionId),
        );
        if (!entry) {
          return finish(
            apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" }),
            { consultCount: 0 },
          );
        }
        return finish(
          NextResponse.json({ session: entry.session, consultations: entry.consultations, phase: "thread" }),
          { consultCount: entry.consultations.length },
        );
      }
      if (metaOnly) {
        const entry = await withSupabaseSemaphore(
          () => getUserSessionThreadMeta(user.userId, sessionId),
          chatsOpTelemetry(api, "consultations_meta", user.userId, sessionId),
        );
        if (!entry) {
          return finish(
            apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" }),
            { consultCount: 0 },
          );
        }
        return finish(
          NextResponse.json({ session: entry.session, consultations: entry.consultations, phase: "meta" }),
          { consultCount: entry.consultations.length },
        );
      }
      if (contentOnly) {
        const rows = await withSupabaseSemaphore(
          () => getUserSessionThreadContent(user.userId, sessionId),
          chatsOpTelemetry(api, "get_session_content_safe", user.userId, sessionId),
        );
        return finish(
          NextResponse.json({ consultationContent: rows, phase: "content" }),
          { contentRows: rows.length },
        );
      }
      const [entry, contentRows] = await withSupabaseSemaphore(
        async () => {
          const meta = await getUserSessionThreadMeta(user.userId, sessionId);
          const content = await getUserSessionThreadContent(user.userId, sessionId).catch(() => []);
          return [meta, content] as const;
        },
        chatsOpTelemetry(api, "consultations_meta_content_bundle", user.userId, sessionId),
      );
      if (!entry) {
        return finish(
          apiError(404, { error: "session_not_found", code: "SESSION_NOT_FOUND", action: "fix_input" }),
          { consultCount: 0 },
        );
      }
      const consultations = mergeConsultationsWithContent(entry.consultations, contentRows);
      return finish(NextResponse.json({ session: entry.session, consultations }), {
        consultCount: consultations.length,
        contentRows: contentRows.length,
      });
    } catch {
      return finish(apiError(503, { error: "db_error", code: "DB_ERROR", action: "retry" }), { error: true });
    }
  }

  if (summary) {
    const sessions = await withSupabaseSemaphore(
      () => getUserSessionSummaries(user.userId),
      chatsOpTelemetry(api, "consultations_summary", user.userId),
    );
    return finish(
      NextResponse.json({
        sessions: sessions.map((entry) => ({
          session: entry.session,
          messageCount: entry.messageCount,
          firstConsultationAt: entry.firstConsultationAt,
          updatedAt: entry.updatedAt,
          firstQuestion: entry.firstQuestion,
        })),
      }),
      { sessionCount: sessions.length },
    );
  }

  return finish(apiError(400, { error: "missing_param", code: "MISSING_PARAM", action: "fix_input" }));
}

export async function DELETE(req: Request) {
  const api = createApiLogger("api/account/chats", req, "/api/account/chats");
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
    api.log.info("chat_delete_not_found_idempotent", {
      requestId: api.requestId,
      userId: user.userId.slice(0, 8),
      sessionId: sessionId.slice(0, 8),
    });
    await api.log.flush();
    return NextResponse.json({ ok: true });
  }
  api.log.info("chat_deleted", {
    requestId: api.requestId,
    userId: user.userId.slice(0, 8),
    sessionId: sessionId.slice(0, 8),
  });
  await api.log.flush();
  return NextResponse.json({ ok: true });
}
