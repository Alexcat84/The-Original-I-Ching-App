import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  formatPasswordChangedEmail,
  getUpdatePasswordUiMessages,
  parseAppLocale,
} from "@iching-oracle/i18n";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.TWO_FACTOR_EMAIL_FROM?.trim() ?? "noreply@theoriginaliching.com";
  if (!apiKey) {
    // Non-fatal: email config missing — don't fail the password change flow
    return NextResponse.json({ ok: true, skipped: true, reason: "resend_not_configured" });
  }

  const cookieStore = await cookies();
  const locale = parseAppLocale(cookieStore.get(UI_LOCALE_COOKIE)?.value);
  const { subject, text, html } = formatPasswordChangedEmail(getUpdatePasswordUiMessages(locale));

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [authUser.email],
        subject,
        text,
        html,
      }),
    });
    if (!response.ok) {
      // Non-fatal: log but don't surface to client
      console.warn("[notify-password-changed] resend delivery failed", response.status);
    }
  } catch (err) {
    console.warn("[notify-password-changed] fetch error", err);
  }

  return NextResponse.json({ ok: true });
}
