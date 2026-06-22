/**
 * Tier-2 Wilhelm gold supplements where the Parma HTML mirror omits content
 * present in the Cary F. Baynes / Princeton (1950) English edition.
 *
 * Tier-0 (Parma): http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html
 * Tier-2 (supplements): Wilhelm/Baynes print edition (1950), page-verified 2026-06-21.
 *
 * @see docs/auditorias/DATA_INTEGRITY_AUDIT.md
 * @see docs/auditorias/ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md §12.4
 */

/** Primary print source for all six Parma gaps. */
export const WILHELM_BAYNES_1950_CITATION =
  "Wilhelm, Richard; Baynes, Cary F. The I Ching or Book of Changes. " +
  "Princeton University Press, 1950 (Bollingen Series XIX).";

/** Page references in the 1950 print edition (physical copy verification). */
export const WILHELM_BAYNES_SUPPLEMENT_PAGES = {
  "56:judgment": "p. 231",
  "20:5": "pp. 88-89",
  "21:2": "pp. 92-93",
  "21:3": "pp. 92-93",
  "26:3": "p. 112",
  "52:2": "p. 215",
};

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
      `${WILHELM_BAYNES_1950_CITATION} ${WILHELM_BAYNES_SUPPLEMENT_PAGES["56:judgment"]}`,
    ],
  },
};

/**
 * Five individual changing-line texts the Parma mirror omits entirely (the HTML
 * skips straight from the prior label to the next). Sourced from the 1950 print
 * edition (page-verified against a physical copy, 2026-06-21).
 * @type {Record<number, Record<number, { text: string; source: string }>>}
 */
export const WILHELM_BAYNES_LINE_SUPPLEMENTS = {
  20: {
    5: {
      text: "Contemplation of my life.\nThe superior man is without blame.",
      source: `${WILHELM_BAYNES_1950_CITATION} ${WILHELM_BAYNES_SUPPLEMENT_PAGES["20:5"]}`,
    },
  },
  21: {
    2: {
      text: "Bites through tender meat,\nSo that his nose disappears.\nNo blame.",
      source: `${WILHELM_BAYNES_1950_CITATION} ${WILHELM_BAYNES_SUPPLEMENT_PAGES["21:2"]}`,
    },
    3: {
      text: "Bites on old dried meat\nAnd strikes on something poisonous.\nSlight humiliation. No blame.",
      source: `${WILHELM_BAYNES_1950_CITATION} ${WILHELM_BAYNES_SUPPLEMENT_PAGES["21:3"]}`,
    },
  },
  26: {
    3: {
      text:
        "A good horse that follows others.\nAwareness of danger,\nWith perseverance, furthers.\n" +
        "Practice chariot driving and armed defense daily.\nIt furthers one to have somewhere to go.",
      source: `${WILHELM_BAYNES_1950_CITATION} ${WILHELM_BAYNES_SUPPLEMENT_PAGES["26:3"]}`,
    },
  },
  52: {
    2: {
      text: "Keeping his calves still.\nHe cannot rescue him whom he follows.\nHis heart is not glad.",
      source: `${WILHELM_BAYNES_1950_CITATION} ${WILHELM_BAYNES_SUPPLEMENT_PAGES["52:2"]}`,
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
