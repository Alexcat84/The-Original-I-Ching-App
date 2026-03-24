export async function verifyHCaptcha(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return true;
  const form = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) form.set("remoteip", remoteIp);
  const response = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!response.ok) return false;
  const payload = (await response.json()) as { success?: boolean };
  return Boolean(payload.success);
}

