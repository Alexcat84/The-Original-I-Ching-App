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

/** @type {ReadonlyArray<{ segment: string; start: number; end: number }>} */
export const WILHELM_DE_JPG_BOOK_SEGMENTS = [
  { segment: "1-100", start: 1, end: 100 },
  { segment: "101-200", start: 101, end: 200 },
  { segment: "201-300", start: 201, end: 300 },
  { segment: "301-400", start: 301, end: 400 },
  { segment: "401-500", start: 401, end: 500 },
  { segment: "501-585", start: 501, end: 585 },
];

export const WILHELM_DE_JPG_MAX_BOOK_PAGE = 585;

/**
 * @param {{ segment: string; page: number }} ref
 */
export function segmentRefToBookPage(ref) {
  const p = Number(ref.page);
  const hit = WILHELM_DE_JPG_BOOK_SEGMENTS.find((s) => s.segment === ref.segment);
  if (!hit) throw new Error(`Unknown segment ${ref.segment}`);
  if (p < 1 || p > hit.end - hit.start + 1) {
    throw new Error(`Page ${p} out of range for segment ${ref.segment}`);
  }
  return hit.start + p - 1;
}

/**
 * @param {number} bookPage
 */
export function bookPageToSegmentRef(bookPage) {
  const p = Number(bookPage);
  if (!Number.isFinite(p) || p < 1 || p > WILHELM_DE_JPG_MAX_BOOK_PAGE) {
    throw new Error(`Book page out of range: ${bookPage}`);
  }
  const hit = WILHELM_DE_JPG_BOOK_SEGMENTS.find((s) => p >= s.start && p <= s.end);
  if (!hit) throw new Error(`No segment for book page ${bookPage}`);
  return { segment: hit.segment, page: p - hit.start + 1 };
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
