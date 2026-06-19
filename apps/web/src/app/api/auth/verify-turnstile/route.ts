import { z } from "zod";
import { apiError } from "@/lib/api-error";
import { rateLimitByKey } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

const verifyTurnstileRequestSchema = z.object({
  turnstileToken: z.string().optional(),
});

// Gates sign-in (apps/web/src/app/login/page.tsx onSignIn) behind the same Turnstile
// widget already used for sign-up. signInWithPassword() calls Supabase Auth directly
// from the browser, so this is the only point where we can reject a bot before it
// reaches Supabase at all.
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimitByKey({ key: `signin_captcha:${ip}`, limit: 30, windowSeconds: 300 });
  if (!rl.ok) {
    const res = apiError(429, { error: "rate_limited", code: "RATE_LIMITED", action: "wait_and_retry" });
    res.headers.set("Retry-After", "300");
    return res;
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }
  const parsed = verifyTurnstileRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError(400, { error: "invalid_payload", code: "VERIFY_TURNSTILE_INVALID_PAYLOAD", action: "fix_input" });
  }

  const ok = await verifyTurnstile(parsed.data.turnstileToken ?? "", ip);
  if (!ok) {
    return apiError(400, { error: "turnstile_failed", code: "BOT_CHECK_FAILED", action: "retry" });
  }
  return Response.json({ ok: true });
}
