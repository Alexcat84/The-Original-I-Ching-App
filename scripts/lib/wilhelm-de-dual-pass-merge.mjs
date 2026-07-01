/**
 * Merge Wilhelm DE book-one dual OCR passes (01 vs 03) field-by-field.
 */
import { readFileSync } from "node:fs";
import { WILHELM_MANUAL_FIELDS } from "./wilhelm-manual-fields.mjs";
import { normalizeWilhelmDeTxtText } from "./wilhelm-de-64hex-txt.mjs";

/**
 * @param {string} a
 * @param {string} b
 */
function normField(a, b) {
  return [
    normalizeWilhelmDeTxtText(a ?? ""),
    normalizeWilhelmDeTxtText(b ?? ""),
  ];
}

/**
 * @param {string} a
 * @param {string} b
 */
function pickBestField(a, b) {
  const [na, nb] = normField(a, b);
  if (na === nb) return { value: a ?? "", disputed: false, reason: "equal" };
  if (!na && nb) return { value: b ?? "", disputed: false, reason: "pass03_only" };
  if (na && !nb) return { value: a ?? "", disputed: false, reason: "pass01_only" };
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
  if (sa > sb) return { value: a ?? "", disputed: true, reason: "prefer_pass01_score" };
  if (sb > sa) return { value: b ?? "", disputed: true, reason: "prefer_pass03_score" };
  return { value: b ?? "", disputed: true, reason: "tie_prefer_pass03" };
}

/**
 * @param {object} pass01Payload
 * @param {object} pass03Payload
 */
export function mergeWilhelmDeDualPass(pass01Payload, pass03Payload) {
  /** @type {Array<object>} */
  const disputes = [];
  /** @type {Record<string, object>} */
  const hexagrams = {};

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const h01 = pass01Payload.hexagrams?.[key];
    const h03 = pass03Payload.hexagrams?.[key];
    if (!h03) {
      throw new Error(`Missing hex ${n} in pass03`);
    }
    if (!h01) {
      hexagrams[key] = {
        bookChinese: h03.bookChinese,
        bookTitle: h03.bookTitle,
        bookHanzi: h03.bookHanzi,
        bookHexFont: h03.bookHexFont,
        lineStart: h03.lineStart,
        lineEnd: h03.lineEnd,
        fields: { ...h03.fields },
      };
      continue;
    }

    /** @type {Record<string, string>} */
    const fields = { hex: key };
    for (const fieldDef of WILHELM_MANUAL_FIELDS) {
      const fieldKey = fieldDef.key;
      if (fieldKey === "hex") continue;
      const v01 = h01.fields?.[fieldKey] ?? "";
      const v03 = h03.fields?.[fieldKey] ?? "";
      const picked = pickBestField(v01, v03);
      fields[fieldKey] = picked.value;
      if (picked.disputed) {
        const [na, nb] = normField(v01, v03);
        if (na !== nb) {
          disputes.push({
            hex: n,
            field: fieldKey,
            pass01: v01,
            pass03: v03,
            picked: picked.value,
            reason: picked.reason,
          });
        }
      }
    }

    hexagrams[key] = {
      bookChinese: h03.bookChinese ?? h01.bookChinese,
      bookTitle: h03.bookTitle ?? h01.bookTitle,
      bookHanzi: h03.bookHanzi ?? h01.bookHanzi,
      bookHexFont: h03.bookHexFont ?? h01.bookHexFont,
      lineStart: h03.lineStart,
      lineEnd: h03.lineEnd,
      fields,
    };
  }

  return {
    mergedAt: new Date().toISOString(),
    sources: [pass01Payload.source, pass03Payload.source],
    disputeCount: disputes.length,
    disputes,
    hexagrams,
  };
}

/**
 * @param {string} pass01Path
 * @param {string} pass03Path
 */
export function loadAndMergeWilhelmDeDualPass(pass01Path, pass03Path) {
  const pass01 = JSON.parse(readFileSync(pass01Path, "utf8"));
  const pass03 = JSON.parse(readFileSync(pass03Path, "utf8"));
  return mergeWilhelmDeDualPass(pass01, pass03);
}
