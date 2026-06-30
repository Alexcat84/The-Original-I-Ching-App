/**
 * Parse Wilhelm DE hex fields using 300 DPI JPG page anchors + pass03 OCR parse.
 */
import {
  parseWilhelmDe64HexTxtFull,
  WILHELM_DE_64HEX_DEFAULT_PATH,
} from "./wilhelm-de-64hex-txt.mjs";
import { buildHexPageRanges, loadHexStartsMap } from "./wilhelm-de-jpg-page-map.mjs";

/**
 * @param {number} hex
 * @param {string} [pass03Path]
 */
export async function parseWilhelmDeHexFromJpgPageMap(hex, pass03Path = WILHELM_DE_64HEX_DEFAULT_PATH) {
  const map = loadHexStartsMap();
  const range = buildHexPageRanges(map).find((r) => r.hex === hex);
  if (!range) throw new Error(`No JPG page range for hex ${hex}`);

  const parsed = await parseWilhelmDe64HexTxtFull(pass03Path, { require64: true });
  const entry = parsed.hexagrams[hex];
  if (!entry?.fields) throw new Error(`hex ${hex} missing in pass03 parse`);

  return {
    hex,
    range,
    bookMeta: {
      chinese: entry.bookChinese,
      title: entry.bookTitle,
    },
    pass03Span: { lineStart: entry.lineStart, lineEnd: entry.lineEnd },
    fields: entry.fields,
    source: `libro-fisico-300dpi:${range.sourceLabel}+pass03-v2`,
  };
}

/**
 * @param {number[]} hexList
 * @param {string} [pass03Path]
 */
export async function parseWilhelmDeHexBatchFromJpgPageMap(hexList, pass03Path) {
  /** @type {Record<string, Awaited<ReturnType<typeof parseWilhelmDeHexFromJpgPageMap>>>} */
  const hexagrams = {};
  for (const hex of hexList) {
    hexagrams[String(hex)] = await parseWilhelmDeHexFromJpgPageMap(hex, pass03Path);
  }
  return hexagrams;
}
