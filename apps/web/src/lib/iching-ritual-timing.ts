/**
 * Spread I Ching line materialization across typical /api/consult duration so
 * the ritual feels aligned with server work (lines still arrive in one payload).
 *
 * Override with NEXT_PUBLIC_ICHING_RITUAL_TARGET_MS (milliseconds, min 8000).
 */
export const ICHING_RITUAL_TARGET_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_RITUAL_TARGET_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_RITUAL_TARGET_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 8000 ? raw : 36_000;
})();

/** Finale glow after the last line tick (matches page.tsx sequence). */
export const ICHING_RITUAL_POST_LINE_MS = 900 + 1100;

/** One source bar, then one transformed bar per line (6 lines x 2). */
export const ICHING_RITUAL_TICKS = 12;

export function ichingRitualTickDelayMs(): number {
  const budget = Math.max(6000, ICHING_RITUAL_TARGET_MS) - ICHING_RITUAL_POST_LINE_MS;
  const raw = Math.floor(budget / ICHING_RITUAL_TICKS);
  return Math.max(520, Math.min(4600, raw));
}

/**
 * Manual three-coin cast only: after `/api/consult` returns (JSON ritual), total dwell before
 * navigating to the reading thread. Split 50/50 — seal/full grid (finale off) vs finale hex focus.
 *
 * Override with `NEXT_PUBLIC_ICHING_MANUAL_RITUAL_POST_RESPONSE_TOTAL_MS` (milliseconds, min 4000).
 */
export const ICHING_MANUAL_RITUAL_POST_RESPONSE_TOTAL_MS = (() => {
  const raw =
    typeof process !== "undefined" &&
    typeof process.env.NEXT_PUBLIC_ICHING_MANUAL_RITUAL_POST_RESPONSE_TOTAL_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_MANUAL_RITUAL_POST_RESPONSE_TOTAL_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 4000 ? raw : 10_000;
})();

/** First beat after HTTP (lets layout paint); counted inside the first half. */
export const ICHING_MANUAL_POST_HTTP_BEAT_MS = 220;

/** Half of {@link ICHING_MANUAL_RITUAL_POST_RESPONSE_TOTAL_MS} — first act (grid+seal) and second act (finale) use the same duration. */
export function ichingManualRitualHalfMs(): number {
  return Math.floor(ICHING_MANUAL_RITUAL_POST_RESPONSE_TOTAL_MS / 2);
}
