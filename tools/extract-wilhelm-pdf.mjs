#!/usr/bin/env node
/**
 * Extract Wilhelm/Baynes oracle gold from local PDF → JSON cache.
 *
 * Usage:
 *   node tools/extract-wilhelm-pdf.mjs [--force]
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, GOLD_DIR } from "../scripts/lib/hexagram-fidelity-fetch.mjs";
import { loadWilhelmPdfFullText } from "../scripts/lib/pdf-text-extract.mjs";
import { parseAllWilhelmPdfOrThrow } from "../scripts/lib/hexagram-fidelity-wilhelm-pdf.mjs";
import { applyWilhelmPdfPrintVerified } from "../scripts/lib/hexagram-fidelity-wilhelm-pdf-verified.mjs";
import { WILHELM_BAYNES_1950_CITATION } from "../scripts/lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs";

const force = process.argv.includes("--force");
const outPath = join(GOLD_DIR, "wilhelm-pdf-gold.json");

async function main() {
  await mkdir(GOLD_DIR, { recursive: true });
  console.log("Extracting Wilhelm PDF text…");
  const text = await loadWilhelmPdfFullText({ force });
  console.log(`  ${text.length} chars cached`);

  const gold = applyWilhelmPdfPrintVerified(parseAllWilhelmPdfOrThrow(text));
  const payload = {
    source: WILHELM_BAYNES_1950_CITATION,
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
