#!/usr/bin/env node
/**
 * Extract Wilhelm/Baynes Book I oracle gold from local Bollingen EPUB → JSON cache.
 *
 * Usage:
 *   node tools/extract-wilhelm-epub.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { GOLD_DIR } from "../scripts/lib/hexagram-fidelity-fetch.mjs";
import { parseAllWilhelmEpubOrThrow } from "../scripts/lib/hexagram-fidelity-wilhelm-epub.mjs";
import { resolveWilhelmEpubPath } from "../scripts/lib/wilhelm-epub-extract.mjs";

const outPath = join(GOLD_DIR, "wilhelm-epub-gold.json");

async function main() {
  await mkdir(GOLD_DIR, { recursive: true });
  const { entry } = await resolveWilhelmEpubPath();
  console.log("Extracting Wilhelm EPUB gold (Book I oracle fields)…");
  const gold = await parseAllWilhelmEpubOrThrow();
  const payload = {
    source: `${entry.title ?? "The I Ching or Book of Changes"} — Wilhelm/Baynes (EPUB cross-check)`,
    file: entry.fileCrossCheckEpub,
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
