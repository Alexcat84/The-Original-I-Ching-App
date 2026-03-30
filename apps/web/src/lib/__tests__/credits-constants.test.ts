import { describe, expect, it } from "vitest";
import { CREDITS_PER_MONTH, TIER_CONFIG } from "../credits";

describe("CREDITS_PER_MONTH", () => {
  it("matches production tier limits in credits.ts", () => {
    expect(CREDITS_PER_MONTH.free).toBe(2);
    expect(CREDITS_PER_MONTH.seeker).toBe(20);
    expect(CREDITS_PER_MONTH.seeker_monthly).toBe(20);
    expect(CREDITS_PER_MONTH.seeker_annual).toBe(15);
    expect(CREDITS_PER_MONTH.practitioner).toBe(40);
    expect(CREDITS_PER_MONTH.master).toBe(100);
    expect(CREDITS_PER_MONTH.oracle).toBe(350);
  });
});

describe("TIER_CONFIG", () => {
  it("sets Free as lifetime and annual plans at exact 10% discount", () => {
    expect(TIER_CONFIG.free.creditsType).toBe("lifetime");
    expect(TIER_CONFIG.seeker.priceAnnual).toBe(75.49);
    expect(TIER_CONFIG.practitioner.priceAnnual).toBe(129.49);
    expect(TIER_CONFIG.master.priceAnnual).toBe(215.89);
    expect(TIER_CONFIG.oracle.priceAnnual).toBe(485.89);
  });
});
