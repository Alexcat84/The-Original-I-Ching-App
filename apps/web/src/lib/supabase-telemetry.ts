import { Logger } from "next-axiom";

export function isSupabaseTelemetryEnabled(): boolean {
  const v = process.env.LOG_SUPABASE_TELEMETRY;
  return v === "1" || v === "true";
}

export function getRequestId(req: Request): string {
  return (
    req.headers.get("x-vercel-id") ??
    req.headers.get("x-request-id") ??
    crypto.randomUUID().slice(0, 12)
  );
}

export function prefixId(id: string | null | undefined): string | null {
  if (!id || id.length < 8) return id ?? null;
  return id.slice(0, 8);
}

export type ApiLogger = {
  log: Logger;
  requestId: string;
  route: string;
};

export function createApiLogger(source: string, req: Request, route: string): ApiLogger {
  return {
    log: new Logger({ source }),
    requestId: getRequestId(req),
    route,
  };
}

export type SupabaseOpTelemetry = {
  log: Logger;
  requestId: string;
  route: string;
  op: string;
  userIdPrefix?: string | null;
  sessionIdPrefix?: string | null;
};

export function logSupabaseOp(
  ctx: SupabaseOpTelemetry,
  result: {
    waitMs: number;
    execMs: number;
    activeCount: number;
    queueDepth: number;
    ok: boolean;
    error?: string;
  },
): void {
  if (!isSupabaseTelemetryEnabled()) return;
  ctx.log.info("supabase_op", {
    requestId: ctx.requestId,
    route: ctx.route,
    op: ctx.op,
    userId: ctx.userIdPrefix ?? null,
    sessionId: ctx.sessionIdPrefix ?? null,
    waitMs: result.waitMs,
    execMs: result.execMs,
    activeCount: result.activeCount,
    queueDepth: result.queueDepth,
    ok: result.ok,
    error: result.error ?? null,
  });
}

export function logConsultPhase(
  log: Logger,
  requestId: string,
  phase: string,
  startedAt: number,
  extra?: Record<string, unknown>,
): void {
  if (!isSupabaseTelemetryEnabled()) return;
  log.info("consult_phase", {
    requestId,
    phase,
    elapsedMs: Date.now() - startedAt,
    ...extra,
  });
}

export function buildSupabaseOpTelemetry(
  api: ApiLogger,
  op: string,
  ids?: { userId?: string; sessionId?: string },
): SupabaseOpTelemetry {
  return {
    log: api.log,
    requestId: api.requestId,
    route: api.route,
    op,
    userIdPrefix: prefixId(ids?.userId),
    sessionIdPrefix: prefixId(ids?.sessionId),
  };
}

export function logConsultRitual(
  log: Logger,
  requestId: string,
  label: string,
  ritualStartedAt: number,
  extra?: Record<string, unknown>,
): void {
  if (!isSupabaseTelemetryEnabled()) return;
  log.info("consult_ritual", {
    requestId,
    label,
    elapsedMs: Date.now() - ritualStartedAt,
    ...extra,
  });
}
