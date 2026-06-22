import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { GOLD_DIR } from "./hexagram-fidelity-fetch.mjs";
import { loadPdfManifest, SOURCE_PDF_DIR } from "./pdf-gold-paths.mjs";

export const LEGGE_EPUB_CACHE_DIR = join(GOLD_DIR, "legge-epub-cache");
export const LEGGE_EPUB_TEXT_DIR = join(LEGGE_EPUB_CACHE_DIR, "OEBPS", "Text");
const LEGGE_EPUB_STAMP = join(LEGGE_EPUB_CACHE_DIR, ".epub-stamp.json");

/**
 * @returns {Promise<{ abs: string; entry: Record<string, unknown> }>}
 */
export async function resolveLeggeEpubPath() {
  const manifest = await loadPdfManifest();
  const entry = manifest.sources.legge;
  const epubFile =
    (typeof entry?.fileCrossCheckEpub === "string" && entry.fileCrossCheckEpub) ||
    (entry?.format === "epub" ? entry.file : null);
  if (!epubFile) {
    throw new Error(
      "Legge EPUB cross-check file missing from tools/source-pdfs/manifest.json (fileCrossCheckEpub)",
    );
  }
  const abs = join(SOURCE_PDF_DIR, epubFile);
  try {
    await stat(abs);
  } catch {
    throw new Error(
      `Missing Legge EPUB: ${abs}\nPlace the file locally (gitignored). See manifest.json.`,
    );
  }
  return { abs, entry };
}

async function readStamp() {
  try {
    return JSON.parse(await readFile(LEGGE_EPUB_STAMP, "utf8"));
  } catch {
    return null;
  }
}

function extractEpubArchive(epubPath, destDir) {
  const r = spawnSync("tar", ["-xf", epubPath, "-C", destDir], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(r.stderr?.trim() || `tar extract failed (${r.status})`);
  }
}

/**
 * Extract Legge EPUB XHTML to cache (idempotent; refreshes when EPUB mtime changes).
 * @param {{ force?: boolean }} [opts]
 */
export async function ensureLeggeEpubExtracted(opts = {}) {
  const { abs, entry } = await resolveLeggeEpubPath();
  const epubStat = await stat(abs);
  const stamp = await readStamp();
  const textDirOk =
    !opts.force &&
    stamp?.epubPath === abs &&
    stamp?.mtimeMs === epubStat.mtimeMs &&
    (await stat(join(LEGGE_EPUB_TEXT_DIR, "ic01.xhtml")).catch(() => null));

  if (textDirOk) return { textDir: LEGGE_EPUB_TEXT_DIR, entry };

  await mkdir(LEGGE_EPUB_CACHE_DIR, { recursive: true });
  extractEpubArchive(abs, LEGGE_EPUB_CACHE_DIR);
  await writeFile(
    LEGGE_EPUB_STAMP,
    JSON.stringify(
      {
        epubPath: abs,
        mtimeMs: epubStat.mtimeMs,
        format: entry.format ?? "epub",
        extractedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );
  return { textDir: LEGGE_EPUB_TEXT_DIR, entry };
}

/**
 * @param {number} hex 1..64
 */
export async function readLeggeEpubHexHtml(hex) {
  await ensureLeggeEpubExtracted();
  const name = `ic${String(hex).padStart(2, "0")}.xhtml`;
  return readFile(join(LEGGE_EPUB_TEXT_DIR, name), "utf8");
}

export async function readLeggeEpubSymbolismHtml() {
  await ensureLeggeEpubExtracted();
  const parts = [];
  for (const file of ["icap2-1.xhtml", "icap2-2.xhtml"]) {
    parts.push(await readFile(join(LEGGE_EPUB_TEXT_DIR, file), "utf8"));
  }
  return parts.join("\n");
}
