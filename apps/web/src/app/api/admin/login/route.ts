import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, expectedAdminToken } from "@/lib/admin-auth";
import { rateLimitByKey } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function sha256ToBuffer(input: string): Buffer {
  return createHash("sha256").update(input).digest();
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = sha256ToBuffer(a);
  const bBuf = sha256ToBuffer(b);
  return timingSafeEqual(aBuf, bBuf);
}

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
  const secret = process.env.ADMIN_PANEL_KEY?.trim();
  const secretHash = process.env.ADMIN_PANEL_KEY_HASH?.trim();
  if (!secret && !secretHash) {
    return NextResponse.json({ ok: false, error: "admin_not_configured" }, { status: 503 });
  }
  const inputKey = (body.key ?? "").trim();
  if (!inputKey) {
    return NextResponse.json({ ok: false, error: "invalid_key" }, { status: 401 });
  }
  let isValid = false;
  if (secretHash) {
    isValid = await bcrypt.compare(inputKey, secretHash);
  } else if (secret) {
    isValid = timingSafeStringEqual(inputKey, secret);
  }
  if (!isValid) {
    return NextResponse.json({ ok: false, error: "invalid_key" }, { status: 401 });
  }
  const tokenSeed = secretHash || secret!;
  const token = expectedAdminToken(tokenSeed);
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

