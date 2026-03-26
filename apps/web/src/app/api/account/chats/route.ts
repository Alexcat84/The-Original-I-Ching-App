import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { getUserSessionsWithConsultations } from "@/lib/session-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const sessions = await getUserSessionsWithConsultations(user.userId);
  return NextResponse.json({
    sessions: sessions.map((entry) => ({
      session: entry.session,
      consultations: entry.consultations,
    })),
  });
}

