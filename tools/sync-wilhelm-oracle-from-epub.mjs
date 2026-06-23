#!/usr/bin/env node
/**
 * Sync Wilhelm/Baynes oracle fields in iching_wilhelm_translation.mjs from local EPUB gold.
 * EPUB-primary: the Princeton Bollingen EPUB (digital text) is the source of truth for
 * judgment / image (大象) / lines / yong, replacing the OCR PDF and the Parma mirror.
 *
 * Only oracle fields are overwritten; structural metadata (binary, trigrams, pinyin,
 * trad_chinese, english, wilhelm_symbolic, hex_font, …) is preserved verbatim.
 *
 * Usage:
 *   npm run extract:gold:wilhelm-epub   # refresh cache (optional)
 *   npm run sync:wilhelm-oracle-from-epub
 *   npm run build:data
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseAllWilhelmEpubOrThrow } from "../scripts/lib/hexagram-fidelity-wilhelm-epub.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const wilhelmOut = join(root, "scripts", "iching_wilhelm_translation.mjs");

function cleanOracleText(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const existingRaw = await readFile(wilhelmOut, "utf8");
  const existingMatch = existingRaw.match(/export default (\{[\s\S]*\});?\s*$/);
  if (!existingMatch) throw new Error("Could not parse existing Wilhelm dataset");
  const existing = JSON.parse(existingMatch[1]);

  console.log("Parsing Wilhelm/Baynes EPUB gold (Bollingen 2011)…");
  const gold = await parseAllWilhelmEpubOrThrow();
  const issues = [];
  const keptFromBundle = [];

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const row = existing[key];
    const ep = gold[n];
    if (!row) throw new Error(`Existing Wilhelm dataset missing hex ${n}`);
    if (!ep) throw new Error(`Wilhelm EPUB gold missing hex ${n}`);

    const judgment = cleanOracleText(ep.judgment);
    const image = cleanOracleText(ep.image);
    row.wilhelm_judgment = { text: judgment };
    row.wilhelm_image = { text: image };
    if (!judgment) issues.push({ n, why: "empty judgment" });
    if (!image) issues.push({ n, why: "empty image" });

    const prevLines = row.wilhelm_lines ?? {};
    const lines = {};
    for (let pos = 1; pos <= 6; pos++) {
      const epLine = cleanOracleText(ep.lines?.[pos] ?? "");
      const prevText = cleanOracleText(prevLines[String(pos)]?.text ?? "");
      const text = epLine || prevText;
      lines[String(pos)] = { text };
      if (!epLine && prevText) keptFromBundle.push({ n, field: `L${pos}` });
      if (!text) issues.push({ n, pos, why: "empty line" });
    }
    row.wilhelm_lines = lines;

    if (n === 1 && ep.yongJiu) row.yong_jiu = cleanOracleText(ep.yongJiu);
    if (n === 2 && ep.yongLiu) row.yong_liu = cleanOracleText(ep.yongLiu);

    const filled = Object.values(lines).filter((l) => l.text.length > 0).length;
    console.log(
      `  Hex ${String(n).padStart(2, "0")}: J=${judgment.length}ch img=${image.length}ch lines=${filled}/6`,
    );
  }

  const body =
    "// Oracle text synced from local Wilhelm/Baynes EPUB (Princeton Bollingen, 2011).\n" +
    "// EPUB-primary gold: judgment, image (大象), lines, yong. Structural metadata preserved.\n" +
    "// Translator: Richard Wilhelm / Cary F. Baynes. Public domain (1950 ed.).\n\n" +
    "export default " +
    JSON.stringify(existing, null, 2) +
    ";\n";
  await writeFile(wilhelmOut, body, "utf8");
  console.log(`\nWrote ${wilhelmOut}`);

  if (keptFromBundle.length) {
    console.warn(`\nKept ${keptFromBundle.length} line(s) from prior bundle (EPUB empty):`);
    for (const it of keptFromBundle.slice(0, 20)) console.warn("  ", it);
  }
  if (issues.length) {
    console.warn(`\nFinished with ${issues.length} empty fields:`);
    for (const it of issues.slice(0, 20)) console.warn("  ", it);
    process.exitCode = 1;
  } else {
    console.log("\nAll 64 hexagrams synced from EPUB.");
  }
}

await main();
