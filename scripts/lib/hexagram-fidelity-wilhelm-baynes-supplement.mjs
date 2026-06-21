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
 * Five individual changing-line texts the Parma mirror omits entirely (the HTML
 * skips straight from the prior label to the next, e.g. "in the fourth place"
 * to "at the top" — same class of gap as the hex 56 judgment, just at line
 * granularity). Restored from the bundle text that shipped before the Fase 3
 * Parma re-ingest (itself transcribed from the 1950 Wilhelm/Baynes English
 * edition) — not an independent fresh cross-check like hex 56's judgment, so
 * documented here as a distinct, lower-confidence tier-2 source.
 * @type {Record<number, Record<number, { text: string; source: string }>>}
 */
export const WILHELM_BAYNES_LINE_SUPPLEMENTS = {
  20: {
    5: {
      text: "Contemplation of my life.\nThe superior man is without blame.",
      source: "pre-Fase-3 bundle (Wilhelm/Baynes 1950, adamblvck/iching-wilhelm-dataset transcription)",
    },
  },
  21: {
    2: {
      text: "Bites through tender meat,\nSo that his nose disappears.\nNo blame.",
      source: "pre-Fase-3 bundle (Wilhelm/Baynes 1950, adamblvck/iching-wilhelm-dataset transcription)",
    },
    3: {
      text: "Bites on old dried meat\nAnd strikes on something poisonous.\nSlight humiliation. No blame.",
      source: "pre-Fase-3 bundle (Wilhelm/Baynes 1950, adamblvck/iching-wilhelm-dataset transcription)",
    },
  },
  26: {
    3: {
      text:
        "A good horse that follows others.\nAwareness of danger,\nWith perseverance, furthers.\n" +
        "Practice chariot driving and armed defense daily.\nIt furthers one to have somewhere to go.",
      source: "pre-Fase-3 bundle (Wilhelm/Baynes 1950, adamblvck/iching-wilhelm-dataset transcription)",
    },
  },
  52: {
    2: {
      text: "Keeping his calves still.\nHe cannot rescue him whom he follows.\nHis heart is not glad.",
      source: "pre-Fase-3 bundle (Wilhelm/Baynes 1950, adamblvck/iching-wilhelm-dataset transcription)",
    },
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
 * @param {number} hex 1..64
 * @param {number} pos 1..6
 * @returns {{ text: string; source: string } | null}
 */
export function getWilhelmBaynesLineSupplement(hex, pos) {
  return WILHELM_BAYNES_LINE_SUPPLEMENTS[hex]?.[pos] ?? null;
}

/**
 * Apply tier-2 judgment + line fallbacks onto Parma-parsed gold (mutates copy).
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
  for (const [hexKey, posMap] of Object.entries(WILHELM_BAYNES_LINE_SUPPLEMENTS)) {
    const n = Number(hexKey);
    const row = out[n];
    if (!row) continue;
    const lines = { ...(row.lines ?? {}) };
    const tier2Lines = { ...(row._tier2Lines ?? {}) };
    for (const [posKey, sup] of Object.entries(posMap)) {
      const pos = Number(posKey);
      if (String(lines[pos] ?? "").trim()) continue;
      lines[pos] = sup.text;
      tier2Lines[pos] = sup.source;
    }
    out[n] = { ...row, lines, _tier2Lines: tier2Lines };
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

/**
 * Resolve a single Wilhelm line for ingest: Parma first, then tier-2 Baynes line
 * supplement, then whatever the dataset already had.
 * @param {number} hex
 * @param {number} pos 1..6
 * @param {string} parmaLine
 * @param {string} [existingFallback]
 */
export function resolveWilhelmLineForIngest(hex, pos, parmaLine, existingFallback = "") {
  const fromParma = String(parmaLine ?? "").trim();
  if (fromParma) return fromParma;
  const sup = getWilhelmBaynesLineSupplement(hex, pos);
  if (sup?.text) return sup.text;
  return String(existingFallback ?? "").trim();
}
