import { describe, expect, it } from "vitest";
import { CREDITS_PER_MONTH } from "../credits";

describe("CREDITS_PER_MONTH", () => {
  it("matches production tier limits in credits.ts", () => {
    expect(CREDITS_PER_MONTH.free).toBe(2);
    expect(CREDITS_PER_MONTH.seeker).toBe(60);
    expect(CREDITS_PER_MONTH.practitioner).toBe(180);
    expect(CREDITS_PER_MONTH.master).toBe(500);
    expect(CREDITS_PER_MONTH.oracle).toBe(2000);
  });
});
