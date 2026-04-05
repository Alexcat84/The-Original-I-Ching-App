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
    const label = typeof body.label === "string" ? body.label : "unknown";
    const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : -1;
    const payload = body.payload && typeof body.payload === "object" ? body.payload : undefined;
    if (payload) {
      console.log(`[ritual/client][+${elapsedMs}ms] ${label}`, payload);
    } else {
      console.log(`[ritual/client][+${elapsedMs}ms] ${label}`);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
