#!/usr/bin/env node

/**
 * QA code: AU-FID-W-011 export-wilhelm-de-64hex-audit-csv · v1.0.0
 * Area: scripts/export-wilhelm-de-64hex-audit-csv.mjs
 * Family: FID-W
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_HEX_FIN, WILHELM_MANUAL_FIELDS } from "./lib/wilhelm-manual-fields.mjs";
import { WILHELM_DE_BOOK_ONE_BLANK } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
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

/**
 * @param {Record<string, string>} fields
 */
function buildVerticalBlock(fields) {
  /** @type {string[][]} */
  const out = [];
  for (const field of WILHELM_MANUAL_FIELDS) {
    out.push([field.key, fields[field.key] ?? ""]);
  }
  out.push([WILHELM_HEX_FIN, ""]);
  return out;
}

function main() {
  const parsed = JSON.parse(readFileSync(WILHELM_DE_BOOK_ONE_BLANK, "utf8"));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  /** @type {string[][]} */
  const rows = [["campo", "contenido_txt"]];
  for (let n = 1; n <= 64; n++) {
    const hex = parsed.hexagrams[String(n)];
    if (!hex?.fields) throw new Error(`Missing blank hex ${n}`);
    rows.push(...buildVerticalBlock(hex.fields));
  }

  const csvBody = rows.map(csvRow).join("\r\n");
  const csv = `\uFEFF${csvBody}`;

  mkdirSync(OUT_DIR, { recursive: true });
  const latest = join(OUT_DIR, "wilhelm-de-64hex-audit-blank-latest.csv");
  const dated = join(OUT_DIR, `wilhelm-de-64hex-audit-blank-${stamp}.csv`);

  writeFileSync(latest, csv, "utf8");
  writeFileSync(dated, csv, "utf8");

  console.log(`Source: ${WILHELM_DE_BOOK_ONE_BLANK} (status=${parsed.status})`);
  console.log(`Layout: vertical · ${WILHELM_MANUAL_FIELDS.length} campos × 64 hex (+ hex_fin)`);
  console.log(`Latest: ${latest}`);
  console.log(`Dated:  ${dated}`);
}

main();
