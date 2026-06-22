/**
 * EPUB cross-check guide for Legge SBE XVI PDF OCR gold.
 *
 * BOOK-PRIMARY: Oxford scan + OCR is the gold source. EPUB (sacred-texts re-pack)
 * may only repair OCR when:
 * 1) the EPUB passage is anchored in the PDF slice (coverage >= threshold), or
 * 2) the PDF field is empty/corrupt/invalid/truncated (repair fallback).
 * Never adopt EPUB for label-only diffs (line vs six, Khien vs Kien) without anchor.
 */

import { normalizeHexText, textsMatch } from "./hexagram-fidelity-normalize.mjs";
import { fieldLooksLeggeOcrJunk } from "./hexagram-fidelity-legge-sbe-ocr.mjs";

const JUDGMENT_COVERAGE = 0.68;
const LINE_COVERAGE = 0.58;
const IMAGE_COVERAGE = 0.52;
const YONG_COVERAGE = 0.6;
const CORRUPT_REPAIR_COVERAGE = 0.38;

/**
 * Sequential word coverage after legge normalize (diacritic-folded, lowercased).
 * @param {string} ocrText
 * @param {string} epubText
 */
export function epubAnchorCoverage(ocrText, epubText) {
  const ocr = normalizeHexText(ocrText, "legge");
  const target = normalizeHexText(epubText, "legge");
  if (!target) return 0;
  if (target.length >= 10 && ocr.includes(target)) return 1;
  const words = target.split(/\s+/).filter((w) => w.length > 2);
  if (words.length < 3) {
    return target.length >= 8 && ocr.includes(target) ? 1 : 0;
  }
  let found = 0;
  let pos = 0;
  for (const w of words) {
    const i = ocr.indexOf(w, pos);
    if (i < 0) return found / words.length;
    found += 1;
    pos = i + w.length;
  }
  return found / words.length;
}

