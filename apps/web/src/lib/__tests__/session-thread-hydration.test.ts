/**
 * QA code: TS-WEB-013 session-thread-hydration · v1.0.0
 * Area: apps/web/src/lib/session-thread-hydration
 * Family: CHAT
 */

import { describe, expect, it } from "vitest";
import {
  sessionHasFullThreadContent,
  sessionNeedsThreadHydration,
} from "../session-thread-hydration";

describe("session-thread-hydration", () => {
  it("detects placeholder-only thread as needing hydration", () => {
    const session = {
      sessionId: "abc",
      messageCount: 1,
      thread: [{ interpretation: "Short summary only", interpretationSummary: "Short summary only" }],
    };
    expect(sessionHasFullThreadContent(session)).toBe(false);
    expect(sessionNeedsThreadHydration(session)).toBe(true);
  });

  it("skips hydration when full interpretation is present", () => {
    const longText = "x".repeat(200);
    const session = {
      sessionId: "abc",
      messageCount: 1,
      thread: [{ interpretation: longText, interpretationSummary: "Brief" }],
    };
    expect(sessionHasFullThreadContent(session)).toBe(true);
    expect(sessionNeedsThreadHydration(session)).toBe(false);
  });
});
