import { NextResponse } from "next/server";
import { getAdminSessionTokenFromCookies, isValidAdminSession } from "@/lib/admin-auth";
import { getAdminConfig, updateAdminConfig, type AdminConfig } from "@/lib/admin-config";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
}

// Verify the request originates from the same host as the server (same-origin
// check). Defends against CSRF via subdomain abuse or future browser changes
// that may weaken SameSite=Lax guarantees on cross-site navigations.
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function GET() {
  const token = await getAdminSessionTokenFromCookies();
  if (!isValidAdminSession(token)) return unauthorized();
  return NextResponse.json({ ok: true, config: await getAdminConfig() });
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbidden();
  const token = await getAdminSessionTokenFromCookies();
  if (!isValidAdminSession(token)) return unauthorized();
  let body: Partial<AdminConfig>;
  try {
    body = (await req.json()) as Partial<AdminConfig>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const next = await updateAdminConfig(body);
  return NextResponse.json({ ok: true, config: next });
}

