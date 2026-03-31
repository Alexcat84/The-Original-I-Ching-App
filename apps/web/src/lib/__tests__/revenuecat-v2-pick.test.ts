import { describe, expect, it } from "vitest";

import { pickBestActiveV2SubscriptionFromItems } from "../revenuecat-rest";

describe("pickBestActiveV2SubscriptionFromItems", () => {
  it("picks oracle when practitioner expired row is first in API order", () => {
    const items = [
      {
        id: "sub_old",
        status: "expired",
        gives_access: false,
        product_id: "prod_practitioner",
        entitlements: { items: [{ lookup_key: "practitioner_monthly" }] },
      },
      {
        id: "sub_new",
        status: "active",
        gives_access: true,
        product_id: "prod_oracle_annual",
        current_period_ends_at: new Date("2027-06-01T00:00:00.000Z").getTime(),
        entitlements: { items: [{ lookup_key: "oracle_annual" }] },
      },
    ];
    const best = pickBestActiveV2SubscriptionFromItems(items);
    expect(best).not.toBeNull();
    expect(best!.tier).toBe("oracle");
  });

  it("returns null when only expired subscriptions exist", () => {
    const items = [
      {
        id: "sub_old",
        status: "expired",
        gives_access: false,
        entitlements: { items: [{ lookup_key: "practitioner_monthly" }] },
      },
    ];
    expect(pickBestActiveV2SubscriptionFromItems(items)).toBeNull();
  });

  it("when two active rows exist, picks the higher billing tier", () => {
    const items = [
      {
        id: "sub_p",
        status: "active",
        gives_access: true,
        entitlements: { items: [{ lookup_key: "practitioner_monthly" }] },
        current_period_ends_at: new Date("2026-12-01T00:00:00.000Z").getTime(),
      },
      {
        id: "sub_o",
        status: "active",
        gives_access: true,
        entitlements: { items: [{ lookup_key: "oracle_annual" }] },
        current_period_ends_at: new Date("2026-06-01T00:00:00.000Z").getTime(),
      },
    ];
    const best = pickBestActiveV2SubscriptionFromItems(items);
    expect(best).not.toBeNull();
    expect(best!.tier).toBe("oracle");
  });
});
