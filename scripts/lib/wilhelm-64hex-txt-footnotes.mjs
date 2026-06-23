/**
 * Strip Princeton Wilhelm TXT footnote markers glued to words/headers.
 * Does not alter legitimate numbers (e.g. "Ten years", "hexagram 3").
 */

const SECTION_HEADER_RE = /^THE (JUDGMENT|IMAGE|LINES)(\d+)\s*$/i;
const LABEL_FOOTNOTE_RE = /\d+(?= means:\s*$)/;
/** 1–2 digits glued after letter/comma/quote before . , ] or EOL */
const INLINE_FOOTNOTE_RE = /(?<=[\p{L},"])[\d]{1,2}(?=[\]\.,]|$)/gu;
/** Footnote digits after comma before whitespace (e.g. opposite,1 for) */
const COMMA_FOOTNOTE_RE = /(?<=[,])[\d]{1,2}(?=\s)/gu;
/** Footnote digits after closing quote before whitespace (e.g. heaven."3 For) */
const QUOTE_FOOTNOTE_RE = /(?<=["])[\d]{1,2}(?=\s)/gu;
/** Digit+period footnote suffix (e.g. group.1) */
const PERIOD_DIGIT_FOOTNOTE_RE = /\.[\d]{1,2}(?=\s|$)/g;
/** 1–2 digits glued after a letter before whitespace (e.g. Furthering2) */
const MIDWORD_FOOTNOTE_RE = /(?<=[\p{L}])[\d]{1,2}(?=\s)/gu;

/**
 * @param {string} line
 */
export function stripWilhelmTxtFootnoteLine(line) {
  let s = String(line ?? "");
  s = s.replace(SECTION_HEADER_RE, "THE $1");
  s = s.replace(LABEL_FOOTNOTE_RE, "");
  s = s.replace(INLINE_FOOTNOTE_RE, "");
  s = s.replace(COMMA_FOOTNOTE_RE, "");
  s = s.replace(QUOTE_FOOTNOTE_RE, "");
  s = s.replace(PERIOD_DIGIT_FOOTNOTE_RE, ".");
  s = s.replace(MIDWORD_FOOTNOTE_RE, "");
  return s;
}

/**
 * @param {string} text
 */
export function stripWilhelmTxtFootnotes(text) {
  return String(text ?? "")
    .split("\n")
    .map((line) => stripWilhelmTxtFootnoteLine(line))
    .join("\n");
}
