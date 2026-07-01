#!/usr/bin/env node

/**
 * QA code: VF-FID-W-020 apply-wilhelm-de-manual-gold · v1.0.0
 * Area: scripts/apply-wilhelm-de-manual-gold.mjs
 * Family: FID-W
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_MANUAL_FIELDS } from "./lib/wilhelm-manual-fields.mjs";
import { WILHELM_DE_BOOK_ONE_BLANK } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GOLD_DIR = join(ROOT, "tools/manual-gold");
const PASTE_KEYS = WILHELM_MANUAL_FIELDS.filter((f) => f.paste).map((f) => f.key);
const META_GOLD_KEYS = [
  "nombre",
  "chinese_roman",
  "trigrama_arriba",
  "trigrama_abajo",
];

/**
 * @param {string} tsvPath
 */
async function parseGoldTsv(tsvPath) {
  const raw = await readFile(tsvPath, "utf8");
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of raw.split("\n")) {
    if (!line.trim() || line.startsWith("campo")) continue;
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const key = line.slice(0, tab).trim();
    const rest = line.slice(tab + 1);
    const secondTab = rest.indexOf("\t");
    const valueRaw = (secondTab >= 0 ? rest.slice(0, secondTab) : rest).trim();
    const value = valueRaw.replace(/\\n/g, "\n");
    if (key && key !== "hex_fin") fields[key] = value;
  }
  return fields;
}

async function main() {
  const hexArg = process.argv.find((a) => a.startsWith("--hex="));
  const hexList = hexArg
    ? hexArg.slice(6) === "all"
      ? Array.from({ length: 64 }, (_, i) => i + 1)
      : hexArg
          .slice(6)
          .split(",")
          .map((s) => Number(s.trim()))
    : [1, 2, 8];

  const blank = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_BLANK, "utf8"));
  let applied = 0;

  for (const n of hexList) {
    const tsvPath = join(GOLD_DIR, `wilhelm-de-hex-${n}.tsv`);
    let gold;
    try {
      gold = await parseGoldTsv(tsvPath);
    } catch {
      console.warn(`Skip hex ${n}: missing ${tsvPath}`);
      continue;
    }
    const entry = blank.hexagrams[String(n)];
    if (!entry?.fields) throw new Error(`blank missing hex ${n}`);

    for (const key of PASTE_KEYS) {
      if (Object.prototype.hasOwnProperty.call(gold, key) && gold[key]) {
        entry.fields[key] = gold[key];
        applied++;
      }
    }
    for (const key of META_GOLD_KEYS) {
      if (Object.prototype.hasOwnProperty.call(gold, key) && gold[key]) {
        entry.fields[key] = gold[key];
      }
    }
    if (gold.nombre) entry.bookTitle = gold.nombre;
    if (gold.chinese) entry.bookHanzi = gold.chinese;
    if (gold.hex_font) entry.bookHexFont = gold.hex_font;
  }

  blank.pilotGoldAppliedAt = new Date().toISOString();
  await writeFile(WILHELM_DE_BOOK_ONE_BLANK, `${JSON.stringify(blank, null, 2)}\n`, "utf8");
  console.log(`Applied ${applied} pasteable fields to blank (${hexList.join(", ")})`);
  console.log(`Updated ${WILHELM_DE_BOOK_ONE_BLANK}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
