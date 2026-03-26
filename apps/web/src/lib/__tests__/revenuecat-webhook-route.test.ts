import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertUserTierMock = vi.fn();
const fromMock = vi.fn(() => ({
  insert: vi.fn(async () => ({
    error: { message: "duplicate key value violates unique constraint" },
  })),
}));
const getSupabaseAdminMock = vi.fn(() => ({ from: fromMock }));

vi.mock("@/lib/credits", () => ({
  upsertUserTier: upsertUserTierMock,
}));

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}));

vi.mock("@/lib/revenuecat-tiers", () => ({
  pickTierFromWebhookEntitlements: () => "oracle",
}));

describe("RevenueCat webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REVENUECAT_WEBHOOK_SECRET = "test-secret";
  });

  it("returns duplicate=true when event insert is duplicate", async () => {
    const { POST } = await import("@/app/api/webhooks/revenuecat/route");
    const req = new Request("https://example.test/api/webhooks/revenuecat", {
      method: "POST",
      headers: { Authorization: "Bearer test-secret", "Content-Type": "application/json" },
      body: JSON.stringify({
        event: {
          type: "RENEWAL",
          app_user_id: "9e63f856-98de-4747-a4d5-69cbf30ac4f4",
          entitlement_ids: ["oracle"],
          purchased_at_ms: 1712345678000,
        },
      }),
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok?: boolean; duplicate?: boolean };

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.duplicate).toBe(true);
    expect(upsertUserTierMock).not.toHaveBeenCalled();
  });
});
