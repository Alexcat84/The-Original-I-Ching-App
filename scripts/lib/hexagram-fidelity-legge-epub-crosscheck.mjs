/**
 * EPUB cross-check for Legge SBE XVI PDF book-primary closure.
 *
 * BOOK-PRIMARY: Oxford scan OCR. EPUB (sacred-texts re-pack) is repair-only anchor.
 */

import {
  normalizeHexText,
  similarityHint,
  textsMatch,
  textsMatchStrict,
} from "./hexagram-fidelity-normalize.mjs";
import {
  fieldLooksCorrupt,
  fieldLooksTruncated,
} from "./hexagram-fidelity-legge-sbe-epub-guide.mjs";
import { fieldLooksLeggeOcrJunk } from "./hexagram-fidelity-legge-sbe-ocr.mjs";
import { listLeggeSbeBookPrimaryPatchFields } from "./hexagram-fidelity-legge-sbe-book-primary.mjs";

const PHOTO_PATCH_KEYS = new Set(
  listLeggeSbeBookPrimaryPatchFields().map(({ hex, field }) => `${hex}:${field}`),
);

function isBookPrimaryLabelDiff(pdf, epub) {
  const e = normalizeHexText(pdf, "legge");
  const a = normalizeHexText(epub, "legge");
  if (e === a) return false;
  return (
    e.replace(/\bline\b/g, "X").replace(/\bsix\b/g, "X") ===
    a.replace(/\bline\b/g, "X").replace(/\bsix\b/g, "X")
  );
}

function isBookPrimarySpellingDiff(pdf, epub) {
  const e = normalizeHexText(pdf, "legge");
  const a = normalizeHexText(epub, "legge");
  return (
    e.replace(/\bkhien\b/g, "kien") === a.replace(/\bkhien\b/g, "kien") &&
    e !== a
  );
}

function isBookPrimaryYongDiff(pdf, epub) {
  return /number (nine|line)/i.test(`${pdf} ${epub}`) && !textsMatch(pdf, epub, "legge");
}

function pdfLooksLikeBleed(pdf, epub) {
  const p = String(pdf ?? "").trim();
  const e = String(epub ?? "").trim();
  if (!p || !e) return false;
  const pdfLines = p.split("\n").map((l) => l.trim()).filter(Boolean);
  const epubLines = e.split("\n").map((l) => l.trim()).filter(Boolean);
  if (pdfLines.length <= epubLines.length) return false;
  let prefix = true;
  for (let i = 0; i < epubLines.length; i++) {
    if (!textsMatch(pdfLines[i] ?? "", epubLines[i], "legge")) {
      prefix = false;
      break;
    }
  }
  if (!prefix) return false;
  const extra = pdfLines.slice(epubLines.length);
  return extra.some(
    (line) =>
      fieldLooksCorrupt(line) ||
      fieldLooksLeggeOcrJunk(line) ||
      /^(Two indications|component trigrams|Explanation of|What is said on line|That the subject of|P\. Regis says|Hence comes the evil|All men love and honour)/i.test(
        line,
      ),
  );
}

/**
 * @param {string} pdf
 * @param {string} epub
 * @param {{ hex?: number; field?: string }} [ctx]
 * @returns {"strict_match"|"book_primary_photo"|"book_primary_label"|"book_primary_spelling"|"book_primary_yong"|"pdf_bleed"|"pdf_truncated"|"wording"|"pdf_corrupt"}
 */
export function classifyLeggePdfEpubField(pdf, epub, ctx = {}) {
  const hex = ctx.hex ?? 0;
  const field = ctx.field ?? "";
  const patchKey = `${hex}:${field}`;

  if (textsMatchStrict(pdf, epub, "legge")) return "strict_match";
  if (PHOTO_PATCH_KEYS.has(patchKey) && textsMatchStrict(pdf, epub, "legge") === false) {
    // Photo patch intentionally overrides EPUB when scan says so.
    if (isBookPrimaryLabelDiff(pdf, epub)) return "book_primary_label";
    if (isBookPrimaryYongDiff(pdf, epub)) return "book_primary_yong";
    if (isBookPrimarySpellingDiff(pdf, epub)) return "book_primary_spelling";
    return "book_primary_photo";
  }

  const p = String(pdf ?? "").trim();
  const e = String(epub ?? "").trim();
  if (!p && !e) return "strict_match";
  if (!p && e) return "pdf_truncated";
  if (p && !e) return "wording";

  if (fieldLooksCorrupt(p) || fieldLooksLeggeOcrJunk(p)) return "pdf_corrupt";
  if (pdfLooksLikeBleed(p, e)) return "pdf_bleed";

  const pdfLines = p.split("\n").map((l) => l.trim()).filter(Boolean);
  const epubLines = e.split("\n").map((l) => l.trim()).filter(Boolean);
  if (epubLines.length > pdfLines.length && pdfLines.length > 0) {
    let prefix = true;
    for (let i = 0; i < pdfLines.length; i++) {
      if (!textsMatch(pdfLines[i], epubLines[i] ?? "", "legge")) {
        prefix = false;
        break;
      }
    }
    if (prefix) return "pdf_truncated";
  }

  if (fieldLooksTruncated(p)) return "pdf_truncated";

  if (isBookPrimaryLabelDiff(p, e)) return "book_primary_label";
  if (isBookPrimaryYongDiff(p, e)) return "book_primary_yong";
  if (isBookPrimarySpellingDiff(p, e)) return "book_primary_spelling";

  const hint = similarityHint(p, e, "legge");
  if (hint.includes("truncated") || hint.includes("commentary_bleed")) {
    return hint.includes("commentary_bleed") ? "pdf_bleed" : "pdf_truncated";
  }

  return "wording";
}

/**
 * @param {Record<number, object>} row
 * @param {number} hex
 * @returns {Array<{ hex: number; field: string; text: string }>}
 */
export function leggeOracleFieldsFromRow(row, hex) {
  /** @type {Array<{ hex: number; field: string; text: string }>} */
  const out = [];
  if (!row) return out;
  if (row.judgment) out.push({ hex, field: "judgment", text: String(row.judgment) });
  if (row.image) out.push({ hex, field: "image", text: String(row.image) });
  for (let p = 1; p <= 6; p++) {
    const t = row.lines?.[p];
    if (t) out.push({ hex, field: `line${p}`, text: String(t) });
  }
  if (hex === 1 && row.yongJiu) out.push({ hex, field: "yongJiu", text: String(row.yongJiu) });
  if (hex === 2 && row.yongLiu) out.push({ hex, field: "yongLiu", text: String(row.yongLiu) });
  return out;
}
