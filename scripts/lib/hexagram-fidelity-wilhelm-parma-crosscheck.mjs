/**
 * Parma mirror cross-check policy for Wilhelm book-primary closure.
 *
 * IN SCOPE (book oracle only):
 *   - Literal changing-line / judgment / image statements from Pantheon 1950
 *   - Punctuation and typographic signs as printed (commas, periods, line breaks)
 *
 * OUT OF SCOPE (never ingest):
 *   - Wilhelm/Baynes commentary paragraphs after the bold statement
 *
 * Parma role (non-gate):
 *   - Structural hint: where the statement ends and commentary begins
 *   - Detect PDF OCR bleed (PDF longer than statement-only reference)
 *   - NEVER auto-fill from Parma when PDF is shorter — Parma omits lines AND bleeds commentary
 *
 * @see docs/auditorias/20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md
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
import { resolveWilhelmLineForIngest } from "./hexagram-fidelity-wilhelm-baynes-supplement.mjs";

/** Parma lines confirmed to include Wilhelm commentary bleed (book photos / audit). */
export const WILHELM_PARMA_KNOWN_LINE_BLEED = new Set([
  "32:2", // Remorse disappears. + full commentary paragraph (Pantheon pp. 135–138 photos)
]);

/** Parma judgments with known commentary bleed in mirror HTML. */
export const WILHELM_PARMA_KNOWN_JUDGMENT_BLEED = new Set(["27", "62"]);

/**
 * @param {number} hex
 * @param {number} [linePos]
 */
export function isWilhelmParmaKnownLineBleed(hex, linePos) {
  if (linePos == null) return false;
  return WILHELM_PARMA_KNOWN_LINE_BLEED.has(`${hex}:${linePos}`);
}

/**
 * Classify PDF vs Parma line cross-check (Parma is hint, not authority).
 * @returns {"strict_match"|"pdf_bleed"|"pdf_truncated"|"parma_suspect_pdf_shorter"|"wording"}
 */
export function classifyWilhelmPdfParmaLine(pdf, parma, hex, linePos) {
  const a = normalizeHexText(pdf, "wilhelm");
  const e = normalizeHexText(parma, "wilhelm");
  if (!a && !e) return "strict_match";
  if (textsMatchStrict(pdf, parma, "wilhelm")) return "strict_match";
  if (detectWilhelmLineBleed(pdf, parma)) {
    // Parma prefix but PDF may include additional oracle verses Parma omits — not commentary bleed.
    const pdfLines = String(pdf).split("\n").map((l) => l.trim()).filter(Boolean);
    const parmaLines = String(parma).split("\n").map((l) => l.trim()).filter(Boolean);
    if (pdfLines.length > parmaLines.length) {
      const extra = pdfLines.slice(parmaLines.length);
      if (extra.every((l) => !lineFollowsWilhelmOracleStanza(l) && !isWilhelmLineCommentaryLine(l, parmaLines.length))) {
        return "pdf_truncated";
      }
    }
    return "pdf_bleed";
  }
  if (detectWilhelmLineBleed(parma, pdf)) {
    if (isWilhelmParmaKnownLineBleed(hex, linePos)) return "parma_suspect_pdf_shorter";
    return "pdf_truncated";
  }
  return "wording";
}

/**
 * Trim PDF line text using Parma statement-only hint (cross-check, not production gold).
 * @param {string} pdfLine
 * @param {string} parmaLine
 * @param {number} hex
 * @param {number} pos
 */
export function trimWilhelmLineWithParmaHint(pdfLine, parmaLine, hex, pos) {
  const pdf = String(pdfLine ?? "").trim();
  const parma = String(parmaLine ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  if (!pdf || !parma) return pdf;
  if (isWilhelmParmaKnownLineBleed(hex, pos)) return pdf;

  const status = classifyWilhelmPdfParmaLine(pdf, parma, hex, pos);
  const pdfLines = pdf.split("\n").map((l) => l.trim()).filter(Boolean);
  const parmaLines = parma.split("\n").map((l) => l.trim()).filter(Boolean);

  if (pdfLines.length >= parmaLines.length && parmaLines.length > 0) {
    let allMatch = true;
    for (let i = 0; i < parmaLines.length; i++) {
      if (normalizeHexText(pdfLines[i] ?? "") !== normalizeHexText(parmaLines[i])) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) return parmaLines.join("\n");
  }

  const pn = normalizeHexText(parma);
  const an = normalizeHexText(pdf);
  if (status === "pdf_bleed" && an.startsWith(pn) && pn.length >= 16 && pn.length / an.length >= 0.45) {
    if (pdfLines.length >= parmaLines.length + 2) {
      const extra = pdfLines.slice(parmaLines.length);
      if (
        extra.some((l, i) =>
          lineFollowsWilhelmOracleStanza(l) || isWilhelmLineCommentaryLine(l, parmaLines.length + i),
        )
      ) {
        return trimPdfLinesBeforeCommentary(pdfLines, parmaLines.length);
      }
      return pdf;
    }
    return parmaLines.join("\n");
  }

  return trimInlineBleedUsingParmaLastLine(pdf, parma);
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
 * @param {string} pdf
 * @param {string} parma
 */
function trimInlineBleedUsingParmaLastLine(pdf, parma) {
  const pdfLines = pdf.split("\n").map((l) => l.trim()).filter(Boolean);
  const parmaLines = parma.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!parmaLines.length || !pdfLines.length) return pdf;

  const lastP = parmaLines[parmaLines.length - 1];
  const idx = Math.min(pdfLines.length, parmaLines.length) - 1;
  const lastD = pdfLines[idx];
  const np = normalizeHexText(lastP);
  const nd = normalizeHexText(lastD);
  if (nd.startsWith(np) && nd.length > np.length + 12) {
    const out = pdfLines.slice(0, idx);
    out.push(lastP);
    return out.join("\n");
  }
  return pdf;
}

/**
 * Apply Parma statement trim across parsed PDF gold (mutates copy).
 * @param {Record<number, { lines?: Record<number, string> }>} pdfGold
 * @param {Record<number, { lines?: Record<number, string> }>} parmaGold
 */
export function applyWilhelmParmaStatementTrim(pdfGold, parmaGold) {
  const out = structuredClone(pdfGold);
  for (let n = 1; n <= 64; n++) {
    const row = out[n];
    if (!row?.lines) continue;
    for (let p = 1; p <= 6; p++) {
      const pdf = row.lines[p];
      if (!pdf?.trim()) continue;
      const parma = resolveWilhelmLineForIngest(n, p, parmaGold[n]?.lines?.[p] ?? "", "");
      if (!parma.trim()) continue;
      const trimmed = trimWilhelmLineWithParmaHint(pdf, parma, n, p);
      if (trimmed !== pdf) row.lines[p] = trimmed;
    }
  }
  return out;
}
