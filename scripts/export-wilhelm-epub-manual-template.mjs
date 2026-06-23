#!/usr/bin/env node
/**
 * Wilhelm (W) manual EPUB template — VERTICAL layout for Google Sheets.
 * Each hexagram = stacked block: col A campo · col B contenido_epub (2 columns only).
 *
 * Output: reports/wilhelm-epub-manual-template-latest.xlsx
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeGoogleSheetsWorkbook } from "./lib/google-sheets-export.mjs";
import {
  buildWilhelmVerticalBlock,
  WILHELM_MANUAL_FIELDS,
} from "./lib/wilhelm-manual-fields.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "reports");

const SHEET_HEADERS = ["campo", "contenido_epub"];

async function loadWilhelmInjector() {
  const mod = await import(
    pathToFileURL(join(ROOT, "scripts", "iching_wilhelm_translation.mjs")).href
  );
  return mod.default;
}

function instructionRows() {
  return [
    [
      "saltos de linea",
      "contenido_epub",
      "Van DENTRO de la celda B. Una fila A = un solo campo. Nunca pegues seleccionando varias filas.",
      "",
    ],
    [
      "como pegar",
      "contenido_epub",
      "1) Clic en celda B del campo. 2) F2 o doble clic (modo edicion). 3) Pegar. 4) Enter. Asi los saltos no invaden otras filas.",
      "",
    ],
    [
      "formato columna B",
      "contenido_epub",
      "Formato > Texto sin formato. Ajuste de texto > Ajustar (wrap). Columna B ancha.",
      "",
    ],
    [
      "versos oraculo",
      "judgment_oraculo Ln_oraculo yong_oraculo",
      "Un salto de linea entre verso y verso (como el EPUB). Ej: linea1 + Enter + linea2 en la misma celda.",
      "",
    ],
    [
      "comentarios",
      "intro judgment_comentario Ln_comentario",
      "Entre parrafos: linea en blanco (Enter dos veces). Un parrafo = un bloque de prosa del EPUB.",
      "",
    ],
    [
      "fin de hex",
      "hex_fin",
      "Fila hex_fin marca fin del hexagrama. No borrar. Siguiente bloque empieza en hex.",
      "",
    ],
    [
      "navegacion",
      "hex",
      "Ctrl+F campo hex valor 12 para ir al hex 12.",
      "",
    ],
  ];
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const data = await loadWilhelmInjector();

  /** @type {string[][]} */
  const rows = [];
  for (let n = 1; n <= 64; n++) {
    const row = data[String(n)];
    if (!row) throw new Error(`Missing Wilhelm injector hex ${n}`);
    rows.push(...buildWilhelmVerticalBlock(row));
  }

  await mkdir(OUT, { recursive: true });
  const latest = join(OUT, "wilhelm-epub-manual-template-latest.xlsx");
  const dated = join(OUT, `wilhelm-epub-manual-template-${stamp}.xlsx`);

  const workbookSheets = [
    {
      name: "Wilhelm_W",
      headers: SHEET_HEADERS,
      rows,
      columnWidths: [28, 100],
      freezeRows: 1,
      freezeCols: 1,
      wrapTextCols: [1],
    },
    {
      name: "Campos",
      headers: ["orden", "campo", "seccion", "pegar"],
      rows: WILHELM_MANUAL_FIELDS.map((f, i) => [
        String(i + 1),
        f.key,
        f.section,
        f.paste ? "si" : "no",
      ]),
      columnWidths: [8, 28, 14, 8],
      freezeRows: 1,
      freezeCols: 0,
    },
    {
      name: "Instrucciones",
      headers: ["tema", "campo", "instruccion", "notas"],
      rows: instructionRows(),
      columnWidths: [14, 28, 90, 20],
      freezeRows: 1,
      freezeCols: 0,
    },
  ];

  writeGoogleSheetsWorkbook(latest, workbookSheets, "plain");
  writeGoogleSheetsWorkbook(dated, workbookSheets, "plain");

  const fieldsPerHex = WILHELM_MANUAL_FIELDS.length;
  console.log(`Layout: vertical · ${fieldsPerHex} campos × 64 hexagramas (+ separadores)`);
  console.log(`Latest: ${latest}`);
  console.log(`Dated:  ${dated}`);
  console.log("");
  console.log("Google Sheets: Importar. Columna A = campo, columna B = pegar EPUB.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
