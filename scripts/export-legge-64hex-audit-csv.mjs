#!/usr/bin/env node
/**
 * Export parsed Legge 64-hex TXT → CSV for Google Sheets AU.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLeggeVerticalBlock,
  LEGGE_MANUAL_FIELDS,
} from "./lib/legge-manual-fields.mjs";
import { LEGGE_BOOK_ONE_PARSED_JSON } from "./lib/legge-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARSED_JSON = LEGGE_BOOK_ONE_PARSED_JSON;
const OUT_DIR = join(ROOT, "reports");

/**
 * @param {string} cell
 */
function csvEscape(cell) {
  const s = String(cell ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * @param {string[]} cells
 */
function csvRow(cells) {
  return cells.map(csvEscape).join(",");
}

function main() {
  const parsed = JSON.parse(readFileSync(PARSED_JSON, "utf8"));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  /** @type {string[][]} */
  const rows = [["campo", "contenido_txt"]];
  for (let n = 1; n <= 64; n++) {
    const fields = parsed.hexagrams[String(n)]?.fields;
    if (!fields) throw new Error(`Missing parsed hex ${n}`);
    rows.push(...buildLeggeVerticalBlock(fields));
  }

  const csv = `\uFEFF${rows.map(csvRow).join("\r\n")}`;
  mkdirSync(OUT_DIR, { recursive: true });
  const latest = join(OUT_DIR, "legge-64hex-txt-audit-latest.csv");
  const dated = join(OUT_DIR, `legge-64hex-txt-audit-${stamp}.csv`);
  writeFileSync(latest, csv, "utf8");
  writeFileSync(dated, csv, "utf8");

  console.log(`Fields per hex: ${LEGGE_MANUAL_FIELDS.length} + hex_fin`);
  console.log(`Latest: ${latest}`);
}

main();
