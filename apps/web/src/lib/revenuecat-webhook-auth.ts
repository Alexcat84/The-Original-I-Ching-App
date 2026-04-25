/**
 * RevenueCat webhooks authenticate with Authorization header (raw secret or Bearer <secret>),
 * not HMAC body signing like Stripe.
 */
import { createHash, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const aHash = createHash("sha256").update(a).digest();
  const bHash = createHash("sha256").update(b).digest();
  return timingSafeEqual(aHash, bHash);
}

export function revenueCatWebhookAuthorized(req: Request, secret: string): boolean {
  const raw = req.headers.get("authorization")?.trim() ?? "";
  // Normalize optional Bearer prefix so only one constant-time comparison is made.
  const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : raw;
  return safeEqual(token, secret);
}
