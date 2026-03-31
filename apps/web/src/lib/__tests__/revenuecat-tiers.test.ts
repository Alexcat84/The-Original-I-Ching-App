import { describe, expect, it } from "vitest";
import {
  latestExpiresMsForTier,
  maxBillingTier,
  parseRevenueCatProductTierMapJson,
  pickTierFromEntitlementAndProductId,
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

  it("parseRevenueCatProductTierMapJson accepts opaque keys and tier values", () => {
    const map = parseRevenueCatProductTierMapJson('{"prod559a41dadb":"oracle"}');
    expect(map["prod559a41dadb"]).toBe("oracle");
  });

  it("pickTierFromEntitlementAndProductId uses map when tokens only have opaque id", () => {
    const map = { prod559a41dadb: "oracle" as const };
    expect(pickTierFromEntitlementAndProductId(["prod559a41dadb"], "prod559a41dadb", map)).toBe("oracle");
    expect(pickTierFromEntitlementAndProductId([], "Prod559a41dadb", map)).toBe("oracle");
    expect(pickTierFromEntitlementAndProductId(["oracle_annual"], "prod559a41dadb", map)).toBe("oracle");
  });

  it("maps oracle_monthly and oracle_annual product IDs from env map", () => {
    const rawMap =
      '{"prod5d80d30e47":"seeker_monthly","prod5b3dc0e149":"seeker_annual",' +
      '"prod9ec903a9e4":"practitioner","prod494dadcda2":"practitioner",' +
      '"prod0d99ab91a8":"master","prod502ee01b70":"master",' +
      '"proda07412ce4d":"oracle","prod559a41dadb":"oracle"}';
    const map = parseRevenueCatProductTierMapJson(rawMap);
    // oracle_monthly
    expect(pickTierFromEntitlementAndProductId([], "proda07412ce4d", map)).toBe("oracle");
    // oracle_annual
    expect(pickTierFromEntitlementAndProductId([], "prod559a41dadb", map)).toBe("oracle");
    // seeker variants
    expect(pickTierFromEntitlementAndProductId([], "prod5d80d30e47", map)).toBe("seeker_monthly");
    expect(pickTierFromEntitlementAndProductId([], "prod5b3dc0e149", map)).toBe("seeker_annual");
    // practitioner
    expect(pickTierFromEntitlementAndProductId([], "prod9ec903a9e4", map)).toBe("practitioner");
    // master
    expect(pickTierFromEntitlementAndProductId([], "prod0d99ab91a8", map)).toBe("master");
  });
});
