/**
 * Ten Wings meta fields anchored to Erstes Buch (book-one merged maestro).
 */
import { readFileSync } from "node:fs";
import { WILHELM_DE_BOOK_ONE_MERGED } from "./wilhelm-de-dataset-paths.mjs";

/** @type {object | null} */
let _bookOneCache = null;

export function loadBookOneMerged() {
  if (!_bookOneCache) {
    _bookOneCache = JSON.parse(readFileSync(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  }
  return _bookOneCache;
}

/**
 * @param {number} hex
 * @param {string} field
 */
export function getBookOneField(hex, field) {
  return String(loadBookOneMerged().hexagrams[String(hex)]?.fields?.[field] ?? "").trim();
}

/**
 * Erstes Buch wins for comments-layer chinese_roman (Drittes header echo).
 * @param {number} hex
 * @param {string} [ocrOrAuValue]
 */
export function resolveCommentsChineseRoman(hex, ocrOrAuValue = "") {
  const book = getBookOneField(hex, "chinese_roman");
  if (book) return book;
  return String(ocrOrAuValue ?? "").trim();
}

/**
 * @param {Record<string, string>} fields
 * @param {number} hex
 */
export function applyErstesChineseRomanToFields(fields, hex) {
  fields.chinese_roman = resolveCommentsChineseRoman(hex, fields.chinese_roman);
  return fields;
}
