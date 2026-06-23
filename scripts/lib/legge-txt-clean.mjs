/**
 * James Legge SBE XVI — Princeton/user TXT paths and typography cleanup.
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const LEGGE_64HEX_TXT_PATH = join(
  ROOT,
  "tools/source-pdfs/Yi King - James Legge-64hex.txt",
);

export const LEGGE_APPENDIX_TXT_PATH = join(
  ROOT,
  "tools/source-pdfs/Yi King - James Legge-Appendix.txt",
);

/** @type {RegExp} */
export const LEGGE_TXT_SEPARATOR_RE = /^\*\s*\*\s*\*$/;

/**
 * @param {string} text
 */
export function normalizeLeggeTypography(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u0103/g, "ă")
    .replace(/\u0102/g, "Ă")
    .replace(/\u00e2/g, "â")
    .replace(/\u00c2/g, "Â")
    .replace(/\u00ee/g, "î")
    .replace(/\u00ce/g, "Î")
    .replace(/\u00fb/g, "û")
    .replace(/\u00db/g, "Û")
    .replace(/\u2019/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2014/g, "—");
}

/**
 * Compact whitespace for library render (limited vertical space).
 * @param {string} text
 * @param {{ footnotes?: boolean }} [opts]
 */
export function compactLeggeTxtWhitespace(text, opts = {}) {
  let s = normalizeLeggeTypography(text)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (opts.footnotes) {
    // Footnotes: no blank lines between entries (Princeton TXT often has 3–6 \n).
    s = s.replace(/\n{2,}/g, "\n");
  } else {
    // Body: at most one blank line between paragraphs.
    s = s.replace(/\n{3,}/g, "\n\n");
  }

  return s;
}

/**
 * @param {string} text
 */
export function cleanLeggeTxtText(text) {
  return compactLeggeTxtWhitespace(text);
}

/**
 * @param {string} text
 */
export function cleanLeggeTxtFootnotes(text) {
  return compactLeggeTxtWhitespace(text, { footnotes: true });
}

/**
 * Title-case Legge book header (ALL CAPS) → running-text Wade-Giles romanization.
 * Preserves diacritics present in the Princeton header (Â, Ă, Î, Û, Ü, Ž…).
 * @param {string} bookTitle
 */
export function leggeBookTitleToChineseRoman(bookTitle) {
  return String(bookTitle ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
