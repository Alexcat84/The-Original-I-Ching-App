/**
 * EPUB cross-check for Wilhelm PDF book-primary closure.
 *
 * BOOK-PRIMARY: Pantheon 1950 PDF. Princeton Bollingen EPUB (2011, same Wilhelm/Baynes
 * translation) is statement-only via blockquotes — repair-only anchor for bleed/truncation.
 */

import {
  detectWilhelmLineBleed,
  normalizeHexText,
  textsMatchStrict,
} from "./hexagram-fidelity-normalize.mjs";
import {
  isWilhelmLineCommentaryLine,
  lineEndsWilhelmOracleStanza,
  lineFollowsWilhelmOracleStanza,
} from "./hexagram-fidelity-wilhelm-ocr.mjs";

/**
 * @returns {"strict_match"|"pdf_bleed"|"pdf_truncated"|"wording"}
 */
export function classifyWilhelmPdfEpubLine(pdf, epub) {
  const a = normalizeHexText(pdf, "wilhelm");
  const e = normalizeHexText(epub, "wilhelm");
  if (!a && !e) return "strict_match";
  if (textsMatchStrict(pdf, epub, "wilhelm")) return "strict_match";

  const pdfLines = String(pdf)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const epubLines = String(epub)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (pdfLines.length >= epubLines.length && epubLines.length > 0) {
    let prefix = true;
    for (let i = 0; i < epubLines.length; i++) {
      if (normalizeHexText(pdfLines[i] ?? "", "wilhelm") !== normalizeHexText(epubLines[i], "wilhelm")) {
        prefix = false;
        break;
      }
    }
    if (prefix && pdfLines.length > epubLines.length) {
      const extra = pdfLines.slice(epubLines.length);
      if (
        extra.some((l, i) =>
          lineFollowsWilhelmOracleStanza(l) || isWilhelmLineCommentaryLine(l, epubLines.length + i),
        )
      ) {
        return "pdf_bleed";
      }
      return "wording";
    }
  }

  if (detectWilhelmLineBleed(pdf, epub)) return "pdf_bleed";

  if (epubLines.length > pdfLines.length && pdfLines.length > 0) {
    let prefix = true;
    for (let i = 0; i < pdfLines.length; i++) {
      if (normalizeHexText(pdfLines[i], "wilhelm") !== normalizeHexText(epubLines[i] ?? "", "wilhelm")) {
        prefix = false;
        break;
      }
    }
    if (prefix) return "pdf_truncated";
  }

  if (detectWilhelmLineBleed(epub, pdf)) return "pdf_truncated";
  return "wording";
}

/**
 * @param {string[]} pdfLines
 * @param {number} minKeep
 */
function trimPdfLinesBeforeCommentary(pdfLines, minKeep) {
  const out = [];
  for (let i = 0; i < pdfLines.length; i++) {
    const line = pdfLines[i];
    if (i >= minKeep && (lineFollowsWilhelmOracleStanza(line) || isWilhelmLineCommentaryLine(line, i))) {
      break;
    }
    if (i > 0 && lineEndsWilhelmOracleStanza(out[out.length - 1]) && lineFollowsWilhelmOracleStanza(line)) {
      break;
    }
    out.push(line);
  }
  return out.join("\n");
}

/**
 * Repair-only: trim PDF line using EPUB statement-only hint.
 * @param {string} pdfLine
 * @param {string} epubLine
 */
export function trimWilhelmLineWithEpubHint(pdfLine, epubLine) {
  const pdf = String(pdfLine ?? "").trim();
  const epub = String(epubLine ?? "").trim();
  if (!pdf || !epub) return pdf;
  if (textsMatchStrict(pdf, epub, "wilhelm")) return epub;

  const status = classifyWilhelmPdfEpubLine(pdf, epub);
  const pdfLines = pdf.split("\n").map((l) => l.trim()).filter(Boolean);
  const epubLines = epub.split("\n").map((l) => l.trim()).filter(Boolean);

  if (status === "pdf_truncated" && epubLines.length > pdfLines.length) {
    let prefix = true;
    for (let i = 0; i < pdfLines.length; i++) {
      if (normalizeHexText(pdfLines[i], "wilhelm") !== normalizeHexText(epubLines[i], "wilhelm")) {
        prefix = false;
        break;
      }
    }
    if (prefix) return epubLines.join("\n");
  }

  if (status === "pdf_bleed") {
    if (pdfLines.length >= epubLines.length && epubLines.length > 0) {
      let prefix = true;
      for (let i = 0; i < epubLines.length; i++) {
        if (normalizeHexText(pdfLines[i] ?? "", "wilhelm") !== normalizeHexText(epubLines[i], "wilhelm")) {
          prefix = false;
          break;
        }
      }
      if (prefix) return epubLines.join("\n");
    }
    return trimPdfLinesBeforeCommentary(pdfLines, Math.max(1, epubLines.length));
  }

  return pdf;
}

/**
 * @param {Record<number, { judgment?: string; image?: string; lines?: Record<number, string> }>} pdfGold
 * @param {Record<number, { judgment?: string; image?: string; lines?: Record<number, string> }>} epubGold
 */
export function applyWilhelmEpubStatementTrim(pdfGold, epubGold) {
  const out = structuredClone(pdfGold);
  for (let n = 1; n <= 64; n++) {
    const row = out[n];
    const epubRow = epubGold[n];
    if (!row?.lines || !epubRow?.lines) continue;

    for (let p = 1; p <= 6; p++) {
      const pdf = row.lines[p];
      const epub = epubRow.lines?.[p];
      if (!pdf?.trim() || !epub?.trim()) continue;
      const trimmed = trimWilhelmLineWithEpubHint(pdf, epub);
      if (trimmed !== pdf) row.lines[p] = trimmed;
    }
  }
  return out;
}
