import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { createApiLogger } from "@/lib/supabase-telemetry";
import { rateLimitByKey } from "@/lib/rate-limit";
export const runtime = "nodejs";

const bodySchema = z.object({
  traceId: z.string().min(8).max(128),
  phase: z.string().min(1).max(64),
  ok: z.boolean(),
  reason: z.string().max(128).optional(),
  detail: z.string().max(256).optional(),
  nonceFp: z.string().length(12).optional(),
  tokenLen: z.number().int().min(0).max(100_000).optional(),
});

/**
 * POST /api/integrity/client-event
 * Mobile shell → Axiom bridge for Play Integrity refresh steps (no secrets).
 */
export async function POST(req: NextRequest) {
  const api = createApiLogger("api/integrity/client-event", req, "/api/integrity/client-event");

  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    await api.log.flush();
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const ip =
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = await rateLimitByKey({
    key: `integrity_client_event:${ip}`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.ok) {
    await api.log.flush();
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    await api.log.flush();
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  api.log.info("integrity_client_event", {
    requestId: api.requestId,
    traceId: body.traceId,
    phase: body.phase,
    ok: body.ok,
    reason: body.reason ?? null,
    detail: body.detail ?? null,
    nonceFp: body.nonceFp ?? null,
    tokenLen: body.tokenLen ?? null,
    userId: authUser.userId.slice(0, 8),
  });

  await api.log.flush();
  return NextResponse.json({ ok: true });
}
