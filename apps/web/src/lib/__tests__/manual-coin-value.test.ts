/**
 * QA code: TS-WEB-014 manual-coin-value · v1.0.0
 * Area: apps/web/src/lib/manual-coin-value
 * Family: WEB
 */

import { describe, expect, it } from "vitest";
import { lineValueFromCoins } from "../manual-coin-value";

describe("lineValueFromCoins", () => {
  it("matches Wilhelm/Baynes Appendix I §2: inscribed (Han) = yin 2, reverse (Manchu) = yang 3", () => {
    expect(lineValueFromCoins(["H", "H", "H"])).toBe(6);
    expect(lineValueFromCoins(["T", "T", "T"])).toBe(9);
    expect(lineValueFromCoins(["H", "H", "T"])).toBe(7);
    expect(lineValueFromCoins(["T", "T", "H"])).toBe(8);
  });
});
