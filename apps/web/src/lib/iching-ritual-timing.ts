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

/** Tiny beat after HTTP OK so React can paint updated lines before finale (not extra “first half”). */
export const ICHING_MANUAL_POST_HTTP_BEAT_MS = 220;

/** Short beat with seal grid visible (finale off) before shifting to finale hex — not part of the 50/50 budget. */
export const ICHING_MANUAL_SEAL_HOLD_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_MANUAL_SEAL_HOLD_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_MANUAL_SEAL_HOLD_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 0 && raw <= 800 ? raw : 140;
})();

/**
 * Manual three-coin cast: the first “half” of the ritual is time already spent watching the
 * full grid while `/api/consult` runs. The finale should mirror that duration — not add a fixed
 * block on top (which made the flow tedious).
 *
 * We clamp so ultra-fast networks still get a readable finale, and slow servers do not stall forever.
 */
export const ICHING_MANUAL_FINALE_MIN_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_MANUAL_FINALE_MIN_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_MANUAL_FINALE_MIN_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 400 ? raw : 1600;
})();

export const ICHING_MANUAL_FINALE_MAX_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_MANUAL_FINALE_MAX_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_MANUAL_FINALE_MAX_MS)
      : Number.NaN;
  const max = Number.isFinite(raw) && raw >= ICHING_MANUAL_FINALE_MIN_MS ? raw : 18_000;
  return max;
})();

/** Finale dwell ≈ fetch round-trip (grid phase); clamped to min/max. */
export function ichingManualFinaleMsFromFetchDuration(fetchDurationMs: number): number {
  let v = Math.round(fetchDurationMs);
  if (!Number.isFinite(v) || v < 0) v = 0;
  if (v < ICHING_MANUAL_FINALE_MIN_MS) v = ICHING_MANUAL_FINALE_MIN_MS;
  if (v > ICHING_MANUAL_FINALE_MAX_MS) v = ICHING_MANUAL_FINALE_MAX_MS;
  return v;
}
