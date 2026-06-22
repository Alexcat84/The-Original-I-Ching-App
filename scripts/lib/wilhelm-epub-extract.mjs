import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { GOLD_DIR } from "./hexagram-fidelity-fetch.mjs";
import { loadPdfManifest, SOURCE_PDF_DIR } from "./pdf-gold-paths.mjs";

export const WILHELM_EPUB_CACHE_DIR = join(GOLD_DIR, "wilhelm-epub-cache");
const WILHELM_EPUB_STAMP = join(WILHELM_EPUB_CACHE_DIR, ".epub-stamp.json");
const TOC_FILE = "CR!Z53M38XGA51SF48XKKYF2HEE384J_split_002.html";

/** @type {Map<number, string> | null} */
let hexFileMapCache = null;

/**
 * @returns {Promise<{ abs: string; entry: Record<string, unknown> }>}
 */
export async function resolveWilhelmEpubPath() {
  const manifest = await loadPdfManifest();
  const entry = manifest.sources.wilhelm;
  const epubFile = entry?.fileCrossCheckEpub;
  if (typeof epubFile !== "string" || !epubFile.trim()) {
    throw new Error(
      "Wilhelm EPUB cross-check file missing from tools/source-pdfs/manifest.json (fileCrossCheckEpub)",
    );
  }
  const abs = join(SOURCE_PDF_DIR, epubFile);
  try {
    await stat(abs);
  } catch {
    throw new Error(`Missing Wilhelm EPUB: ${abs}\nPlace the file locally (gitignored).`);
  }
  return { abs, entry };
}

async function readStamp() {
  try {
    return JSON.parse(await readFile(WILHELM_EPUB_STAMP, "utf8"));
  } catch {
    return null;
  }
}

function extractEpubArchive(epubPath, destDir) {
  const r = spawnSync("tar", ["-xf", epubPath, "-C", destDir], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(r.stderr?.trim() || `tar extract failed (${r.status})`);
  }
}

/**
 * @param {{ force?: boolean }} [opts]
 */
export async function ensureWilhelmEpubExtracted(opts = {}) {
  const { abs, entry } = await resolveWilhelmEpubPath();
  const epubStat = await stat(abs);
  const stamp = await readStamp();
  const tocOk =
    !opts.force &&
    stamp?.epubPath === abs &&
    stamp?.mtimeMs === epubStat.mtimeMs &&
    (await stat(join(WILHELM_EPUB_CACHE_DIR, TOC_FILE)).catch(() => null));

  if (tocOk) return { cacheDir: WILHELM_EPUB_CACHE_DIR, entry };

  await mkdir(WILHELM_EPUB_CACHE_DIR, { recursive: true });
  extractEpubArchive(abs, WILHELM_EPUB_CACHE_DIR);
  hexFileMapCache = null;
  await writeFile(
    WILHELM_EPUB_STAMP,
    JSON.stringify(
      {
        epubPath: abs,
        mtimeMs: epubStat.mtimeMs,
        extractedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );
  return { cacheDir: WILHELM_EPUB_CACHE_DIR, entry };
}

/**
 * Book I hex → split HTML filename from contents page.
 * @returns {Promise<Map<number, string>>}
 */
export async function buildWilhelmEpubHexFileMap() {
  if (hexFileMapCache) return hexFileMapCache;
  await ensureWilhelmEpubExtracted();
  const toc = await readFile(join(WILHELM_EPUB_CACHE_DIR, TOC_FILE), "utf8");
  const startMark = toc.indexOf('id="filepos3636"');
  const endMark = toc.indexOf('id="filepos17386"');
  const slice =
    startMark >= 0 && endMark > startMark ? toc.slice(startMark, endMark) : toc;
  /** @type {Map<number, string>} */
  const map = new Map();
  const re = /href="(CR[^"]*split_\d+\.html)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(slice)) !== null) {
    const inner = m[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const hexMatch = inner.match(/^(\d{1,2})\./);
    if (!hexMatch) continue;
    const hex = parseInt(hexMatch[1], 10);
    if (hex < 1 || hex > 64) continue;
    const fileName = decodeURIComponent(m[1].replace(/^.*\//, ""));
    map.set(hex, fileName);
  }
  if (map.size !== 64) {
    const missing = [];
    for (let n = 1; n <= 64; n++) {
      if (!map.has(n)) missing.push(n);
    }
    throw new Error(`Wilhelm EPUB TOC: ${map.size}/64 hex files; missing: ${missing.join(", ")}`);
  }
  hexFileMapCache = map;
  return map;
}

/**
 * @param {number} hex 1..64
 */
export async function readWilhelmEpubHexHtml(hex) {
  const map = await buildWilhelmEpubHexFileMap();
  const fileName = map.get(hex);
  if (!fileName) throw new Error(`Wilhelm EPUB: no file for hex ${hex}`);
  return readFile(join(WILHELM_EPUB_CACHE_DIR, fileName), "utf8");
}
