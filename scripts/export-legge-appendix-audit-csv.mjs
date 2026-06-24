#!/usr/bin/env node
/**
 * Export parsed Legge appendix TXT → CSV for Google Sheets AU (full text).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLeggeAppendixSectionExportRows,
  buildLeggeAppendixSymbolismExportRows,
  LEGGE_APPENDIX_SECTION_FIELDS,
  LEGGE_APPENDIX_SYMBOLISM_FIELDS,
} from "./lib/legge-appendix-manual-fields.mjs";
import { LEGGE_APPENDIX_PARSED_JSON } from "./lib/legge-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARSED_JSON = LEGGE_APPENDIX_PARSED_JSON;
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
 * @param {string[][]} bodyRows
 * @param {string} latestName
 * @param {string} datedPrefix
 */
function writeCsv(bodyRows, latestName, datedPrefix) {
  const csv = `\uFEFF${[["campo", "contenido_txt"], ...bodyRows].map(csvRow).join("\r\n")}`;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  writeFileSync(join(OUT_DIR, latestName), csv, "utf8");
  writeFileSync(join(OUT_DIR, `${datedPrefix}-${stamp}.csv`), csv, "utf8");
}

function main() {
  const parsed = JSON.parse(readFileSync(PARSED_JSON, "utf8"));

  const sectionRows = buildLeggeAppendixSectionExportRows(parsed);
  const symbolismRows = buildLeggeAppendixSymbolismExportRows(parsed);

  mkdirSync(OUT_DIR, { recursive: true });

  writeCsv(
    sectionRows,
    "legge-appendix-sections-audit-latest.csv",
    "legge-appendix-sections-audit",
  );
  writeCsv(
    symbolismRows,
    "legge-appendix-symbolism-audit-latest.csv",
    "legge-appendix-symbolism-audit",
  );

  const sectionBlocks = sectionRows.filter((r) => r[0] === "block_fin").length;
  const symbolismBlocks = symbolismRows.filter((r) => r[0] === "hex_fin").length;

  console.log(
    `Sections: ${sectionBlocks} blocks × ${LEGGE_APPENDIX_SECTION_FIELDS.length + 1} rows → legge-appendix-sections-audit-latest.csv`,
  );
  console.log(
    `Symbolism: ${symbolismBlocks} hex × ${LEGGE_APPENDIX_SYMBOLISM_FIELDS.length + 1} rows → legge-appendix-symbolism-audit-latest.csv`,
  );
}

main();
