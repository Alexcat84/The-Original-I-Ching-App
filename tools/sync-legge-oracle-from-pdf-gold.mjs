#!/usr/bin/env node
/**
 * Sync Legge oracle fields from SBE XVI Oxford PDF gold (book-primary).
 *
 * Source chain: OCR scan → EPUB repair-only (truncated/corrupt) → book-primary patches.
 * Does NOT blind-sync from sacred-texts web or raw EPUB.
 *
 * Usage:
 *   npm run extract:gold:legge-sbe-pdf
 *   npm run sync:legge-oracle-from-pdf-gold
 *   npm run build:data
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { GOLD_DIR } from "../scripts/lib/hexagram-fidelity-fetch.mjs";
import { parseAllLeggeSbePdfOrThrow } from "../scripts/lib/hexagram-fidelity-legge-sbe-pdf.mjs";
import {
  fieldLooksCorrupt,
  fieldLooksTruncated,
} from "../scripts/lib/hexagram-fidelity-legge-sbe-epub-guide.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const leggeOut = join(root, "scripts", "iching_legge_translation.mjs");
const wilhelmModulePath = join(root, "scripts", "iching_wilhelm_translation.mjs");
const goldCachePath = join(GOLD_DIR, "legge-sbe-pdf-gold.json");

function fieldUsable(text) {
  const t = String(text ?? "").trim();
  if (!t) return false;
  if (fieldLooksCorrupt(t)) return false;
  if (fieldLooksTruncated(t)) return false;
  return true;
}

async function main() {
  const wilhelm = (await import(pathToFileURL(wilhelmModulePath).href)).default;
  const existingRaw = await readFile(leggeOut, "utf8");
  const existingMatch = existingRaw.match(/export default (\{[\s\S]*\});?\s*$/);
  const existing = existingMatch ? JSON.parse(existingMatch[1]) : {};

  console.log("Loading Legge SBE PDF gold (OCR + repair-only EPUB + book-primary patches)…");
  const gold = await parseAllLeggeSbePdfOrThrow({ force: false, epubGuide: true });

  const dataset = {};
  const issues = [];
  const keptFromBundle = [];

  for (let n = 1; n <= 64; n++) {
    const row = gold[n];
    const prev = existing[String(n)] ?? {};
    const lines = {};

    for (let pos = 1; pos <= 6; pos++) {
      const pdfText = String(row.lines?.[pos] ?? "").trim();
      const prevText = String(prev.legge_lines?.[String(pos)]?.text ?? "").trim();
      if (fieldUsable(pdfText)) {
        lines[String(pos)] = { text: pdfText };
      } else if (fieldUsable(prevText)) {
        lines[String(pos)] = { text: prevText };
        keptFromBundle.push({ n, pos, why: "pdf line unusable" });
      } else {
        lines[String(pos)] = { text: pdfText || prevText };
        if (!lines[String(pos)].text) issues.push({ n, pos, why: "empty line" });
      }
    }

    const pickField = (pdfVal, prevVal, field) => {
      const pdfText = String(pdfVal ?? "").trim();
      const prevText = String(prevVal ?? "").trim();
      if (fieldUsable(pdfText)) return pdfText;
      if (fieldUsable(prevText)) {
        keptFromBundle.push({ n, field, why: "pdf field unusable" });
        return prevText;
      }
      return pdfText || prevText;
    };

    const yongPdf =
      n === 1 ? row.yongJiu : n === 2 ? row.yongLiu : undefined;
    const yongPrev = String(prev.yong_supernumerary ?? "").trim();
    let yongText = "";
    if (n === 1 || n === 2) {
      yongText = pickField(yongPdf, yongPrev, "yong");
      if (!yongText) issues.push({ n, why: "empty yong supernumerary" });
    }

    dataset[String(n)] = {
      hex: n,
      hex_font: String(prev.hex_font ?? wilhelm[String(n)]?.hex_font ?? "").trim(),
      name: String(prev.name ?? "").trim(),
      legge_judgment: { text: pickField(row.judgment, prev.legge_judgment?.text, "judgment") },
      legge_image: { text: pickField(row.image, prev.legge_image?.text, "image") },
      legge_lines: lines,
      ...(yongText ? { yong_supernumerary: yongText } : {}),
    };

    if (!dataset[String(n)].legge_judgment.text) issues.push({ n, why: "empty judgment" });
    if (!dataset[String(n)].legge_image.text) issues.push({ n, why: "empty image" });

    console.log(
      `  Hex ${String(n).padStart(2, "0")}: ${dataset[String(n)].name} J=${dataset[String(n)].legge_judgment.text.length}ch`,
    );
  }

  const body =
    "// Oracle text synced from James Legge SBE XVI Oxford scan (book-primary gold).\n" +
    "// Source: tools/output/fidelity-gold/legge-sbe-pdf-gold.json\n" +
    `// Synced: ${new Date().toISOString()}\n` +
    "// Translator: James Legge. Public domain.\n\n" +
    "export default " +
    JSON.stringify(dataset, null, 2) +
    ";\n";

  await writeFile(leggeOut, body, "utf8");
  console.log(`\nWrote ${leggeOut}`);

  try {
    const cache = JSON.parse(await readFile(goldCachePath, "utf8"));
    cache.syncedToBundleAt = new Date().toISOString();
    await writeFile(goldCachePath, JSON.stringify(cache, null, 2), "utf8");
  } catch {
    // cache optional
  }

  if (keptFromBundle.length) {
    console.warn(`\nKept ${keptFromBundle.length} fields from previous bundle (PDF still broken after repair):`);
    for (const it of keptFromBundle.slice(0, 20)) console.warn("  ", it);
  }

  if (issues.length) {
    console.warn(`\nFinished with ${issues.length} empty/unresolved fields:`);
    for (const it of issues.slice(0, 15)) console.warn("  ", it);
    process.exitCode = 1;
  } else {
    console.log("\nAll 64 hexagrams synced from PDF gold.");
  }
}

await main();
