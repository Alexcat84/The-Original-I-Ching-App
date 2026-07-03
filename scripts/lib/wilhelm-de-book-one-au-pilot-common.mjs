/**
 * Shared helpers for Erstes Buch AU pilot (PLAN-DAT-W-03 phase 7).
 */
import { readFileSync } from "node:fs";
import { buildHexPageRanges, loadHexStartsMap } from "./wilhelm-de-jpg-page-map.mjs";
import { WILHELM_DE_BOOK_HEX_STARTS_JSON } from "./wilhelm-de-dataset-paths.mjs";

/** @param {ReturnType<typeof loadHexStartsMap>} map @param {number} hex */
export function jpgPageRangeForBookOneHex(map, hex) {
  const range = buildHexPageRanges(map).find((r) => r.hex === hex);
  if (!range) throw new Error(`No book-one page range for hex ${hex}`);
  return `${range.startBookPage}-${range.endBookPage}`;
}

export function loadBookOneHexStarts() {
  return JSON.parse(readFileSync(WILHELM_DE_BOOK_HEX_STARTS_JSON, "utf8"));
}

/** @param {number} hex @param {string} fieldKey */
export function isYongFieldAbsentInBook(hex, fieldKey) {
  if (hex <= 2) return false;
  return fieldKey.startsWith("yong_");
}
