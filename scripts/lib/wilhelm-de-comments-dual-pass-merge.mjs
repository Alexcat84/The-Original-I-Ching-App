/**
 * Merge Wilhelm DE Drittes Buch dual OCR passes (02 vs 04) field-by-field.
 */
import { readFileSync } from "node:fs";
import { normalizeWilhelmDeTxtText } from "./wilhelm-de-64hex-txt.mjs";
import { WILHELM_DE_COMMENT_FIELD_KEYS } from "./wilhelm-de-64hex-comments-txt.mjs";

/**
 * @param {string} a
 * @param {string} b
 */
function normField(a, b) {
  return [normalizeWilhelmDeTxtText(a ?? ""), normalizeWilhelmDeTxtText(b ?? "")];
}

/**
 * @param {string} a
 * @param {string} b
 */
export function pickWilhelmDeCommentsDualPassField(a, b) {
  const [na, nb] = normField(a, b);
  if (na === nb) return { value: a ?? "", disputed: false, reason: "equal" };
  if (!na && nb) return { value: b ?? "", disputed: false, reason: "pass04_only" };
  if (na && !nb) return { value: a ?? "", disputed: false, reason: "pass02_only" };
  const score = (s) => {
    let n = 0;
    if (/[äöüßÄÖÜ]/.test(s)) n += 2;
    if (!/[^\x20-\x7EäöüßÄÖÜ—"\n]/.test(s)) n += 1;
    if (s.length > 20) n += 1;
    if (/[#@]{3,}/.test(s)) n -= 3;
    if (/\d{5,}/.test(s)) n -= 2;
    return n;
  };
  const sa = score(na);
  const sb = score(nb);
  if (sa > sb) return { value: a ?? "", disputed: true, reason: "prefer_pass02_score" };
  if (sb > sa) return { value: b ?? "", disputed: true, reason: "prefer_pass04_score" };
  return { value: b ?? "", disputed: true, reason: "tie_prefer_pass04" };
}

/**
 * @param {object} pass02Payload
 * @param {object} pass04Payload
 */
export function mergeWilhelmDeCommentsDualPass(pass02Payload, pass04Payload) {
  /** @type {Array<object>} */
  const disputes = [];
  /** @type {Record<string, object>} */
  const hexagrams = {};

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const h02 = pass02Payload.hexagrams?.[key];
    const h04 = pass04Payload.hexagrams?.[key];
    if (!h04) throw new Error(`Missing hex ${n} in pass04`);
    if (!h02) {
      hexagrams[key] = { ...h04, fields: { ...h04.fields } };
      continue;
    }

    /** @type {Record<string, string>} */
    const fields = { hex: key, ...h04.fields };
    for (const fieldKey of WILHELM_DE_COMMENT_FIELD_KEYS) {
      const v02 = h02.fields?.[fieldKey] ?? "";
      const v04 = h04.fields?.[fieldKey] ?? "";
      const picked = pickWilhelmDeCommentsDualPassField(v02, v04);
      fields[fieldKey] = picked.value;
      if (picked.disputed) {
        const [na, nb] = normField(v02, v04);
        if (na !== nb) {
          disputes.push({
            hex: n,
            field: fieldKey,
            pass02: v02,
            pass04: v04,
            picked: picked.value,
            reason: picked.reason,
          });
        }
      }
    }

    hexagrams[key] = {
      bookChinese: h04.bookChinese ?? h02.bookChinese,
      bookTitle: h04.bookTitle ?? h02.bookTitle,
      bookHanzi: h04.bookHanzi ?? h02.bookHanzi,
      bookHexFont: h04.bookHexFont ?? h02.bookHexFont,
      lineStart: h04.lineStart,
      lineEnd: h04.lineEnd,
      fields,
    };
  }

  return {
    mergedAt: new Date().toISOString(),
    sources: [pass02Payload.source, pass04Payload.source],
    disputeCount: disputes.length,
    disputes,
    hexagrams,
  };
}

/**
 * @param {string} pass02Path
 * @param {string} pass04Path
 */
export function loadAndMergeWilhelmDeCommentsDualPass(pass02Path, pass04Path) {
  const pass02 = JSON.parse(readFileSync(pass02Path, "utf8"));
  const pass04 = JSON.parse(readFileSync(pass04Path, "utf8"));
  return mergeWilhelmDeCommentsDualPass(pass02, pass04);
}
