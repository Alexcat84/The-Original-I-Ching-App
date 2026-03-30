import { describe, expect, it } from "vitest";
import { CREDITS_PER_MONTH, TIER_CONFIG } from "../credits";
import {
  annualPriceUsd,
  FREE_LIFETIME_CONSULTATIONS,
  MASTER_CONSULTATIONS_PER_MONTH,
  ORACLE_CONSULTATIONS_PER_MONTH,
  PRACTITIONER_CONSULTATIONS_PER_MONTH,
  SEEKER_CONSULTATIONS_PER_MONTH,
  TIER_MONTHLY_PRICES_USD,
} from "../tier-billing-constants";

describe("CREDITS_PER_MONTH", () => {
  it("matches tier-billing-constants (single source of truth)", () => {
    expect(CREDITS_PER_MONTH.free).toBe(FREE_LIFETIME_CONSULTATIONS);
    expect(CREDITS_PER_MONTH.seeker).toBe(SEEKER_CONSULTATIONS_PER_MONTH);
    expect(CREDITS_PER_MONTH.seeker_monthly).toBe(SEEKER_CONSULTATIONS_PER_MONTH);
    expect(CREDITS_PER_MONTH.seeker_annual).toBe(SEEKER_CONSULTATIONS_PER_MONTH);
    expect(CREDITS_PER_MONTH.practitioner).toBe(PRACTITIONER_CONSULTATIONS_PER_MONTH);
    expect(CREDITS_PER_MONTH.master).toBe(MASTER_CONSULTATIONS_PER_MONTH);
    expect(CREDITS_PER_MONTH.oracle).toBe(ORACLE_CONSULTATIONS_PER_MONTH);
  });
});

describe("TIER_CONFIG", () => {
  it("sets Free as lifetime and annual plans at exact 10% discount", () => {
    expect(TIER_CONFIG.free.creditsType).toBe("lifetime");
    expect(TIER_CONFIG.seeker.priceAnnual).toBe(annualPriceUsd(TIER_MONTHLY_PRICES_USD.seeker));
    expect(TIER_CONFIG.practitioner.priceAnnual).toBe(annualPriceUsd(TIER_MONTHLY_PRICES_USD.practitioner));
    expect(TIER_CONFIG.master.priceAnnual).toBe(annualPriceUsd(TIER_MONTHLY_PRICES_USD.master));
    expect(TIER_CONFIG.oracle.priceAnnual).toBe(annualPriceUsd(TIER_MONTHLY_PRICES_USD.oracle));
  });
});
