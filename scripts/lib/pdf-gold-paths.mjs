import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./hexagram-fidelity-fetch.mjs";

export const SOURCE_PDF_DIR = join(ROOT, "tools", "source-pdfs");
export const MANIFEST_PATH = join(SOURCE_PDF_DIR, "manifest.json");

/** @typedef {{ file: string; title: string; role: string; [key: string]: unknown }} PdfSourceEntry */

/**
 * @returns {Promise<{ version: number; sources: Record<string, PdfSourceEntry> }>}
 */
export async function loadPdfManifest() {
  const raw = await readFile(MANIFEST_PATH, "utf8");
  return JSON.parse(raw);
}

/**
 * @param {string} translatorKey wilhelm | legge | zhouyi
 */
export async function resolvePdfPath(translatorKey) {
  const manifest = await loadPdfManifest();
  const entry = manifest.sources[translatorKey];
  if (!entry?.file) {
    throw new Error(`Unknown PDF source key: ${translatorKey}`);
  }
  const abs = join(SOURCE_PDF_DIR, entry.file);
  try {
    await stat(abs);
  } catch {
    throw new Error(
      `Missing PDF for ${translatorKey}: ${abs}\n` +
        "Place the file locally (gitignored). See tools/source-pdfs/manifest.json.",
    );
  }
  return { abs, entry };
}
