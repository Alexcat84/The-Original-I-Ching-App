/** Known Princeton EPUB digitization typos — runtime uses book-correct spelling. */

/** @type {Record<number, [RegExp, string]>} */
export const WILHELM_EPUB_JUDGMENT_TYPO_FIXES = {
  19: [/\bAPPPROACH\b/g, "APPROACH"],
  47: [/\bOPPPRESSION\b/g, "OPPRESSION"],
};

/**
 * @param {number} hexNumber
 * @param {string} judgment
 */
export function applyWilhelmEpubJudgmentTypoFix(hexNumber, judgment) {
  const fix = WILHELM_EPUB_JUDGMENT_TYPO_FIXES[hexNumber];
  if (!fix) return judgment;
  const [pattern, replacement] = fix;
  return judgment.replace(pattern, replacement);
}

/**
 * @param {number} hexNumber
 * @param {string} fieldKey
 */
export function isWilhelmIntentionalEpubDelta(hexNumber, fieldKey) {
  return (
    fieldKey === "judgment" &&
    (hexNumber === 19 || hexNumber === 47)
  );
}
