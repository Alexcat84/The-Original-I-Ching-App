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
 * - `NEXT_PUBLIC_ICHING_RITUAL_TARGET_MS` (min 8000): fallback processing budget when no prior I Ching consult duration is stored. **Default: 36_000**.
 * - `NEXT_PUBLIC_ICHING_RITUAL_TICK_DELAY_MAX_MS` (900–4600): hard cap per tick. **Default: 3000**.
 * - `NEXT_PUBLIC_ICHING_RITUAL_PHASE1_WEIGHT`, `NEXT_PUBLIC_ICHING_RITUAL_PHASE2_WEIGHT`: positive integers used as a
 *   ratio to derive the intended share for phase 1 ticks from total wall-clock budget. Defaults **70 / 30** (70% / 30%).
 *   Phase 2 is **not time-gated** in UI; it persists until response rendering clears the ritual stage.
 * - `NEXT_PUBLIC_ICHING_RITUAL_BUDGET_MIN_MS` / `MAX_MS`: clamp measured `/api/consult` duration when driving the next ritual (defaults **8000** / **120_000**).
 * - `NEXT_PUBLIC_ICHING_MANUAL_*`: legacy tuning constants; manual JSON cast no longer **blocks** the UI on seal/finale
 *   after `/api/consult` returns (interpretation shows as soon as the payload is ready).
 *
 * ## Stacking elsewhere (`page.tsx`, not here)
 * - After SSE closes: optional `initialPauseAfterOkMs` (900ms for JSON routes) — must **not** stack on `stream_ritual`.
 *
 * **Measured wall time**: on each successful I Ching `/api/consult`, store clamped duration; the **next** auto ritual
 * uses `ichingRitualRevealTimingFromBudget` so phase 1 (ticks) vs phase 2 (finale) scales with real processing time.
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

/** Legacy split ratio for the two finale sleeps (900 ms : 1100 ms). */
export const ICHING_RITUAL_POST_LINE_MS = 900 + 1100;

/** One source bar, then one transformed bar per line (6 lines x 2). */
export const ICHING_RITUAL_TICKS = 12;

function parsePositiveIntEnv(raw: string | undefined, fallback: number, max = 10_000): number {
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  if (i < 1) return fallback;
  return Math.min(max, i);
}

/** Relative weight for the 12 line ticks (phase 1). Default 70 → 70% of budget with phase2=30. */
export const ICHING_RITUAL_PHASE1_WEIGHT = parsePositiveIntEnv(
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_ICHING_RITUAL_PHASE1_WEIGHT : undefined,
  70,
);

/** Relative counterpart used only to compute phase-1 share from total budget. Default 30. */
export const ICHING_RITUAL_PHASE2_WEIGHT = parsePositiveIntEnv(
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_ICHING_RITUAL_PHASE2_WEIGHT : undefined,
  30,
);

export const ICHING_RITUAL_BUDGET_MIN_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_RITUAL_BUDGET_MIN_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_RITUAL_BUDGET_MIN_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 3000 ? Math.min(300_000, Math.floor(raw)) : 8000;
})();

export const ICHING_RITUAL_BUDGET_MAX_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_RITUAL_BUDGET_MAX_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_RITUAL_BUDGET_MAX_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= ICHING_RITUAL_BUDGET_MIN_MS
    ? Math.min(600_000, Math.floor(raw))
    : 120_000;
})();

/**
 * Wall-clock budget used to spread ritual ticks + finale. Prefer last measured `/api/consult` duration;
 * otherwise fall back to `ICHING_RITUAL_TARGET_MS`.
 */
export function ichingRitualProcessingBudgetMs(lastMeasuredMs: number | null): number {
  const fallback = Math.min(
    ICHING_RITUAL_BUDGET_MAX_MS,
    Math.max(ICHING_RITUAL_BUDGET_MIN_MS, ICHING_RITUAL_TARGET_MS),
  );
  if (lastMeasuredMs != null && Number.isFinite(lastMeasuredMs) && lastMeasuredMs > 0) {
    return Math.min(
      ICHING_RITUAL_BUDGET_MAX_MS,
      Math.max(ICHING_RITUAL_BUDGET_MIN_MS, Math.round(lastMeasuredMs)),
    );
  }
  return fallback;
}

export type IchingRitualRevealTiming = {
  tickDelayMs: number;
};

/**
 * Maps total processing budget into phase-1 tick cadence.
 * Phase 2 (final hexagram focus) is intentionally untimed and ends when response rendering leaves ritual view.
 */
export function ichingRitualRevealTimingFromBudget(processingBudgetMs: number): IchingRitualRevealTiming {
  const budget = ichingRitualProcessingBudgetMs(processingBudgetMs);
  const w1 = ICHING_RITUAL_PHASE1_WEIGHT;
  const w2 = ICHING_RITUAL_PHASE2_WEIGHT;
  const sum = w1 + w2;
  const phase1Ms = (budget * w1) / sum;

  const rawTickDelay = Math.floor(phase1Ms / ICHING_RITUAL_TICKS);
  const tickDelayMs = Math.max(520, Math.min(ICHING_RITUAL_TICK_DELAY_MAX_MS, rawTickDelay));

  return { tickDelayMs };
}

/** @deprecated Prefer `ichingRitualRevealTimingFromBudget`; kept for preview/tools. */
export function ichingRitualTickDelayMs(): number {
  return ichingRitualRevealTimingFromBudget(ichingRitualProcessingBudgetMs(null)).tickDelayMs;
}

/** Tiny beat after HTTP OK so React can paint updated lines before finale (not extra “first half”). Manual I Ching JSON path only. */
export const ICHING_MANUAL_POST_HTTP_BEAT_MS = 220;

/**
 * Beat with seal grid visible (finale off) before shifting to finale hex — **manual I Ching JSON path only** (not auto SSE).
 * Env allows QA/experiments up to 120s (was capped at 800ms, which blocked long test values).
 */
export const ICHING_MANUAL_SEAL_HOLD_MS = (() => {
  const raw =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_ICHING_MANUAL_SEAL_HOLD_MS === "string"
      ? Number(process.env.NEXT_PUBLIC_ICHING_MANUAL_SEAL_HOLD_MS)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 0 && raw <= 120_000 ? raw : 140;
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
  const fallback = Math.max(18_000, ICHING_MANUAL_FINALE_MIN_MS);
  return Number.isFinite(raw) && raw >= ICHING_MANUAL_FINALE_MIN_MS ? raw : fallback;
})();

/** Finale dwell ≈ fetch round-trip (grid phase); clamped to min/max. */
export function ichingManualFinaleMsFromFetchDuration(fetchDurationMs: number): number {
  let v = Math.round(fetchDurationMs);
  if (!Number.isFinite(v) || v < 0) v = 0;
  if (v < ICHING_MANUAL_FINALE_MIN_MS) v = ICHING_MANUAL_FINALE_MIN_MS;
  if (v > ICHING_MANUAL_FINALE_MAX_MS) v = ICHING_MANUAL_FINALE_MAX_MS;
  return v;
}
