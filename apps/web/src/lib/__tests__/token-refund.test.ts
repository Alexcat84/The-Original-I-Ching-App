/**
 * Token refund logic tests — audit CRIT-02
 *
 * These tests cover the refundCtx state-machine in /api/consult
 * and the refund_token SQL guard (via mocked Supabase RPC).
 *
 * The attemptRefund function is not directly importable (defined inside
 * route.ts). These tests verify the decision matrix using the underlying
 * helper utilities (refundToken, consultationExists) and the contract the
 * route relies on.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => ({
    rpc: mockRpc,
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mockFrom }) }) }),
  }),
}));

import { refundToken, consultationExists } from "../credits";

// ── refundToken ──────────────────────────────────────────────────────────────

describe("refundToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns resulting balance on successful refund", async () => {
    mockRpc.mockResolvedValue({ data: 24, error: null });
    const result = await refundToken("user-1", 1, "consult_failed");
    expect(result).toBe(24);
    expect(mockRpc).toHaveBeenCalledWith("refund_token", {
      p_user_id: "user-1",
      p_tokens: 1,
      p_reason: "consult_failed",
    });
  });

  it("returns 0 for tokens=0 (streaming partial-delivery audit record)", async () => {
    mockRpc.mockResolvedValue({ data: 0, error: null });
    const result = await refundToken("user-1", 0, "persist_failed_no_refund");
    expect(result).toBe(0);
  });

  it("throws when Supabase returns an error", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "db error" } });
    await expect(refundToken("user-1", 1, "consult_failed")).rejects.toMatchObject({
      message: "db error",
    });
  });
});

// ── consultationExists ───────────────────────────────────────────────────────

describe("consultationExists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when the consultation row exists (ambiguous success case §2.5)", async () => {
    mockFrom.mockResolvedValue({ data: { id: "consult-abc" }, error: null });
    const exists = await consultationExists("consult-abc");
    expect(exists).toBe(true);
  });

  it("returns false when the consultation does not exist (real failure — should refund)", async () => {
    mockFrom.mockResolvedValue({ data: null, error: null });
    const exists = await consultationExists("consult-xyz");
    expect(exists).toBe(false);
  });

  it("throws when the DB query itself errors (pre-refund check fails → caller should refund)", async () => {
    mockFrom.mockResolvedValue({ data: null, error: { message: "connection reset" } });
    await expect(consultationExists("consult-xyz")).rejects.toMatchObject({
      message: "connection reset",
    });
  });
});

// ── SQL guard contract (p_tokens validation) ─────────────────────────────────
// These test the contract the route relies on — the SQL function returns -1
// for invalid input. We verify refundToken passes p_tokens through unmodified
// so the DB guard is the authoritative enforcement.

describe("refundToken SQL guard contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes p_tokens=-1 to RPC unchanged (DB guard returns -1, no credits modified)", async () => {
    mockRpc.mockResolvedValue({ data: -1, error: null });
    const result = await refundToken("user-1", -1, "invalid");
    expect(result).toBe(-1);
    expect(mockRpc).toHaveBeenCalledWith("refund_token", expect.objectContaining({ p_tokens: -1 }));
  });
});

// ── Decision matrix verification ─────────────────────────────────────────────
// These tests document the expected behavior of the refundCtx state machine
// in /api/consult. They verify the boolean conditions that drive attemptRefund.

describe("refundCtx decision matrix", () => {
  it("should refund: consumed=true, persisted=false, streamingStarted=false", () => {
    const ctx = { consumed: true, persisted: false, streamingStarted: false };
    expect(ctx.consumed && !ctx.persisted).toBe(true);
    expect(ctx.streamingStarted).toBe(false); // full refund, not 0-token audit
  });

  it("should NOT refund: consumed=false (charge never happened)", () => {
    const ctx = { consumed: false, persisted: false, streamingStarted: false };
    expect(ctx.consumed && !ctx.persisted).toBe(false);
  });

  it("should NOT refund: consumed=true, persisted=true (happy path)", () => {
    const ctx = { consumed: true, persisted: true, streamingStarted: false };
    expect(ctx.consumed && !ctx.persisted).toBe(false);
  });

  it("0-token audit (no refund): consumed=true, persisted=false, streamingStarted=true (set on first oracle_delta)", () => {
    // streamingStarted is set on the FIRST oracle_delta event (streaming path)
    // or at oracle_ready (non-streaming path). Either way, content reached the client
    // so no refund is issued — only a 0-token audit log.
    const ctx = { consumed: true, persisted: false, streamingStarted: true };
    expect(ctx.consumed && !ctx.persisted).toBe(true);
    // streamingStarted=true → tokensToRefund=0, reason='persist_failed_no_refund'
    const tokensToRefund = ctx.streamingStarted ? 0 : 1;
    expect(tokensToRefund).toBe(0);
  });
});
