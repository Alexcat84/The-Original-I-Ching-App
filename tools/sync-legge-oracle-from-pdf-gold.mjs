#!/usr/bin/env node
/**
 * Sync Legge oracle fields from SBE XVI Oxford PDF gold (book-primary).
 *
 * Source chain: Oxford scan OCR → photo-verified book-primary patches.
 * EPUB is diagnostic only (audit:legge-pdf-vs-epub) — not used in sync.
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
import { fieldLooksLeggeOcrJunk } from "../scripts/lib/hexagram-fidelity-legge-sbe-ocr.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const leggeOut = join(root, "scripts", "iching_legge_translation.mjs");
const wilhelmModulePath = join(root, "scripts", "iching_wilhelm_translation.mjs");
const goldCachePath = join(GOLD_DIR, "legge-sbe-pdf-gold.json");

function fieldUsable(text, { line = false, judgment = false } = {}) {
  const t = String(text ?? "").trim();
  const minLen = line ? 18 : judgment ? 20 : 24;
  if (!t || t.length < minLen) return false;
  if (fieldLooksLeggeOcrJunk(t)) return false;
  if (
    /THE Y[^\n]{0,20}KING\. TEXT|Explanation of the separate lines|Line \d+ is (?:weak|strong)/i.test(
      t,
    )
  ) {
    return false;
  }
  if (judgment && t.length > 520) return false;
  if (judgment && /\b1\.\s+The first line,/i.test(t)) return false;
  return true;
}

async function main() {
  const wilhelm = (await import(pathToFileURL(wilhelmModulePath).href)).default;
  const existingRaw = await readFile(leggeOut, "utf8");
  const existingMatch = existingRaw.match(/export default (\{[\s\S]*\});?\s*$/);
  const existing = existingMatch ? JSON.parse(existingMatch[1]) : {};

  console.log("Loading Legge SBE PDF gold (OCR + photo-verified book-primary patches)…");
  const gold = await parseAllLeggeSbePdfOrThrow({ force: false, epubGuide: false });

  const dataset = {};
  const issues = [];

  for (let n = 1; n <= 64; n++) {
    const row = gold[n];
    const prev = existing[String(n)] ?? {};
    const lines = {};

    for (let pos = 1; pos <= 6; pos++) {
      const pdfText = String(row.lines?.[pos] ?? "").trim();
      lines[String(pos)] = { text: pdfText };
      if (!fieldUsable(pdfText, { line: true })) {
        issues.push({ n, pos, why: "line unusable or bleed" });
      }
    }

    const judgment = String(row.judgment ?? "").trim();
    const image = String(row.image ?? "").trim();
    const yongPdf = n === 1 ? row.yongJiu : n === 2 ? row.yongLiu : undefined;
    const yongText = String(yongPdf ?? "").trim();

    dataset[String(n)] = {
      hex: n,
      hex_font: String(prev.hex_font ?? wilhelm[String(n)]?.hex_font ?? "").trim(),
      name: String(prev.name ?? "").trim(),
      legge_judgment: { text: judgment },
      legge_image: { text: image },
      legge_lines: lines,
      ...(yongText ? { yong_supernumerary: yongText } : {}),
    };

    if (!fieldUsable(judgment, { judgment: true })) issues.push({ n, why: "judgment unusable or bleed" });
    if (!fieldUsable(image)) issues.push({ n, why: "image unusable or bleed" });
    if ((n === 1 || n === 2) && !yongText) issues.push({ n, why: "empty yong supernumerary" });

    console.log(
      `  Hex ${String(n).padStart(2, "0")}: ${dataset[String(n)].name} J=${judgment.length}ch`,
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

  if (issues.length) {
    console.warn(`\nFinished with ${issues.length} unusable/bleed fields (fix parser or add photo patch):`);
    for (const it of issues.slice(0, 25)) console.warn("  ", it);
    process.exitCode = 1;
  } else {
    console.log("\nAll 64 hexagrams synced from PDF gold.");
  }
}

await main();
