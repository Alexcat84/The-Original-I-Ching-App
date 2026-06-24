/**
 * Shared Wilhelm Princeton TXT cleanup: typography + footnote digit strip.
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripWilhelmTxtFootnotes } from "./wilhelm-64hex-txt-footnotes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const WILHELM_64HEX_TXT_PATH = join(
  ROOT,
  "tools/source-pdfs/I Ching or Book of Changes (Bollingen Series), The - Wilhelm, Hellmut-64hex.txt",
);

export const WILHELM_64HEX_COMMENTS_TXT_PATH = join(
  ROOT,
  "tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-comments 64 hex.txt",
);

export const WILHELM_APPENDIX_TXT_PATH = join(
  ROOT,
  "tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-Appendix.txt",
);

/**
 * @param {string} text
 */
export function normalizeWilhelmTypography(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u2019/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2014/g, "—");
}

/**
 * @param {string} text
 */
export function cleanWilhelmTxtText(text) {
  return stripWilhelmTxtFootnotes(normalizeWilhelmTypography(text));
}
