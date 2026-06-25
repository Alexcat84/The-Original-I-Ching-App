/**
 * QA code: TS-WEB-012 revenuecat-webhook-idempotency · v1.0.0
 * Area: apps/web/src/lib/revenuecat-webhook-idempotency
 * Family: BILL
 */

import { describe, expect, it } from "vitest";
import { computeRevenueCatEventHash } from "../revenuecat-webhook-idempotency";

describe("computeRevenueCatEventHash", () => {
  it("returns same hash for same payload and event", () => {
    const raw = JSON.stringify({ event: { type: "RENEWAL", app_user_id: "u1" } });
    const event = { type: "RENEWAL", app_user_id: "u1", purchased_at_ms: 1000 };
    const a = computeRevenueCatEventHash(raw, event);
    const b = computeRevenueCatEventHash(raw, event);
    expect(a).toBe(b);
  });

  it("returns different hash when event changes", () => {
    const raw = JSON.stringify({ event: { type: "RENEWAL", app_user_id: "u1" } });
    const base = computeRevenueCatEventHash(raw, { type: "RENEWAL", app_user_id: "u1", purchased_at_ms: 1000 });
    const changed = computeRevenueCatEventHash(raw, { type: "EXPIRATION", app_user_id: "u1", purchased_at_ms: 1000 });
    expect(base).not.toBe(changed);
  });
});
