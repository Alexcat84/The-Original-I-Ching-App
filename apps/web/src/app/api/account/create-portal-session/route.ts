import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";

export const runtime = "nodejs";

function buildPlansUrl(appUserId: string): string | null {
  const base = process.env.NEXT_PUBLIC_PLANS_URL?.trim();
  if (!base) return null;
  try {
    const url = new URL(base);
    url.searchParams.set("app_user_id", appUserId);
    return url.toString();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  const url = buildPlansUrl(user.userId);
  if (!url) {
    return apiError(503, {
      error: "billing_not_configured",
      code: "BILLING_NOT_CONFIGURED",
      action: "check_config",
    });
  }
  return NextResponse.json({ ok: true, url, fallback: "plans" });
}
