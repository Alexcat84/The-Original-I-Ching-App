import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RitualDebugPayload = {
  label?: string;
  elapsedMs?: number;
  payload?: Record<string, unknown>;
};

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const body = (await req.json()) as RitualDebugPayload;
    const label = typeof body.label === "string" ? body.label.slice(0, 120) : "unknown";
    const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : -1;
    // payload intentionally not logged — user-controlled data must not reach server logs
    console.log(`[ritual/client][+${elapsedMs}ms] ${label}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
