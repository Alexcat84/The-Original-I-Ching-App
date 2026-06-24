#!/usr/bin/env node
/**
 * Google Sheets manual verification workbook.
 * Col E (1_dataset_nuestro) = runtime bundle text (fixed).
 * Col F (2_epub_pegado)     = empty — paste literal EPUB text from your viewer.
 * Col G (verificacion_auto) = IF(EXACT(E,F)) → OK / FAIL (updates on paste).
 *
 * Wilhelm (W) + Legge (L) · 514 rows each · 1028 total.
 *
 * Usage:
 *   npm run export:manual-review
 *   Google Sheets → File → Import → Upload → dataset-manual-review-latest.xlsx
 *   (or drag the .xlsx into Google Drive → Open with Google Sheets)
 *
 * Output: reports/dataset-manual-review-latest.xlsx
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBundle } from "./lib/hexagram-fidelity-fetch.mjs";
import { writeGoogleSheetsWorkbook } from "./lib/google-sheets-export.mjs";
import {
  fieldKeyString,
  runtimeHexToReviewRows,
} from "./lib/runtime-dataset-fields.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT = join(ROOT, "reports");

/** @type {const} */
const HEADERS = [
  "hex",
  "traductor",
  "field_key",
  "field_label",
  "1_dataset_nuestro",
  "2_epub_pegado",
  "verificacion_auto",
];

/**
 * @param {"W"|"L"} traductor
 * @param {Awaited<ReturnType<typeof loadBundle>>} bundle
 * @returns {string[][]}
 */
function buildPlainRows(traductor, bundle) {
  /** @type {string[][]} */
  const rows = [];
  for (const hex of bundle.hexagrams) {
    for (const row of runtimeHexToReviewRows(hex)) {
      rows.push([
        String(hex.number),
        traductor,
        fieldKeyString(row.field, row.linePos),
        row.label,
        row.text,
        "",
      ]);
    }
  }
  return rows;
}

/**
 * @param {string[][]} rows
 */
function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const ha = Number(a[0]);
    const hb = Number(b[0]);
    if (ha !== hb) return ha - hb;
    if (a[1] !== b[1]) return String(a[1]).localeCompare(String(b[1]));
    const order = { Juicio: 1, Imagen: 2, "用九": 9, "用六": 9 };
    const la = String(a[3]);
    const lb = String(b[3]);
    if (la.startsWith("Línea") && lb.startsWith("Línea")) {
      return Number(la.replace(/\D/g, "")) - Number(lb.replace(/\D/g, ""));
    }
    return (order[la] ?? 50) - (order[lb] ?? 50);
  });
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  console.log("Loading runtime bundles (Wilhelm + Legge)…");
  const [wBundle, lBundle] = await Promise.all([
    loadBundle("wilhelm"),
    loadBundle("legge"),
  ]);

  const wRows = buildPlainRows("W", wBundle);
  const lRows = buildPlainRows("L", lBundle);
  const allRows = sortRows([...wRows, ...lRows]);

  await mkdir(OUT, { recursive: true });
  const latest = join(OUT, "dataset-manual-review-latest.xlsx");
  const dated = join(OUT, `dataset-manual-review-${stamp}.xlsx`);

  writeGoogleSheetsWorkbook(latest, [
    { name: "ManualReview", headers: HEADERS, rows: allRows },
    { name: "Wilhelm", headers: HEADERS, rows: wRows },
    { name: "Legge", headers: HEADERS, rows: lRows },
  ]);
  writeGoogleSheetsWorkbook(dated, [
    { name: "ManualReview", headers: HEADERS, rows: allRows },
    { name: "Wilhelm", headers: HEADERS, rows: wRows },
    { name: "Legge", headers: HEADERS, rows: lRows },
  ]);

  console.log(`Rows: ${allRows.length} (${wRows.length} W + ${lRows.length} L)`);
  console.log(`Latest: ${latest}`);
  console.log(`Dated:  ${dated}`);
  console.log("");
  console.log("Google Sheets: File → Import → Upload → selecciona el .xlsx");
  console.log("Pega EPUB en columna F · verificacion_auto (G) muestra OK/FAIL al instante.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
