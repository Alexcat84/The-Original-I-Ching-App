import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  return NextResponse.json({ ok: true, mode: "consumable_tokens_only" });
}
