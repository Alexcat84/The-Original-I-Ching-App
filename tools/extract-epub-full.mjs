#!/usr/bin/env node
/**
 * Full EPUB extract (oracle + commentary) for Wilhelm and Legge.
 * Uses the same local EPUBs as sync:*-oracle-from-epub (manifest fileCrossCheckEpub).
 *
 * Output:
 *   tools/output/epub-full/wilhelm-full.json
 *   tools/output/epub-full/legge-full.json
 *   tools/output/epub-full/manifest.json
 *
 * Usage:
 *   npm run extract:epub-full
 *   npm run extract:epub-full -- --translator=wilhelm
 *   npm run extract:epub-full -- --translator=legge
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseAllLeggeEpubFullOrThrow } from "../scripts/lib/legge-epub-full.mjs";
import { parseAllWilhelmEpubFullOrThrow } from "../scripts/lib/wilhelm-epub-full.mjs";
import {
  resolveLeggeEpubPath,
} from "../scripts/lib/legge-epub-extract.mjs";
import {
  resolveWilhelmEpubPath,
} from "../scripts/lib/wilhelm-epub-extract.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const OUT_DIR = join(ROOT, "tools/output/epub-full");

function parseArgs(argv) {
  let translator = "both";
  for (const arg of argv) {
    if (arg.startsWith("--translator=")) {
      translator = arg.slice("--translator=".length).trim();
    }
  }
  if (!["both", "wilhelm", "legge"].includes(translator)) {
    throw new Error(`Invalid --translator=${translator} (wilhelm|legge|both)`);
  }
  return { translator };
}

function countWilhelmCommentary(hex) {
  let n = hex.introduction.paragraphs.length;
  n += hex.judgment.commentary.length;
  n += hex.image.commentary.length;
  for (const row of Object.values(hex.lines)) n += row.commentary.length;
  return n;
}

function countLeggeCommentary(hex) {
  return (
    Object.keys(hex.appendix.lineCommentary).length +
    hex.footnotes.length +
    (hex.appendix.image.oracle ? 1 : 0)
  );
}

async function writeWilhelm() {
  const { abs, entry } = await resolveWilhelmEpubPath();
  console.log("Extracting Wilhelm full (oracle + commentary)…");
  const hexagrams = await parseAllWilhelmEpubFullOrThrow();
  const commentaryBlocks = Object.values(hexagrams).reduce((a, h) => a + countWilhelmCommentary(h), 0);
  const payload = {
    schema: "iching-epub-full/v1",
    translator: "wilhelm",
    source: entry.title ?? "The I Ching or Book of Changes",
    epubFile: entry.fileCrossCheckEpub,
    epubPath: abs,
    extractedAt: new Date().toISOString(),
    note: "Oracle fields in oracleSummary match production EPUB-primary sync. Commentary from calibre21/22 paragraphs.",
    stats: {
      hexagrams: 64,
      commentaryParagraphs: commentaryBlocks,
    },
    hexagrams,
  };
  const outPath = join(OUT_DIR, "wilhelm-full.json");
  await writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${outPath} (${commentaryBlocks} commentary paragraphs)`);
  return { outPath, payload };
}

async function writeLegge() {
  const { abs, entry } = await resolveLeggeEpubPath();
  console.log("Extracting Legge full (oracle + appendix commentary + footnotes)…");
  const hexagrams = await parseAllLeggeEpubFullOrThrow();
  const commentaryBlocks = Object.values(hexagrams).reduce((a, h) => a + countLeggeCommentary(h), 0);
  const payload = {
    schema: "iching-epub-full/v1",
    translator: "legge",
    source: entry.title ?? "The Yî King, or Book of Changes",
    epubFile: entry.fileCrossCheckEpub ?? entry.file,
    epubPath: abs,
    extractedAt: new Date().toISOString(),
    note: "Oracle in hex pages; Great Symbolism + Duke line commentary in Appendix II §I; footnotes per hex page.",
    stats: {
      hexagrams: 64,
      commentaryBlocks,
    },
    hexagrams,
  };
  const outPath = join(OUT_DIR, "legge-full.json");
  await writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${outPath} (${commentaryBlocks} commentary blocks)`);
  return { outPath, payload };
}

async function main() {
  const { translator } = parseArgs(process.argv.slice(2));
  await mkdir(OUT_DIR, { recursive: true });

  /** @type {Record<string, unknown>} */
  const manifest = {
    generatedAt: new Date().toISOString(),
    schema: "iching-epub-full/v1",
    outputs: {},
  };

  if (translator === "both" || translator === "wilhelm") {
    const { outPath } = await writeWilhelm();
    manifest.outputs.wilhelm = outPath.replace(/\\/g, "/");
  }
  if (translator === "both" || translator === "legge") {
    const { outPath } = await writeLegge();
    manifest.outputs.legge = outPath.replace(/\\/g, "/");
  }

  const manifestPath = join(OUT_DIR, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Wrote ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
