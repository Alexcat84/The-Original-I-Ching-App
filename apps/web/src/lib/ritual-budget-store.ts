"use client";

export type RitualKey =
  | "iching:wilhelm"
  | "iching:legge"
  | "iching:zhouyi"
  | "iching:master_combined"
  | "bones";

const SEED_MS: Record<RitualKey, number> = {
  "iching:wilhelm": 40_000,
  "iching:legge": 40_000,
  "iching:zhouyi": 40_000,
  "iching:master_combined": 90_000, // measured M3+deep-context ~93s (audit 2026-06-14)
  "bones": 25_000,
};

const CLAMP_MIN = 8_000;
const CLAMP_MAX = 120_000;
const STORAGE_PREFIX = "ritual_budget_v1:";

/** Returns persisted budget for key, or seed value if no measurement exists yet. */
export function getRitualBudget(key: RitualKey): number {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) {
      const n = Number(stored);
      if (Number.isFinite(n)) return Math.min(CLAMP_MAX, Math.max(CLAMP_MIN, n));
    }
  } catch {
    /* SSR / storage unavailable — fall through to seed */
  }
  return SEED_MS[key] ?? 40_000;
}

/** Persists measured wall-clock duration (clamped) for the given key. */
export function recordRitualBudget(key: RitualKey, ms: number): void {
  try {
    const clamped = Math.min(CLAMP_MAX, Math.max(CLAMP_MIN, ms));
    localStorage.setItem(STORAGE_PREFIX + key, String(clamped));
  } catch {
    /* ignore */
  }
}

export function toRitualKey(
  oracleMode: string,
  translatorId: string,
): RitualKey {
  if (oracleMode === "oracle_bones") return "bones";
  return `iching:${translatorId}` as RitualKey;
}
