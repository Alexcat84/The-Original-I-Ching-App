#!/usr/bin/env node
/**
 * QA code: AU-FID-W-019 fill-wilhelm-de-comments-au-pilot-hex1 · v1.0.0
 * Area: scripts/fill-wilhelm-de-comments-au-pilot-hex1.mjs
 * Family: FID-W
 */
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAnnaCommentsHexFullVerticalAuTsv,
  tsvEscapeCell,
} from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import {
  classifyAuDisputeResolution,
  normalizeWilhelmDeAuBookText,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { buildHex1JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex1-jpg.mjs";
import { buildWilhelmDeCommentsAnnaCompareRows } from "./lib/wilhelm-de-comments-anna-reconcile.mjs";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./lib/wilhelm-comments-manual-fields.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

async function main() {
  const verified = buildHex1JpgVerifiedFields();
  const pass02 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
  const pass04 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));
  const compare = buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04).filter((r) => r.hex === 1);
  const byField = Object.fromEntries(compare.map((r) => [r.field, r]));

  /** @type {Record<string, string>} */
  const reconciledLike = {};
  /** @type {Record<string, string>} */
  const contenidoPdf = {};
  /** @type {Record<string, string>} */
  const auEstado = {};
  /** @type {Record<string, string>} */
  const resolucion = {};

  for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
    const v = verified[key];
    if (!v) continue;
    reconciledLike[key] = pass02.hexagrams["1"].fields[key] ?? "";
    contenidoPdf[key] = v.contenido_pdf;
    auEstado[key] = v.au_estado;
    const row = byField[key];
    resolucion[key] = classifyAuDisputeResolution(
      row?.pass02 ?? "",
      row?.pass04 ?? "",
      v.contenido_pdf,
      row?.status ?? "both_empty",
    );
  }

  const lines = [
    "campo\tcontenido_reconciliado\tjpg_paginas\tcontenido_pdf\tau_estado\tresolucion_disputa",
  ];
  for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
    lines.push(
      [
        key,
        tsvEscapeCell(reconciledLike[key] ?? ""),
        verified[key]?.jpgPages ?? "316-327",
        tsvEscapeCell(contenidoPdf[key] ?? ""),
        auEstado[key] ?? "pendiente",
        resolucion[key] ?? "na",
      ].join("\t"),
    );
  }
  lines.push("hex_fin\t1\t\t\t\t");

  const pilotPath = join(
    WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
    "wilhelm-de-comments-hex-1-pilot-au.tsv",
  );
  await writeFile(pilotPath, `${lines.join("\n")}\n`, "utf8");

  const disputeRows = compare.filter((r) => r.status !== "identical");
  const disputeLines = [
    "campo\tpass02\tpass04\treconciliado\testado\tjpg_paginas\tcontenido_pdf\tau_estado\tresolucion_disputa",
  ];
  for (const row of disputeRows) {
    const v = verified[row.field];
    disputeLines.push(
      [
        row.field,
        tsvEscapeCell(row.pass02),
        tsvEscapeCell(row.pass04),
        tsvEscapeCell(row.reconciled),
        row.status,
        v?.jpgPages ?? "316-327",
        tsvEscapeCell(v?.contenido_pdf ?? ""),
        v?.au_estado ?? "pendiente",
        resolucion[row.field] ?? "na",
      ].join("\t"),
    );
  }
  disputeLines.push("hex_fin\t1\t\t\t\t316-327\t\t\t");
  const disputesPath = join(
    WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
    "wilhelm-de-comments-hex-01-disputes.tsv",
  );
  await writeFile(disputesPath, `${disputeLines.join("\n")}\n`, "utf8");

  const closed = Object.values(verified).filter(
    (v) => v.au_estado === "cerrado" || v.au_estado === "vacio_en_libro",
  ).length;

  const report = {
    updatedAt: new Date().toISOString(),
    hex: 1,
    jpgPages: "316-327",
    fieldsClosed: closed,
    fieldsTotal: Object.keys(verified).length,
    pilotPath,
    disputesPath,
    disputeResolutions: Object.fromEntries(
      disputeRows.map((r) => [r.field, resolucion[r.field]]),
    ),
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(REPORTS, `wilhelm-de-comments-au-pilot-hex1-fill-${stamp}.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Pilot hex 1 filled: ${closed}/${Object.keys(verified).length} fields closed`);
  console.log(`Pilot TSV: ${pilotPath}`);
  console.log(`Disputes TSV: ${disputesPath}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
