/**
 * Single source of truth for tier consultation quotas and related billing numbers.
 * Update values here so credits, webhooks, /api/account/me, and UI copy stay aligned.
 */

/** Consultations included in the Free lifetime trial. */
export const FREE_LIFETIME_CONSULTATIONS = 2;

/**
 * Consultations per billing month for Seeker (both monthly and annual subscriptions
 * renew the same monthly cupo for the whole year).
 */
export const SEEKER_CONSULTATIONS_PER_MONTH = 20;

export const PRACTITIONER_CONSULTATIONS_PER_MONTH = 40;
export const MASTER_CONSULTATIONS_PER_MONTH = 100;
export const ORACLE_CONSULTATIONS_PER_MONTH = 350;

/** Exact annual discount vs 12× monthly (display + TIER_CONFIG.priceAnnual). */
export const ANNUAL_PLAN_DISCOUNT = 0.1;

export const TIER_MONTHLY_PRICES_USD = {
  seeker: 6.99,
  practitioner: 11.99,
  master: 19.99,
  oracle: 44.99,
} as const;

export function annualPriceUsd(monthly: number): number {
  return Number((monthly * 12 * (1 - ANNUAL_PLAN_DISCOUNT)).toFixed(2));
}
