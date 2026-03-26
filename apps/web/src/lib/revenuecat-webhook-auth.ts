/**
 * RevenueCat webhooks authenticate with Authorization header (raw secret or Bearer <secret>),
 * not HMAC body signing like Stripe.
 */
export function revenueCatWebhookAuthorized(req: Request, secret: string): boolean {
  const h = req.headers.get("authorization")?.trim() ?? "";
  return h === secret || h === `Bearer ${secret}`;
}
