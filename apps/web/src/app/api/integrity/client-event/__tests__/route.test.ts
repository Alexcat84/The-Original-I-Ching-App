/**
 * QA code: TS-WEB-018 integrity-client-event-route · v1.0.0
 * Area: apps/web/src/app/api/integrity/client-event
 * Family: AUTH
 */

/**
 * Integrity client-event endpoint.
 *
 * Two properties are load bearing here and both are easy to regress by moving a
 * few lines around:
 *
 * 1. The rate limit is evaluated BEFORE authentication. The endpoint deliberately
 *    does work (parsing a body, writing a log line) on requests it has not
 *    authenticated, so the limiter is the only thing bounding that work.
 * 2. An unauthenticated report is still logged. The mobile shell reports a
 *    failure using the same bearer token that just failed, so the reports we most
 *    need are exactly the ones arriving with a dead token. Before this, they were
 *    rejected before any logging ran and Axiom only ever recorded success phases.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetAuthenticatedUser = vi.fn();
const mockRateLimitByKey = vi.fn();
const mockCaptureIntegrityToSentry = vi.fn();
const mockLogInfo = vi.fn();
const mockLogWarn = vi.fn();

vi.mock("@/lib/auth/bearer-user", () => ({
  getAuthenticatedUser: (...args: unknown[]) => mockGetAuthenticatedUser(...args),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimitByKey: (...args: unknown[]) => mockRateLimitByKey(...args),
}));

vi.mock("@/lib/supabase-telemetry", () => ({
  createApiLogger: () => ({
    requestId: "req-test",
    log: {
      info: mockLogInfo,
      warn: mockLogWarn,
      flush: async () => undefined,
    },
  }),
}));

vi.mock("@/lib/integrity-sentry", () => ({
  captureIntegrityToSentry: (...args: unknown[]) => mockCaptureIntegrityToSentry(...args),
  shouldReportIntegrityClientEvent: (_phase: string, ok: boolean) => !ok,
}));

import { NextRequest } from "next/server";
import { POST } from "../route";

const VALID_BODY = {
  traceId: "itr_1787326659305_sbyrzvrb",
  phase: "challenge_http",
  ok: false,
  reason: "http_401",
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("https://example.com/api/integrity/client-event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function findLog(mock: typeof mockLogWarn, event: string) {
  return mock.mock.calls.find((c) => c[0] === event)?.[1];
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRateLimitByKey.mockResolvedValue({ ok: true });
  mockGetAuthenticatedUser.mockResolvedValue({ userId: "user-1234-abcd", email: "a@b.c" });
});

describe("rate limit runs before authentication", () => {
  it("returns 429 without ever authenticating", async () => {
    mockRateLimitByKey.mockResolvedValue({ ok: false });

    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(429);
    // The whole point of the ordering: no auth work on a throttled request.
    expect(mockGetAuthenticatedUser).not.toHaveBeenCalled();
  });

  it("throttles by client ip", async () => {
    await POST(makeRequest(VALID_BODY));
    expect(mockRateLimitByKey).toHaveBeenCalledWith(
      expect.objectContaining({ key: expect.stringContaining("integrity_client_event:") }),
    );
  });
});

describe("unauthenticated reports stay visible", () => {
  beforeEach(() => {
    mockGetAuthenticatedUser.mockResolvedValue(null);
  });

  it("still returns 401", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "auth_required" });
  });

  it("logs the denial with the reported phase, marked unauthenticated", async () => {
    await POST(makeRequest(VALID_BODY));

    const logged = findLog(mockLogWarn, "integrity_client_event_denied");
    expect(logged).toBeDefined();
    expect(logged).toMatchObject({
      reason: "auth_required",
      authenticated: false,
      traceId: VALID_BODY.traceId,
      phase: "challenge_http",
      clientReason: "http_401",
      ok: false,
    });
  });

  it("never forwards an unauthenticated report to Sentry", async () => {
    await POST(makeRequest(VALID_BODY));
    expect(mockCaptureIntegrityToSentry).not.toHaveBeenCalled();
  });

  it("logs with null fields instead of throwing when the body is malformed", async () => {
    const res = await POST(makeRequest("}{ not json"));

    expect(res.status).toBe(401);
    const logged = findLog(mockLogWarn, "integrity_client_event_denied");
    expect(logged).toMatchObject({ authenticated: false, traceId: null, phase: null });
  });

  it("logs with null fields when the body is valid json but fails the schema", async () => {
    const res = await POST(makeRequest({ traceId: "short", phase: 42 }));

    expect(res.status).toBe(401);
    const logged = findLog(mockLogWarn, "integrity_client_event_denied");
    expect(logged).toMatchObject({ authenticated: false, traceId: null, phase: null });
  });
});

describe("authenticated path is unchanged", () => {
  it("accepts a valid report and logs it as an app event", async () => {
    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const logged = findLog(mockLogInfo, "integrity_client_event");
    expect(logged).toMatchObject({
      traceId: VALID_BODY.traceId,
      phase: "challenge_http",
      ok: false,
      reason: "http_401",
    });
    // Denial logging must not fire on the happy path.
    expect(findLog(mockLogWarn, "integrity_client_event_denied")).toBeUndefined();
  });

  it("forwards a reported failure to Sentry", async () => {
    await POST(makeRequest(VALID_BODY));
    expect(mockCaptureIntegrityToSentry).toHaveBeenCalledWith(
      "integrity_client_event",
      expect.objectContaining({ phase: "challenge_http", traceId: VALID_BODY.traceId }),
    );
  });

  it("rejects a malformed body with 400", async () => {
    const res = await POST(makeRequest({ phase: "x" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_body" });
  });
});
