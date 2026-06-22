#!/usr/bin/env node
/**
 * Extract James Legge oracle gold from local EPUB → JSON cache.
 *
 * Usage:
 *   node tools/extract-legge-epub.mjs [--force]
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, GOLD_DIR } from "../scripts/lib/hexagram-fidelity-fetch.mjs";
import { parseAllLeggeEpubOrThrow } from "../scripts/lib/hexagram-fidelity-legge-epub.mjs";
import { resolveLeggeEpubPath } from "../scripts/lib/legge-epub-extract.mjs";

const outPath = join(GOLD_DIR, "legge-epub-gold.json");

async function main() {
  await mkdir(GOLD_DIR, { recursive: true });
  const { entry } = await resolveLeggeEpubPath();
  console.log("Extracting Legge EPUB gold…");
  const gold = await parseAllLeggeEpubOrThrow();
  const payload = {
    source: `${entry.title ?? "The Yî King"} — James Legge (${entry.year ?? 1882}), local EPUB`,
    file: entry.file,
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
