import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, expectedAdminToken } from "@/lib/admin-auth";
import { rateLimitByKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { key?: string };
  try {
    body = (await req.json()) as { key?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimitByKey({ key: `admin_login:${ip}`, limit: 10, windowSeconds: 900 });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  const secret = process.env.ADMIN_PANEL_KEY;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "admin_not_configured" }, { status: 503 });
  }
  if (!body.key || body.key !== secret) {
    return NextResponse.json({ ok: false, error: "invalid_key" }, { status: 401 });
  }
  const token = expectedAdminToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

