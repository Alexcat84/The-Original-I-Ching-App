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
  const h = req.headers.get("authorization")?.trim() ?? "";
  return safeEqual(h, secret) || safeEqual(h, `Bearer ${secret}`);
}
