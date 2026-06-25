/**
 * QA code: TS-WEB-011 revenuecat-webhook-auth · v1.0.0
 * Area: apps/web/src/lib/revenuecat-webhook-auth
 * Family: BILL
 */

import { describe, expect, it } from "vitest";
import { revenueCatWebhookAuthorized } from "../revenuecat-webhook-auth";

describe("revenueCatWebhookAuthorized", () => {
  const secret = "rc_wh_test_secret";

  it("accepts raw Authorization value matching secret", () => {
    const req = new Request("https://example.com/webhook", {
      headers: { Authorization: secret },
    });
    expect(revenueCatWebhookAuthorized(req, secret)).toBe(true);
  });

  it("accepts Bearer prefix", () => {
    const req = new Request("https://example.com/webhook", {
      headers: { Authorization: `Bearer ${secret}` },
    });
    expect(revenueCatWebhookAuthorized(req, secret)).toBe(true);
  });

  it("rejects wrong secret", () => {
    const req = new Request("https://example.com/webhook", {
      headers: { Authorization: "Bearer wrong" },
    });
    expect(revenueCatWebhookAuthorized(req, secret)).toBe(false);
  });

  it("rejects missing header", () => {
    const req = new Request("https://example.com/webhook");
    expect(revenueCatWebhookAuthorized(req, secret)).toBe(false);
  });
});
