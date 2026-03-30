import { describe, expect, it } from "vitest";
import {
  latestExpiresMsForTier,
  maxBillingTier,
  pickTierFromEntitlementIdList,
  pickTierFromSubscriberBundle,
  pickTierFromSubscriberEntitlements,
  pickTierFromWebhookEntitlements,
} from "@/lib/revenuecat-tiers";

describe("revenuecat tier mapping", () => {
  it("maxBillingTier picks highest paid tier", () => {
    expect(maxBillingTier("free", "practitioner")).toBe("practitioner");
    expect(maxBillingTier("seeker", "practitioner")).toBe("practitioner");
    expect(maxBillingTier("oracle", "master")).toBe("oracle");
  });

  it("maps webhook entitlements with suffixes", () => {
    expect(pickTierFromWebhookEntitlements(["seeker_annual"], undefined)).toBe("seeker_annual");
    expect(pickTierFromWebhookEntitlements(["seeker_monthly"], undefined)).toBe("seeker_monthly");
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

  it("maps tier from entitlement product_identifier when entitlement id is opaque", () => {
    const now = new Date("2026-03-28T00:00:00.000Z").getTime();
    const entitlements = {
      premium: {
        expires_date: "2026-04-28T00:00:00.000Z",
        product_identifier: "the-original-iching-practitioner-annual",
      },
    };
    expect(pickTierFromSubscriberBundle(entitlements, undefined, now)).toBe("practitioner");
  });

  it("maps tier from v1 subscription keys (web billing)", () => {
    const now = new Date("2026-03-28T00:00:00.000Z").getTime();
    const subscriptions = {
      prod494dadcda2_practitioner: { expires_date: "2026-04-28T00:00:00.000Z" },
    };
    expect(pickTierFromSubscriberBundle(undefined, subscriptions, now)).toBe("practitioner");
  });

  it("maps v2-style entitlement lookup_key and opaque product_id together", () => {
    const tokens = ["prod1a2b3c4d5e", "master", "Master Monthly"];
    expect(pickTierFromEntitlementIdList(tokens)).toBe("master");
  });
});
