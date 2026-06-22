import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { loadPdfManifest, resolvePdfPath } from "./pdf-gold-paths.mjs";
import {
  LEGGE_SBE_STAMP,
  LEGGE_SBE_SYMBOLISM_CACHE,
  LEGGE_SBE_TEXT_CACHE,
  findLeggeBodyStartPage,
  findLeggeSymbolismStartPage,
  hasLeggeOcrTools,
  ocrLeggePdfRange,
} from "./legge-sbe-pdf-ocr.mjs";
import {
  joinLeggeOcrHyphenation,
  repairLeggeSbeOcrText,
} from "./hexagram-fidelity-legge-sbe-ocr.mjs";

async function readStamp() {
  try {
    return JSON.parse(await readFile(LEGGE_SBE_STAMP, "utf8"));
  } catch {
    return null;
  }
}

/**
 * @returns {Promise<{ abs: string; entry: Record<string, unknown> }>}
 */
export async function resolveLeggeSbePdfPath() {
  const manifest = await loadPdfManifest();
  const entry = manifest.sources.legge;
  if (!entry?.file) {
    throw new Error("Legge source missing from tools/source-pdfs/manifest.json");
  }
  return resolvePdfPath("legge");
}

/**
 * @param {{ force?: boolean; onProgress?: (msg: string) => void }} [opts]
 */
export async function loadLeggeSbePdfFullText(opts = {}) {
  if (!hasLeggeOcrTools()) {
    throw new Error(
      "Legge SBE PDF OCR requires pdftoppm and tesseract on PATH (poppler + Tesseract).",
    );
  }

  await mkdir(dirname(LEGGE_SBE_TEXT_CACHE), { recursive: true });
  const { abs, entry } = await resolveLeggeSbePdfPath();
  const pdfStat = await stat(abs);
  const stamp = await readStamp();

  const bodyStart =
    Number(entry.ocrBodyStartPage) || findLeggeBodyStartPage(abs);
  const textEnd = Number(entry.ocrTextEndPage) || 240;
  const symbolismStart =
    Number(entry.ocrSymbolismStartPage) || findLeggeSymbolismStartPage(abs);
  const symbolismEnd = Number(entry.ocrSymbolismEndPage) || 420;

  const stampOk =
    !opts.force &&
    stamp?.pdfPath === abs &&
    stamp?.mtimeMs === pdfStat.mtimeMs &&
    stamp?.bodyStart === bodyStart &&
    stamp?.textEnd === textEnd;

  if (stampOk) {
    try {
      const bodySt = await stat(LEGGE_SBE_TEXT_CACHE);
      const symSt = await stat(LEGGE_SBE_SYMBOLISM_CACHE);
      if (bodySt.size > 20_000 && symSt.size > 5_000) {
        return {
          bodyText: repairLeggeSbeOcrText(
            joinLeggeOcrHyphenation(await readFile(LEGGE_SBE_TEXT_CACHE, "utf8")),
          ),
          symbolismText: repairLeggeSbeOcrText(
            joinLeggeOcrHyphenation(await readFile(LEGGE_SBE_SYMBOLISM_CACHE, "utf8")),
          ),
          bodyStart,
          symbolismStart,
        };
      }
    } catch {
      /* cache miss */
    }
  }

  const log = opts.onProgress ?? (() => {});
  log(`OCR Legge SBE text pp.${bodyStart}-${textEnd}…`);
  const rawBody = await ocrLeggePdfRange(abs, bodyStart, textEnd, {
    force: opts.force,
    onPage: (page, total) => {
      if (page === bodyStart || page % 10 === 0 || page === textEnd) {
        log(`  text OCR ${page - bodyStart + 1}/${total} (p.${page})`);
      }
    },
  });
  log(`OCR Legge SBE symbolism pp.${symbolismStart}-${symbolismEnd}…`);
  const rawSym = await ocrLeggePdfRange(abs, symbolismStart, symbolismEnd, {
    force: opts.force,
    onPage: (page, total) => {
      if (page === symbolismStart || page % 20 === 0 || page === symbolismEnd) {
        log(`  symbolism OCR ${page - symbolismStart + 1}/${total} (p.${page})`);
      }
    },
  });

  const bodyText = repairLeggeSbeOcrText(joinLeggeOcrHyphenation(rawBody));
  const symbolismText = repairLeggeSbeOcrText(joinLeggeOcrHyphenation(rawSym));
  await writeFile(LEGGE_SBE_TEXT_CACHE, bodyText, "utf8");
  await writeFile(LEGGE_SBE_SYMBOLISM_CACHE, symbolismText, "utf8");
  await writeFile(
    LEGGE_SBE_STAMP,
    JSON.stringify(
      {
        pdfPath: abs,
        mtimeMs: pdfStat.mtimeMs,
        bodyStart,
        textEnd,
        symbolismStart,
        symbolismEnd,
        extractedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );

  return { bodyText, symbolismText, bodyStart, symbolismStart };
}
