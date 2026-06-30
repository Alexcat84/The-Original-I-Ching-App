/**
 * Wilhelm DE 300 DPI JPG page map (printed book page anchors).
 * JPG filename page N ≠ pass03 scan page N — text comes from pass03 hex parse.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_DE_STITCHED } from "./wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const WILHELM_DE_JPG_DIR = join(ROOT, "tools/source-pdfs/source jpgs");
export const WILHELM_DE_HEX_STARTS_JSON = join(
  ROOT,
  "tools/datasets/wilhelm-de/wilhelm-de-book-hex-starts.json",
);

/** @typedef {{ hex: number; segment: string; page: number }} HexStartRef */
/** @typedef {{ hex: number; startBookPage: number; endBookPage: number; jpgPaths: string[]; sourceLabel: string }} HexPageRange */

/**
 * @param {{ segment: string; page: number }} ref
 */
export function segmentRefToBookPage(ref) {
  const p = Number(ref.page);
  if (ref.segment === "1-100") return p;
  if (ref.segment === "101-200") return 100 + p;
  if (ref.segment === "201-300") return 200 + p;
  throw new Error(`Unknown segment ${ref.segment}`);
}

/**
 * @param {number} bookPage
 */
export function bookPageToSegmentRef(bookPage) {
  if (bookPage <= 100) return { segment: "1-100", page: bookPage };
  if (bookPage <= 200) return { segment: "101-200", page: bookPage - 100 };
  return { segment: "201-300", page: bookPage - 200 };
}

let _jpgCache = null;

function listJpgs() {
  if (!_jpgCache) {
    _jpgCache = readdirSync(WILHELM_DE_JPG_DIR).filter((n) => /\.jpe?g$/i.test(n));
  }
  return _jpgCache;
}

/**
 * @param {{ segment: string; page: number }} ref
 */
export function resolveJpgPath(ref) {
  const pad = String(ref.page).padStart(3, "0");
  const needle = `${ref.segment}-page-${pad}.jpg`;
  const hit = listJpgs().find((name) => name.includes(needle));
  if (!hit) {
    throw new Error(`JPG not found for ${ref.segment} page ${ref.page} (${needle})`);
  }
  return join(WILHELM_DE_JPG_DIR, hit);
}

/**
 * @param {number} startBookPage
 * @param {number} endBookPage
 */
export function listJpgPathsForBookPageRange(startBookPage, endBookPage) {
  /** @type {string[]} */
  const paths = [];
  for (let p = startBookPage; p <= endBookPage; p++) {
    paths.push(resolveJpgPath(bookPageToSegmentRef(p)));
  }
  return paths;
}

export function loadHexStartsMap() {
  return JSON.parse(readFileSync(WILHELM_DE_HEX_STARTS_JSON, "utf8"));
}

/**
 * @param {ReturnType<typeof loadHexStartsMap>} map
 */
export function buildHexPageRanges(map) {
  /** @type {HexPageRange[]} */
  const ranges = [];
  const starts = [...map.starts].sort((a, b) => a.hex - b.hex);
  const end64 = segmentRefToBookPage(map.hex64End);

  for (let i = 0; i < starts.length; i++) {
    const cur = starts[i];
    const startBookPage = segmentRefToBookPage(cur);
    const next = starts[i + 1];
    const endBookPage = next
      ? segmentRefToBookPage(next) - 1
      : cur.hex === 64
        ? end64
        : end64;
    const jpgPaths = listJpgPathsForBookPageRange(startBookPage, endBookPage);
    ranges.push({
      hex: cur.hex,
      startBookPage,
      endBookPage,
      jpgPaths,
      sourceLabel: `jpg-pages:${startBookPage}-${endBookPage}`,
    });
  }
  return ranges;
}

/**
 * @param {string} rawText
 */
export function buildPass03PageIndex(rawText) {
  const lines = String(rawText ?? "").replace(/\r\n/g, "\n").split("\n");
  /** @type {Map<number, number>} */
  const pageStartLine = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^--- page (\d+) ---$/);
    if (m) pageStartLine.set(Number(m[1]), i);
  }
  return { lines, pageStartLine };
}

/**
 * @param {string} rawText
 * @param {number} startBookPage
 * @param {number} endBookPage
 */
export function slicePass03ByBookPages(rawText, startBookPage, endBookPage) {
  const { lines, pageStartLine } = buildPass03PageIndex(rawText);
  const startLine = pageStartLine.get(startBookPage);
  if (startLine == null) {
    throw new Error(`pass03 missing page marker ${startBookPage}`);
  }
  let endLine = lines.length;
  for (let p = endBookPage + 1; p <= endBookPage + 10; p++) {
    if (pageStartLine.has(p)) {
      endLine = pageStartLine.get(p);
      break;
    }
  }
  return lines.slice(startLine, endLine);
}

/**
 * @param {number} hex
 * @param {string} [pass03Path]
 */
export function extractPass03LinesForHex(hex, pass03Path = WILHELM_DE_STITCHED.bookOnePass03) {
  const map = loadHexStartsMap();
  const range = buildHexPageRanges(map).find((r) => r.hex === hex);
  if (!range) throw new Error(`No page range for hex ${hex}`);
  const raw = readFileSync(pass03Path, "utf8");
  const blockLines = slicePass03ByBookPages(raw, range.startBookPage, range.endBookPage);
  return { range, blockLines };
}
