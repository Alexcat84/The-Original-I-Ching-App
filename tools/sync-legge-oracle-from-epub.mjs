#!/usr/bin/env node
/**
 * Sync Legge oracle fields in iching_legge_translation.mjs from local EPUB gold.
 * Book-primary: EPUB is source of truth (not sacred-texts web mirror).
 *
 * Usage:
 *   node tools/sync-legge-oracle-from-epub.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseAllLeggeEpubOrThrow } from "../scripts/lib/hexagram-fidelity-legge-epub.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const leggeOut = join(root, "scripts", "iching_legge_translation.mjs");
const wilhelmModulePath = join(root, "scripts", "iching_wilhelm_translation.mjs");

const LEGGE_NAMES = {
  1: "Khien",
  2: "Khwan",
  3: "Kun",
  4: "Mang",
  5: "Hsu",
  6: "Sung",
  7: "Sze",
  8: "Pi",
  9: "Hsien Khu",
  10: "Lu",
  11: "Thai",
  12: "Phi",
  13: "Thung Zan",
  14: "Ta Yu",
  15: "Khien",
  16: "Yu",
  17: "Sui",
  18: "Ku",
  19: "Lin",
  20: "Kwan",
  21: "Shih Ho",
  22: "Pi",
  23: "Po",
  24: "Fu",
  25: "Wu Wang",
  26: "Ta Khu",
  27: "I",
  28: "Ta Kwo",
  29: "Khan",
  30: "Li",
  31: "Hsien",
  32: "Hang",
  33: "Tun",
  34: "Ta Chwang",
  35: "Zin",
  36: "Ming I",
  37: "Kia Zan",
  38: "Khwei",
  39: "Kien",
  40: "Kieh",
  41: "Sun",
  42: "I",
  43: "Kwai",
  44: "Kau",
  45: "Tsui",
  46: "Shang",
  47: "Kun",
  48: "King",
  49: "Ko",
  50: "Ting",
  51: "Kan",
  52: "Kan",
  53: "Kien",
  54: "Kwei Mei",
  55: "Fang",
  56: "Lu",
  57: "Sun",
  58: "Tui",
  59: "Hwan",
  60: "Kieh",
  61: "Kung Fu",
  62: "Hsien Kwan",
  63: "Ki Zi",
  64: "Wei Zi",
};

async function main() {
  const wilhelm = (await import(pathToFileURL(wilhelmModulePath).href)).default;
  const existingRaw = await readFile(leggeOut, "utf8");
  const existingMatch = existingRaw.match(/export default (\{[\s\S]*\});?\s*$/);
  const existing = existingMatch ? JSON.parse(existingMatch[1]) : {};

  console.log("Parsing Legge EPUB gold…");
  const gold = await parseAllLeggeEpubOrThrow();
  const dataset = {};
  const issues = [];

  for (let n = 1; n <= 64; n++) {
    const row = gold[n];
    const prev = existing[String(n)] ?? {};
    const lines = {};
    for (let pos = 1; pos <= 6; pos++) {
      const text = String(row.lines?.[pos] ?? "").trim();
      lines[String(pos)] = { text };
      if (!text) issues.push({ n, pos, why: "empty line" });
    }

    dataset[String(n)] = {
      hex: n,
      hex_font: String(prev.hex_font ?? wilhelm[String(n)]?.hex_font ?? "").trim(),
      name: String(prev.name ?? LEGGE_NAMES[n] ?? wilhelm[String(n)]?.english ?? "").trim(),
      legge_judgment: { text: String(row.judgment ?? "").trim() },
      legge_image: { text: String(row.image ?? "").trim() },
      legge_lines: lines,
      ...(n === 1 && row.yongJiu ? { yong_supernumerary: String(row.yongJiu).trim() } : {}),
      ...(n === 2 && row.yongLiu ? { yong_supernumerary: String(row.yongLiu).trim() } : {}),
    };

    if (!dataset[String(n)].legge_judgment.text) issues.push({ n, why: "empty judgment" });
    if (!dataset[String(n)].legge_image.text) issues.push({ n, why: "empty image" });

    console.log(
      `  Hex ${String(n).padStart(2, "0")}: ${dataset[String(n)].name} J=${dataset[String(n)].legge_judgment.text.length}ch`,
    );
  }

  const body =
    "// Oracle text synced from local James Legge EPUB (SBE XVI, 1882).\n" +
    "// Source: tools/source-pdfs/ (book-primary gold). Do not re-ingest from sacred-texts.\n" +
    "// Translator: James Legge. Public domain.\n\n" +
    "export default " +
    JSON.stringify(dataset, null, 2) +
    ";\n";

  await writeFile(leggeOut, body, "utf8");
  console.log(`\nWrote ${leggeOut}`);

  if (issues.length) {
    console.warn(`\nFinished with ${issues.length} empty fields:`);
    for (const it of issues.slice(0, 15)) console.warn("  ", it);
    process.exitCode = 1;
  } else {
    console.log("\nAll 64 hexagrams synced from EPUB.");
  }
}

await main();
