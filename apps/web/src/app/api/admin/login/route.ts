import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, expectedAdminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { key?: string };
  try {
    body = (await req.json()) as { key?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
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

