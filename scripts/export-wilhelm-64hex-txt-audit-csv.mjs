#!/usr/bin/env node
/**
 * Export parsed Wilhelm 64-hex TXT → CSV for visual audit in Google Sheets.
 * Layout matches manual template: campo | contenido_txt (vertical, hex_fin separators).
 *
 * Input:  tools/datasets/wilhelm/book-one/wilhelm-64hex-parsed.json
 * Output: reports/wilhelm-64hex-txt-audit-latest.csv
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_HEX_FIN,
  WILHELM_MANUAL_FIELDS,
} from "./lib/wilhelm-manual-fields.mjs";
import { WILHELM_BOOK_ONE_PARSED_JSON } from "./lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARSED_JSON = WILHELM_BOOK_ONE_PARSED_JSON;
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
 * @returns {string[][]}
 */
function buildParsedVerticalBlock(fields) {
  /** @type {string[][]} */
  const out = [];
  for (const field of WILHELM_MANUAL_FIELDS) {
    out.push([field.key, fields[field.key] ?? ""]);
  }
  out.push([WILHELM_HEX_FIN, ""]);
  return out;
}

function main() {
  const parsed = JSON.parse(readFileSync(PARSED_JSON, "utf8"));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  /** @type {string[][]} */
  const rows = [["campo", "contenido_txt"]];

  for (let n = 1; n <= 64; n++) {
    const hex = parsed.hexagrams[String(n)];
    if (!hex?.fields) throw new Error(`Missing parsed hex ${n} in ${PARSED_JSON}`);
    rows.push(...buildParsedVerticalBlock(hex.fields));
  }

  const csvBody = rows.map(csvRow).join("\r\n");
  const csv = `\uFEFF${csvBody}`;

  mkdirSync(OUT_DIR, { recursive: true });
  const latest = join(OUT_DIR, "wilhelm-64hex-txt-audit-latest.csv");
  const dated = join(OUT_DIR, `wilhelm-64hex-txt-audit-${stamp}.csv`);

  writeFileSync(latest, csv, "utf8");
  writeFileSync(dated, csv, "utf8");

  const fieldsPerHex = WILHELM_MANUAL_FIELDS.length;
  console.log(`Parsed source: ${parsed.source ?? PARSED_JSON}`);
  console.log(`Layout: vertical · ${fieldsPerHex} campos × 64 hex (+ hex_fin)`);
  console.log(`Rows: ${rows.length - 1} data + header`);
  console.log(`Latest: ${latest}`);
  console.log(`Dated:  ${dated}`);
  console.log("");
  console.log("Google Sheets: Archivo > Importar > Subir > Separador: Coma");
  console.log("Columna A = campo, B = contenido_txt. Formato B: Texto sin formato + Ajustar.");
}

main();
