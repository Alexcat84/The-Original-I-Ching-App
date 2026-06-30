/**
 * AU export helpers — Wilhelm DE Anna comments disputes (vertical TSV for Sheets).
 * contenido_pdf + au_estado=cerrado|vacio_en_libro = única autoridad para promote.
 */
import { WILHELM_COMMENTS_HEX_FIN, WILHELM_COMMENTS_MANUAL_FIELDS } from "./wilhelm-comments-manual-fields.mjs";
import { buildWilhelmDeCommentsAnnaCompareRows } from "./wilhelm-de-comments-anna-reconcile.mjs";

/** @param {string} cell */
export function tsvEscapeCell(cell) {
  return String(cell ?? "")
    .replace(/\t/g, " ")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Rows needing AU review: disputed + single-pass-only fields.
 * @param {object} pass02
 * @param {object} pass04
 */
export function buildAnnaCommentsAuDisputeRows(pass02, pass04) {
  return buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04).filter(
    (row) => row.status !== "identical",
  );
}

/**
 * @param {Array<{ hex: number; field: string; pass02: string; pass04: string; reconciled: string; pickReason?: string; status: string }>} disputeRows
 * @param {Record<number, string>} [jpgPagesByHex]
 */
export function buildAnnaCommentsDisputesFlatTsv(disputeRows, jpgPagesByHex = {}) {
  const lines = [
    [
      "hex",
      "campo",
      "estado",
      "pass02",
      "pass04",
      "reconciliado",
      "razon_pick",
      "jpg_paginas",
      "contenido_pdf",
      "au_estado",
      "resolucion_disputa",
    ].join("\t"),
  ];

  for (const row of disputeRows) {
    lines.push(
      [
        row.hex,
        row.field,
        row.status,
        tsvEscapeCell(row.pass02),
        tsvEscapeCell(row.pass04),
        tsvEscapeCell(row.reconciled),
        tsvEscapeCell(row.pickReason ?? ""),
        jpgPagesByHex[row.hex] ?? "",
        "",
        "pendiente",
        "",
      ].join("\t"),
    );
  }

  return `${lines.join("\n")}\n`;
}

/**
 * Vertical block for one hex — disputed fields only, PDF column empty for AU.
 * @param {number} hex
 * @param {Array<{ field: string; pass02: string; pass04: string; reconciled: string; status: string; pickReason?: string }>} rowsForHex
 * @param {string} [jpgPages]
 */
export function buildAnnaCommentsHexDisputesVerticalTsv(hex, rowsForHex, jpgPages = "") {
  const lines = [
    "campo\tpass02\tpass04\treconciliado\testado\tjpg_paginas\tcontenido_pdf\tau_estado\tresolucion_disputa",
  ];
  for (const row of rowsForHex) {
    lines.push(
      [
        row.field,
        tsvEscapeCell(row.pass02),
        tsvEscapeCell(row.pass04),
        tsvEscapeCell(row.reconciled),
        row.status,
        jpgPages,
        "",
        "pendiente",
        "",
      ].join("\t"),
    );
  }
  lines.push(`${WILHELM_COMMENTS_HEX_FIN}\t${hex}\t\t\t\t\t\t\t`);
  return `${lines.join("\n")}\n`;
}

/**
 * Full hex vertical from reconciled maestro (pilot AU — all 37 fields).
 * @param {number} hex
 * @param {Record<string, string>} fields
 * @param {string} [jpgPages]
 */
export function buildAnnaCommentsHexFullVerticalAuTsv(hex, fields, jpgPages = "") {
  const lines = [
    "campo\tcontenido_reconciliado\tjpg_paginas\tcontenido_pdf\tau_estado\tresolucion_disputa",
  ];
  for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
    lines.push(
      [key, tsvEscapeCell(fields[key]), jpgPages, "", "pendiente", ""].join("\t"),
    );
  }
  lines.push(`${WILHELM_COMMENTS_HEX_FIN}\t${hex}\t\t\t\t`);
  return `${lines.join("\n")}\n`;
}

/**
 * @param {Array<{ hex: number }>} disputeRows
 */
export function uniqueDisputeHexes(disputeRows) {
  return [...new Set(disputeRows.map((r) => r.hex))].sort((a, b) => a - b);
}
