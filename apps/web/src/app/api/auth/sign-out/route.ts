import { NextResponse } from "next/server";
import { invalidateAuthCache } from "@/lib/auth/bearer-user";

export const runtime = "nodejs";

/**
 * Best-effort JWT cache invalidation on client sign-out.
 * Removes the token from the in-process JWT cache so subsequent requests
 * with the revoked token fail immediately instead of succeeding for up to 60s.
 * No auth check — a token that isn't in the cache is a no-op.
 */
export async function POST(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (token) invalidateAuthCache(token);
  return NextResponse.json({ ok: true });
}
