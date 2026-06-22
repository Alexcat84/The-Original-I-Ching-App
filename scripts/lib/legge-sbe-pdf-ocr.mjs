/**
 * OCR extraction for the scan-only Legge SBE XVI PDF (Google Books / Oxford).
 * Requires poppler `pdftoppm` and `tesseract` on PATH.
 */

import { readdirSync, unlinkSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { GOLD_DIR } from "./hexagram-fidelity-fetch.mjs";

export const LEGGE_SBE_PAGE_CACHE_DIR = join(GOLD_DIR, "legge-sbe-pages");
export const LEGGE_SBE_TEXT_CACHE = join(GOLD_DIR, "legge-sbe-pdf-full.txt");
export const LEGGE_SBE_SYMBOLISM_CACHE = join(GOLD_DIR, "legge-sbe-symbolism.txt");
export const LEGGE_SBE_STAMP = join(GOLD_DIR, "legge-sbe-ocr-stamp.json");

const DEFAULT_DPI = 300;
const DEFAULT_PSM = "6";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(r.stderr?.trim() || `${cmd} failed (${r.status})`);
  }
  return r.stdout ?? "";
}

export function hasLeggeOcrTools() {
  const ppm = spawnSync("pdftoppm", ["-v"], { encoding: "utf8" });
  const tess = spawnSync("tesseract", ["--version"], { encoding: "utf8" });
  return (
    (ppm.status === 0 || /pdftoppm/i.test(ppm.stderr ?? "")) &&
    (tess.status === 0 || /tesseract/i.test(tess.stdout ?? ""))
  );
}

/**
 * @param {string} pdfPath
 * @param {number} page 1-based PDF page index
 * @param {{ dpi?: number; psm?: string }} [opts]
 */
export async function ocrLeggePdfPageAsync(pdfPath, page, opts = {}) {
  const dpi = opts.dpi ?? DEFAULT_DPI;
  const psm = opts.psm ?? DEFAULT_PSM;
  const prefix = join(tmpdir(), `legge-sbe-p${page}-${Date.now()}`);
  run("pdftoppm", [
    "-f",
    String(page),
    "-l",
    String(page),
    "-png",
    "-r",
    String(dpi),
    pdfPath,
    prefix,
  ]);
  const dir = tmpdir();
  const base = baseName(prefix);
  const files = await readdir(dir);
  const pngName = files.find((f) => f.startsWith(base) && f.endsWith(".png"));
  if (!pngName) {
    throw new Error(`pdftoppm produced no PNG for page ${page} (prefix ${prefix})`);
  }
  const pngPath = join(dir, pngName);
  const text = run("tesseract", [pngPath, "stdout", "-l", "eng", "--psm", psm]);
  await unlink(pngPath).catch(() => {});
  return text.replace(/\f/g, "\n").trim();
}

function baseName(p) {
  const parts = p.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? p;
}

/** Sync wrapper for calibration probes. */
export function ocrLeggePdfPage(pdfPath, page, opts = {}) {
  const dpi = opts.dpi ?? DEFAULT_DPI;
  const psm = opts.psm ?? DEFAULT_PSM;
  const prefix = join(tmpdir(), `legge-sbe-p${page}-${Date.now()}`);
  run("pdftoppm", [
    "-f",
    String(page),
    "-l",
    String(page),
    "-png",
    "-r",
    String(dpi),
    pdfPath,
    prefix,
  ]);
  const dir = tmpdir();
  const base = baseName(prefix);
  const pngName = readdirSync(dir).find((f) => f.startsWith(base) && f.endsWith(".png"));
  if (!pngName) throw new Error(`pdftoppm produced no PNG for page ${page}`);
  const pngPath = join(dir, pngName);
  const text = run("tesseract", [pngPath, "stdout", "-l", "eng", "--psm", psm]);
  try {
    unlinkSync(pngPath);
  } catch {
    /* ignore */
  }
  return text.replace(/\f/g, "\n").trim();
}

/**
 * @param {string} pdfPath
 * @param {number} fromPage
 * @param {number} toPage
 * @param {{ force?: boolean; onPage?: (page: number, total: number) => void }} [opts]
 */
export async function ocrLeggePdfRange(pdfPath, fromPage, toPage, opts = {}) {
  await mkdir(LEGGE_SBE_PAGE_CACHE_DIR, { recursive: true });
  const chunks = [];
  const total = toPage - fromPage + 1;
  let i = 0;
  for (let page = fromPage; page <= toPage; page++) {
    i += 1;
    opts.onPage?.(page, total);
    const cachePath = join(LEGGE_SBE_PAGE_CACHE_DIR, `page-${String(page).padStart(4, "0")}.txt`);
    if (!opts.force) {
      try {
        const st = await stat(cachePath);
        if (st.size > 20) {
          chunks.push(await readFile(cachePath, "utf8"));
          continue;
        }
      } catch {
        /* cache miss */
      }
    }
    const text = await ocrLeggePdfPageAsync(pdfPath, page);
    await writeFile(cachePath, text, "utf8");
    chunks.push(text);
  }
  return chunks.join("\n\n");
}

/**
 * Locate first PDF page with Section I hex 1 (Khien) body text.
 * @param {string} pdfPath
 */
export function findLeggeBodyStartPage(pdfPath) {
  for (let page = 70; page <= 100; page++) {
    const text = ocrLeggePdfPage(pdfPath, page, { dpi: 200 });
    if (/Khien\s+\(represents\)/i.test(text)) return page;
    if (/Explanation of the entire figure by king Wan/i.test(text) && /dragon lying hid/i.test(text)) {
      return page;
    }
  }
  return 86;
}

/**
 * Locate Appendix II Section I (Great Symbolism) start page.
 * @param {string} pdfPath
 */
export function findLeggeSymbolismStartPage(pdfPath) {
  for (let page = 280; page <= 310; page++) {
    const text = ocrLeggePdfPage(pdfPath, page, { dpi: 200 });
    if (/Symbolism of the Hexagrams/i.test(text) && /ceaseless activity/i.test(text)) {
      return page;
    }
    if (/APPENDIX II/i.test(text) && /Heaven, in its motion/i.test(text)) {
      return page;
    }
  }
  return 296;
}

/**
 * @param {string} pdfPath
 */
export async function countCachedLeggePages() {
  try {
    const files = await readdir(LEGGE_SBE_PAGE_CACHE_DIR);
    return files.filter((f) => f.startsWith("page-") && f.endsWith(".txt")).length;
  } catch {
    return 0;
  }
}
