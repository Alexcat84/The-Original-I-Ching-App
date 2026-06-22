import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { GOLD_DIR } from "./hexagram-fidelity-fetch.mjs";
import { resolvePdfPath } from "./pdf-gold-paths.mjs";

export const WILHELM_PDF_TEXT_CACHE = join(GOLD_DIR, "wilhelm-pdf-full.txt");

function pdftotextPages(pdfPath, from, to) {
  const args = ["-layout"];
  if (from != null) args.push("-f", String(from));
  if (to != null) args.push("-l", String(to));
  args.push(pdfPath, "-");
  const r = spawnSync("pdftotext", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(r.stderr?.trim() || `pdftotext failed (${r.status})`);
  }
  return r.stdout ?? "";
}

/** Locate first PDF page containing hex 1 body (skip front matter / TOC). */
export function findWilhelmBodyStartPage(pdfPath) {
  for (let page = 8; page <= 40; page++) {
    const text = pdftotextPages(pdfPath, page, page);
    if (/THE CREATIVE works sublime success/i.test(text)) return page;
    if (/\n\s*1\.\s+CH.?IEN\s+—\s+THE CREATIVE/i.test(text)) return page;
  }
  return 13;
}

/**
 * @param {{ force?: boolean; startPage?: number }} [opts]
 */
export async function loadWilhelmPdfFullText(opts = {}) {
  await mkdir(dirname(WILHELM_PDF_TEXT_CACHE), { recursive: true });
  if (!opts.force) {
    try {
      const st = await stat(WILHELM_PDF_TEXT_CACHE);
      if (st.size > 50_000) {
        return readFile(WILHELM_PDF_TEXT_CACHE, "utf8");
      }
    } catch {
      /* cache miss */
    }
  }

  const { abs } = await resolvePdfPath("wilhelm");
  const startPage = opts.startPage ?? findWilhelmBodyStartPage(abs);
  const text = pdftotextPages(abs, startPage, null);
  await writeFile(WILHELM_PDF_TEXT_CACHE, text, "utf8");
  return text;
}
