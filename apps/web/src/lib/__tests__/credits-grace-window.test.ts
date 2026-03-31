import { beforeEach, describe, expect, it, vi } from "vitest";

const syncUserTierFromRevenueCatRestMock = vi.fn(async () => ({ ok: false as const, error: "upstream" as const }));
const getUpstashRedisMock = vi.fn(() => null);

type MaybeSingleResult = { data: Record<string, unknown> | null; error: null };

function makeQueryBuilder(queue: MaybeSingleResult[]) {
  const qb: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(async () => queue.shift() ?? { data: null, error: null }),
    update: vi.fn(),
    insert: vi.fn(async () => ({ error: null })),
  };
  qb.select.mockReturnValue(qb);
  qb.eq.mockReturnValue(qb);
  qb.order.mockReturnValue(qb);
  qb.limit.mockReturnValue(qb);
  qb.update.mockReturnValue(qb);
  return qb;
}

const getSupabaseAdminMock = vi.fn();

vi.mock("@/lib/revenuecat-rest", () => ({
  syncUserTierFromRevenueCatRest: () => syncUserTierFromRevenueCatRestMock(),
}));

vi.mock("@/lib/rate-limit", () => ({
  getUpstashRedis: () => getUpstashRedisMock(),
}));

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => getSupabaseAdminMock(),
}));

describe("consumeTierCredit grace window", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows paid user when cycle expired 12h and RC sync unavailable", async () => {
    const now = Date.now();
    const expired12hAgoIso = new Date(now - 12 * 60 * 60 * 1000).toISOString();
    const queue: MaybeSingleResult[] = Array.from({ length: 4 }, () => ({
      data: {
        id: "row-1",
        tier: "master",
        credits_total: 100,
        credits_used: 90,
        cycle_start: new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString(),
        cycle_end: expired12hAgoIso,
        credits_type: "monthly",
      },
      error: null,
    }));
    const qb = makeQueryBuilder(queue);
    const from = vi.fn(() => qb);
    getSupabaseAdminMock.mockReturnValue({ from });

    const { consumeTierCredit } = await import("../credits");
    const result = await consumeTierCredit("9e63f856-98de-4747-a4d5-69cbf30ac4f4", "master");

    expect(result.allowed).toBe(true);
    expect(result.denyReason).toBe("billing_unavailable");
    expect(result.cycleEndIso).toBe(expired12hAgoIso);
    expect(syncUserTierFromRevenueCatRestMock).toHaveBeenCalledTimes(3);
    expect(qb.update).not.toHaveBeenCalled();
  });
});

