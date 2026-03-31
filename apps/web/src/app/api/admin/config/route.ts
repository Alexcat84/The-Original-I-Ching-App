import { NextResponse } from "next/server";
import { getAdminSessionTokenFromCookies, isValidAdminSession } from "@/lib/admin-auth";
import { getAdminConfig, updateAdminConfig, type AdminConfig } from "@/lib/admin-config";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET() {
  const token = getAdminSessionTokenFromCookies();
  if (!isValidAdminSession(token)) return unauthorized();
  return NextResponse.json({ ok: true, config: await getAdminConfig() });
}

export async function POST(req: Request) {
  const token = getAdminSessionTokenFromCookies();
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