function fieldLooksCorrupt(pdfVal) {
  const t = String(pdfVal ?? "").trim();
  if (!t) return true;
  return (
    /THE Y[^\n]{0,20}KING\. TEXT|Explanation of the separate lines|SECT\.\s+[IVXLCDM]+\.|Line \d+ is (?:weak|strong)/i.test(
      t,
    ) ||
    /^Line \d+, though/i.test(t) ||
    /What is said on line \d+/i.test(t) ||
    /The symbolism of paragraph/i.test(t) ||
    /is the hexagram of the sixth month/i.test(t) ||
    /^and moreover there is no proper correlate/i.test(t) ||
    /^ho appears unexpectedly on the scene/i.test(t) ||
    /^The next sentence shows him sensible of the danger/i.test(t) ||
    /^hose fellow disappears/i.test(t) ||
    /^Kwo indicates that \(in thecireumstances/i.test(t) ||
    /\bthecireumstances\b/i.test(t) ||
    /Two indications are evident in the lines|component trigrams will be considered|symso as to dispense benefits/i.test(
      t,
    ) ||
    /\b5\.\s+The fifth line,/i.test(t) ||
    /The Great Symbolism here has come before us|Of the application of that symbolism/i.test(t) ||
    /\ba\.\s+'When the/i.test(t) ||
    /The subject of \d therefore/i.test(t) ||
    /pointed out in the conclusion/i.test(t) ||
    /The constellation of the Bushel corresponds to our Ursa Major/i.test(t) ||
    /according to their kinds and classes\. \d+,/i.test(t) ||
    /regret\. \d+\. \(To the subject of\)/i.test(t) ||
    /nourishes his virtue\. \./i.test(t)
  );
}

/** PDF OCR stopped mid-field (common on spliced scan pages). */
export function fieldLooksTruncated(text) {
  const t = String(text ?? "").trim();
  if (!t || t.length >= 80) return false;
  return !/[.!?]["'”)]?$/.test(t);
}

function isCommentaryJudgment(text) {
  return (
    /Referring to Appendixes|conduct of military expeditions|is denoted by the hexagram/i.test(text) ||
    /The character giving its name|nomenclature of first nine|universally acquiesced in/i.test(text) ||
    /^Line \d+ is (?:weak|strong)/i.test(text) ||
    /^Line \d+, though (?:weak|strong)/i.test(text) ||
    /That the subject of the line|further proof of his humility|to be very small/i.test(text) ||
    /But what suggests the statement|^P\. Regis says|^The strong line \d+/i.test(text) ||
    /^All men love and honour humility/i.test(text) ||
    /^Hence comes the evil auspice/i.test(text)
  );
}

function isValidLeggeJudgment(text) {
  const t = String(text).trim();
  if (t.length < 20) return false;
  if (isCommentaryJudgment(t)) return false;
  return (
    /^\(?(?:In\s+\(|In\s+[A-ZĂÎŽ]|Under the conditions|\(What takes place|\(Looking at\)|Kung F|For\s+\(|When one)/i.test(t) ||
    /\bindicates (?:that|how)|intimates (?:that|how)|suggests the idea|\(represents\)|gives the intimation|requires \(in him|\bwe see\b/i.test(
      t,
    )
  );
}

function normalizeLineSixLabel(text) {
  return normalizeHexText(
    String(text)
      .replace(/\b(?:six|line),\s*(undivided|divided)/gi, (_, div) => `line, ${String(div).toLowerCase()}`)
      .replace(/\b(first|second|third|fourth|fifth|sixth|topmost)\s+six,/gi, "$1 line,"),
    "legge",
  );
}

function lineBodyAnchorCoverage(ocrText, epubLine) {
  const m = String(epubLine).match(/line,\s*(?:undivided|divided),\s*([\s\S]{16,})/i);
  if (!m?.[1]) return epubAnchorCoverage(ocrText, epubLine);
  return epubAnchorCoverage(ocrText, m[1]);
}

function lineAnchorCoverage(ocrText, epubLine) {
  return Math.max(epubAnchorCoverage(ocrText, epubLine), lineBodyAnchorCoverage(ocrText, epubLine));
}

function isTruncatedPdfLine(pdfVal, epubVal) {
  if (epubVal.length <= pdfVal.length + 15) return false;
  const nPdf = normalizeLineSixLabel(pdfVal);
  const nEpub = normalizeLineSixLabel(epubVal);
  return nEpub.startsWith(nPdf.slice(0, Math.min(40, nPdf.length)).trim());
}

function isTruncatedPdfJudgment(pdfVal, epubVal) {
  if (epubVal.length <= pdfVal.length + 15) return false;
  const pn = normalizeHexText(pdfVal, "legge");
  const en = normalizeHexText(epubVal, "legge");
  return en.startsWith(pn.slice(0, Math.min(40, pn.length)).trim());
}

function judgmentHasCommentaryBleed(pdfVal, epubVal) {
  return (
    pdfVal.length > epubVal.length + 80 &&
    /Two indications are evident|component trigrams will be considered/i.test(pdfVal)
  );
}

/**
 * PDF OCR needs EPUB help only when clearly broken — not when it merely differs from bundle/EPUB.
 * @param {string} pdfVal
 * @param {string} epubVal
 * @param {{ line?: boolean; judgment?: boolean; image?: boolean }} kind
 */
function pdfFieldNeedsEpubHelp(pdfVal, epubVal, kind = {}) {
  if (!String(epubVal ?? "").trim()) return false;
  if (textsMatch(pdfVal, epubVal, "legge")) return false;
  if (!String(pdfVal ?? "").trim()) return true;
  if (fieldLooksCorrupt(pdfVal)) return true;
  if (fieldLooksLeggeOcrJunk(pdfVal) && !fieldLooksLeggeOcrJunk(epubVal)) return true;

  if (kind.judgment) {
    if (!isValidLeggeJudgment(pdfVal) && isValidLeggeJudgment(epubVal)) return true;
    if (judgmentHasCommentaryBleed(pdfVal, epubVal)) return true;
    if (isTruncatedPdfJudgment(pdfVal, epubVal)) return true;
    return false;
  }

  if (kind.line) {
    if (isTruncatedPdfLine(pdfVal, epubVal)) return true;
    if (fieldLooksTruncated(pdfVal)) return true;
    return false;
  }

  if (kind.image) {
    return fieldLooksCorrupt(pdfVal);
  }

  return false;
}

function adoptIfAnchored(
  pdfVal,
  epubVal,
  ocrContext,
  threshold,
  { line = false, judgment = false, image = false } = {},
) {
  if (!String(epubVal ?? "").trim()) return pdfVal;

  if (
    fieldLooksLeggeOcrJunk(pdfVal) &&
    !fieldLooksLeggeOcrJunk(epubVal) &&
    String(epubVal).trim().length >= 20
  ) {
    return epubVal.trim();
  }

  if (line && isTruncatedPdfLine(pdfVal, epubVal)) {
    return epubVal.trim();
  }
  if (judgment && isTruncatedPdfJudgment(pdfVal, epubVal)) {
    return epubVal.trim();
  }
  if (image && fieldLooksCorrupt(pdfVal) && String(epubVal ?? "").trim().length > 40) {
    return epubVal.trim();
  }

  if (textsMatch(pdfVal, epubVal, "legge")) return pdfVal;

  const kind = { line, judgment, image };
  const coverage = line ? lineAnchorCoverage(ocrContext, epubVal) : epubAnchorCoverage(ocrContext, epubVal);
  const corrupt = fieldLooksCorrupt(pdfVal);
  const invalidJudgment = judgment && !isValidLeggeJudgment(pdfVal) && isValidLeggeJudgment(epubVal);
  const needsHelp = pdfFieldNeedsEpubHelp(pdfVal, epubVal, kind);

  // Anchor in Oxford OCR slice → same passage; EPUB is typographic cleanup only.
  if (coverage >= threshold) return epubVal.trim();

  if (!needsHelp) return pdfVal;

  if (judgment && (corrupt || invalidJudgment || judgmentHasCommentaryBleed(pdfVal, epubVal))) {
    if (isValidLeggeJudgment(epubVal)) return epubVal.trim();
  }

  if (
    line &&
    isTruncatedPdfLine(pdfVal, epubVal) &&
    String(epubVal).trim().length > String(pdfVal).trim().length + 8
  ) {
    return epubVal.trim();
  }

  if (line && (corrupt || fieldLooksTruncated(pdfVal)) && lineAnchorCoverage(ocrContext, epubVal) >= CORRUPT_REPAIR_COVERAGE) {
    return epubVal.trim();
  }

  if (image && corrupt && String(epubVal ?? "").trim().length > 40) {
    return epubVal.trim();
  }

  if (image && corrupt && coverage >= CORRUPT_REPAIR_COVERAGE) {
    return epubVal.trim();
  }

  if (!line && !judgment && !image && corrupt && coverage >= CORRUPT_REPAIR_COVERAGE) {
    return epubVal.trim();
  }

  return pdfVal;
}

/**
 * @param {{ judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }} pdfRow
 * @param {{ judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }} epubRow
 * @param {string} bodySlice
 * @param {string} symbolismText
 */
export function applyEpubGuideToLeggeRow(pdfRow, epubRow, bodySlice, symbolismText) {
  /** @type {Record<number, string>} */
  const lines = { ...(pdfRow.lines ?? {}) };
  for (let p = 1; p <= 6; p++) {
    lines[p] = adoptIfAnchored(lines[p] ?? "", epubRow.lines?.[p] ?? "", bodySlice, LINE_COVERAGE, {
      line: true,
    });
  }

  const out = {
    judgment: adoptIfAnchored(pdfRow.judgment ?? "", epubRow.judgment ?? "", bodySlice, JUDGMENT_COVERAGE, {
      judgment: true,
    }),
    image: adoptIfAnchored(pdfRow.image ?? "", epubRow.image ?? "", symbolismText, IMAGE_COVERAGE, {
      image: true,
    }),
    lines,
  };
  if (pdfRow.yongJiu || epubRow.yongJiu) {
    const pdfY = pdfRow.yongJiu ?? "";
    const epubY = epubRow.yongJiu ?? "";
    const scanSaysNine = /\bnumber nine\b/i.test(pdfY);
    const epubSaysLine = /\bnumber line\b/i.test(epubY);
    out.yongJiu =
      scanSaysNine && epubSaysLine
        ? pdfY
        : adoptIfAnchored(pdfY, epubY, bodySlice, YONG_COVERAGE);
  }
  if (pdfRow.yongLiu || epubRow.yongLiu) {
    out.yongLiu = adoptIfAnchored(pdfRow.yongLiu ?? "", epubRow.yongLiu ?? "", bodySlice, YONG_COVERAGE);
  }
  return out;
}

export { fieldLooksCorrupt };

/**
 * Final bundle-safe pass: PDF gold first, EPUB repair-only when PDF is broken/truncated.
 * @param {{ judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }} pdfRow
 * @param {{ judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }} epubRow
 * @param {string} bodySlice
 * @param {string} symbolismText
 */
export function sanitizeLeggeRowForBundle(pdfRow, epubRow, bodySlice, symbolismText) {
  return applyEpubGuideToLeggeRow(pdfRow, epubRow, bodySlice, symbolismText);
}
