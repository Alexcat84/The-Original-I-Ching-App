/**
 * QA code: TS-CTX-001 context-limits · v1.0.0
 * Area: packages/context-engine/src/context-limits
 * Family: CTX
 */

import { describe, expect, it } from "vitest";
import { CONTEXT_LIMITS } from "./index.js";

describe("CONTEXT_LIMITS (v4 thread + history)", () => {
  it("matches product spec for session depth and history slices", () => {
    expect(CONTEXT_LIMITS.free).toEqual({ sessionDepth: 1, historyCount: 0 });
    expect(CONTEXT_LIMITS.seeker).toEqual({ sessionDepth: 3, historyCount: 0 });
    expect(CONTEXT_LIMITS.practitioner).toEqual({ sessionDepth: 5, historyCount: 0 });
    expect(CONTEXT_LIMITS.master).toEqual({ sessionDepth: 8, historyCount: 10 });
    expect(CONTEXT_LIMITS.oracle).toEqual({ sessionDepth: 12, historyCount: 30 });
  });
});
