#!/usr/bin/env node
/**
 * Extract James Legge oracle gold from local SBE XVI scan (OCR) → JSON cache.
 *
 * Usage:
 *   node tools/extract-legge-sbe-pdf.mjs [--force]
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, GOLD_DIR } from "../scripts/lib/hexagram-fidelity-fetch.mjs";
import { parseAllLeggeSbePdfOrThrow } from "../scripts/lib/hexagram-fidelity-legge-sbe-pdf.mjs";
import { resolveLeggeSbePdfPath } from "../scripts/lib/legge-sbe-pdf-text-extract.mjs";

const outPath = join(GOLD_DIR, "legge-sbe-pdf-gold.json");
const force = process.argv.includes("--force");

async function main() {
  await mkdir(GOLD_DIR, { recursive: true });
  const { entry } = await resolveLeggeSbePdfPath();
  console.log("Extracting Legge SBE PDF gold (OCR)…");
  const gold = await parseAllLeggeSbePdfOrThrow({
    force,
    onProgress: (msg) => console.log(msg),
  });
  const payload = {
    source: `${entry.title ?? "The Yî King"} — James Legge (${entry.year ?? 1882}), SBE XVI Oxford scan + OCR`,
    file: entry.file,
    format: entry.format ?? "pdf-ocr",
    extractedAt: new Date().toISOString(),
    hexagrams: gold,
  };
  await writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${outPath} (64 hexagrams)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
