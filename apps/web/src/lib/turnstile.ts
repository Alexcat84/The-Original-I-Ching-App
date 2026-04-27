const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Fail closed: if CAPTCHA is expected but not configured, reject verification.
  if (!secret) return false;
  const form = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) form.set("remoteip", remoteIp);
  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!response.ok) return false;
  const payload = (await response.json()) as { success?: boolean };
  return Boolean(payload.success);
}
