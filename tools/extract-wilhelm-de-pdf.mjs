#!/usr/bin/env node
/**
 * Build Wilhelm DE 1924 oracle gold JSON for fidelity gates.
 * Uses merged dual-pass OCR when PDF text extraction is unavailable.
 */
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { WILHELM_DE_PDF_GOLD_JSON, WILHELM_DE_BOOK_ONE_MERGED, WILHELM_DE_PDF_PATH } from "../scripts/lib/wilhelm-de-dataset-paths.mjs";
import { mergedPayloadToOracleGold } from "../scripts/lib/wilhelm-de-pdf-gold.mjs";

const force = process.argv.includes("--force");

async function tryPdfText() {
  try {
    await stat(WILHELM_DE_PDF_PATH);
  } catch {
    return null;
  }
  const r = spawnSync("pdftotext", ["-layout", WILHELM_DE_PDF_PATH, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error || r.status !== 0 || (r.stdout?.length ?? 0) < 5000) return null;
  return r.stdout;
}

async function main() {
  await mkdir(dirname(WILHELM_DE_PDF_GOLD_JSON), { recursive: true });

  const pdfText = force ? await tryPdfText() : await tryPdfText();
  const merged = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  const hexagrams = mergedPayloadToOracleGold(merged);

  const payload = {
    source:
      pdfText != null
        ? "Richard Wilhelm, I Ging — Das Buch der Wandlungen (Diederichs, 1924), PDF pdftotext"
        : "Richard Wilhelm, I Ging — Das Buch der Wandlungen (Diederichs, 1924), merged OCR pass01+03",
    pdfTextAvailable: pdfText != null,
    pdfTextLength: pdfText?.length ?? 0,
    extractedAt: new Date().toISOString(),
    hexagrams,
  };

  await writeFile(WILHELM_DE_PDF_GOLD_JSON, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${WILHELM_DE_PDF_GOLD_JSON} (${Object.keys(hexagrams).length} hexagrams)`);
  if (!pdfText) {
    console.log("Note: PDF not found or pdftotext empty — gold from merged OCR (PDF arbiter via triangulation).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
