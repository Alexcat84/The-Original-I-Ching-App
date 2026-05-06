/**
 * Spread I Ching line materialization across typical /api/consult duration so
 * the ritual feels aligned with server work (lines still arrive in one payload).
 *
 * ## Build-time env (Next.js inlines `process.env.NEXT_PUBLIC_*` at compile time)
 * If a variable is **not** set in the build environment (neither Vercel nor local `.env`), the literal
 * defaults in this file are what ship — there is no hidden runtime override.
 * If you **do** set a `NEXT_PUBLIC_*` on Vercel, that value is baked into the client bundle at deploy time
 * and changing it requires redeploying (or using preview envs).
 *
 * ## Optional overrides (when unset, defaults in this file apply)
 * - `NEXT_PUBLIC_ICHING_RITUAL_TARGET_MS` (min 8000): budget for the 12 tick delays + finale window. **Default: 36_000** (~36s align with typical `/api/consult` stream).
 * - `NEXT_PUBLIC_ICHING_RITUAL_TICK_DELAY_MAX_MS` (900–4600): hard cap per tick. **Default: 3000** (needed so a ~36s target is not clamped to ~30s).
 * - `NEXT_PUBLIC_ICHING_MANUAL_SEAL_HOLD_MS`, `FINALE_MIN_MS`, `FINALE_MAX_MS`: manual cast finale only.
 *
 * ## Stacking elsewhere (`page.tsx`, not here)
 * - After SSE closes: optional `initialPauseAfterOkMs` (900ms for JSON routes) — must **not** stack on `stream_ritual`
 *   after `runIChingRitualReveal` already ran.
 * - `POST_LINE_MS` is subtracted when computing tick delay, then the same ms are applied again as sleeps after ticks
 *   (900 + 1100) — intentional: ticks fill `TARGET - POST_LINE`, finale adds POST_LINE.
 *
 * Default target ~36s tick+finale phase (when env unset): `36_000` ms → see `ichingRitualTickDelayMs()`.
 */
export const ICHING_RITUAL_TARGET_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_RITUAL_TARGET_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_RITUAL_TARGET_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 8000 ? raw : 36_000;
})();

/**
 * Prevents runaway duration when TARGET_MS is set very high: tick delay was capped at 4600ms,
 * so 12 × 4600 ≈ 55s of line ticks alone (before finale). Keeps auto ritual bounded even if env overshoots.
 */
export const ICHING_RITUAL_TICK_DELAY_MAX_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_RITUAL_TICK_DELAY_MAX_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_RITUAL_TICK_DELAY_MAX_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 900 && raw <= 4600 ? raw : 3000;
})();

/** Finale glow after the last line tick (matches page.tsx sequence). */
export const ICHING_RITUAL_POST_LINE_MS = 900 + 1100;

/** One source bar, then one transformed bar per line (6 lines x 2). */
export const ICHING_RITUAL_TICKS = 12;

export function ichingRitualTickDelayMs(): number {
  const budget = Math.max(6000, ICHING_RITUAL_TARGET_MS) - ICHING_RITUAL_POST_LINE_MS;
  const raw = Math.floor(budget / ICHING_RITUAL_TICKS);
  return Math.max(520, Math.min(ICHING_RITUAL_TICK_DELAY_MAX_MS, raw));
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
