/**
 * Tier-2 Wilhelm gold supplements where the Parma HTML mirror omits content
 * present in the Cary F. Baynes / Princeton (1950) English edition.
 *
 * Tier-0: http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html
 * Tier-2: Baynes rendering cross-checked against wengu (Wilhelm tr.) hex 56.
 *
 * @see docs/auditorias/ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md §12.4
 */

/** @type {Record<number, { judgment: string; sources: string[] }>} */
export const WILHELM_BAYNES_JUDGMENT_SUPPLEMENTS = {
  56: {
    judgment:
      "The Wanderer. Success through smallness.\n" +
      "Perseverance brings good fortune to the wanderer.\n\n" +
      "WHEN A man is a wanderer and stranger, he should not be gruff nor overbearing. " +
      "He has no large circle of acquaintances, therefore he should not give himself airs. " +
      "He must be cautious and reserved; in this way he protects himself from evil. " +
      "If he is obliging toward others, he wins success.",
    sources: [
      "https://www.penguinrandomhouse.com/books/574185/the-i-ching-or-book-of-changes-by-richard-wilhelm-and-cary-f-baynes/",
      "http://wengu.tartarie.com/wg/wengu.php?l=Yijing&no=56",
      "https://www.iching-online.com/hexagrams/iching-hexagram-101100.html",
    ],
  },
};

/**
 * @param {number} hex 1..64
 * @returns {{ judgment: string; sources: string[] } | null}
 */
export function getWilhelmBaynesJudgmentSupplement(hex) {
  return WILHELM_BAYNES_JUDGMENT_SUPPLEMENTS[hex] ?? null;
}

/**
 * Apply tier-2 judgment fallbacks onto Parma-parsed gold (mutates copy).
 * @param {Record<number, { judgment?: string; image?: string; lines?: Record<number, string> }>} parsed
 */
export function applyWilhelmBaynesSupplements(parsed) {
  const out = structuredClone(parsed);
  for (const [hexKey, sup] of Object.entries(WILHELM_BAYNES_JUDGMENT_SUPPLEMENTS)) {
    const n = Number(hexKey);
    const row = out[n];
    if (!row || row.judgment?.trim()) continue;
    out[n] = {
      ...row,
      judgment: sup.judgment,
      _tier2Judgment: "baynes",
      _tier2Sources: sup.sources,
    };
  }
  return out;
}

/**
 * Resolve Wilhelm judgment for ingest: Parma first, then tier-2 Baynes.
 * @param {number} hex
 * @param {string} parmaJudgment
 * @param {string} [existingFallback]
 */
export function resolveWilhelmJudgmentForIngest(hex, parmaJudgment, existingFallback = "") {
  const fromParma = String(parmaJudgment ?? "").trim();
  if (fromParma) return fromParma;
  const sup = getWilhelmBaynesJudgmentSupplement(hex);
  if (sup?.judgment) return sup.judgment;
  return String(existingFallback ?? "").trim();
}
