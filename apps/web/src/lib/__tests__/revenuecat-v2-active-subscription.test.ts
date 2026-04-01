import { describe, expect, it } from "vitest";
import { pickPrimaryActiveV2Subscription } from "@/lib/revenuecat-v2-active-subscription";

describe("pickPrimaryActiveV2Subscription", () => {
  it("returns an active row even when entitlement mapping is unknown", () => {
    const row = pickPrimaryActiveV2Subscription([
      {
        id: "sub_active_unknown_map",
        status: "active",
        gives_access: true,
        product_id: "prod_unmapped",
      },
    ]);
    expect(row && row.id).toBe("sub_active_unknown_map");
  });

  it("returns null when all rows are clearly inactive", () => {
    const row = pickPrimaryActiveV2Subscription([
      {
        id: "sub_expired",
        status: "expired",
        gives_access: false,
        current_period_ends_at: "2024-01-01T00:00:00.000Z",
      },
    ]);
    expect(row).toBeNull();
  });
});
