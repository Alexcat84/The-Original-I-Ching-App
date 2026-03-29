import { describe, expect, it } from "vitest";
import {
  latestExpiresMsForTier,
  pickTierFromSubscriberEntitlements,
  pickTierFromWebhookEntitlements,
} from "@/lib/revenuecat-tiers";

describe("revenuecat tier mapping", () => {
  it("maps webhook entitlements with suffixes", () => {
    expect(pickTierFromWebhookEntitlements(["seeker_annual"], undefined)).toBe("seeker");
    expect(pickTierFromWebhookEntitlements(["plan_practitioner_monthly"], undefined)).toBe("practitioner");
  });

  it("falls back to product_id when entitlement ids are missing", () => {
    expect(pickTierFromWebhookEntitlements(null, undefined, "the-original-iching-master-monthly")).toBe("master");
  });

  it("maps subscriber entitlements by key pattern and gets renewal", () => {
    const now = new Date("2026-03-28T00:00:00.000Z").getTime();
    const entitlements = {
      "oracle_annual_v1": { expires_date: "2026-04-28T00:00:00.000Z" },
      seeker: { expires_date: "2026-04-01T00:00:00.000Z" },
    };
    expect(pickTierFromSubscriberEntitlements(entitlements, now)).toBe("oracle");
    expect(latestExpiresMsForTier(entitlements, "oracle", now)).toBe(new Date("2026-04-28T00:00:00.000Z").getTime());
  });
});
