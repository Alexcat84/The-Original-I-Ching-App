#!/usr/bin/env node
/**
 * QA code: AU-FID-W-023 fill-wilhelm-de-comments-au-pilot · v1.0.0
 * Area: scripts/fill-wilhelm-de-comments-au-pilot.mjs
 * Family: FID-W
 */
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tsvEscapeCell } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import { classifyAuDisputeResolution } from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { buildHex1JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex1-jpg.mjs";
import { buildHex2JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex2-jpg.mjs";
import { buildHex3JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex3-jpg.mjs";
import { buildGenericHexJpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-generic.mjs";
import { jpgPageRangeForHex } from "./lib/wilhelm-de-comments-au-pilot-common.mjs";
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
const HEX_STARTS = join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json");

/** @type {Record<number, () => Record<string, { contenido_pdf: string; au_estado: string; jpgPages: string }>>} */
const BUILDERS = {
  1: buildHex1JpgVerifiedFields,
  2: buildHex2JpgVerifiedFields,
  3: buildHex3JpgVerifiedFields,
};

function parseArgs(argv) {
  const hexArg = argv.find((a) => a.startsWith("--hex="));
  const hex = Number(hexArg?.split("=")[1] ?? 1);
  return { hex };
}

async function main() {
  const { hex } = parseArgs(process.argv);
  const build = BUILDERS[hex] ?? (() => buildGenericHexJpgVerifiedFields(hex));
  if (hex < 1 || hex > 64) {
    console.error(`Hex must be 1–64, got ${hex}`);
    process.exit(1);
  }

  const hexStarts = JSON.parse(await readFile(HEX_STARTS, "utf8"));
  const pageRange = jpgPageRangeForHex(hexStarts, hex);
  const verified = build();
  const pass02 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
  const pass04 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));
  const compare = buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04).filter((r) => r.hex === hex);
  const byField = Object.fromEntries(compare.map((r) => [r.field, r]));
  const hexKey = String(hex);

  /** @type {Record<string, string>} */
  const resolucion = {};

  const lines = [
    "campo\tcontenido_reconciliado\tjpg_paginas\tcontenido_pdf\tau_estado\tresolucion_disputa",
  ];
  for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
    const v = verified[key];
    const row = byField[key];
    resolucion[key] = classifyAuDisputeResolution(
      row?.pass02 ?? "",
      row?.pass04 ?? "",
      v?.contenido_pdf ?? "",
      row?.status ?? "both_empty",
    );
    lines.push(
      [
        key,
        tsvEscapeCell(pass02.hexagrams[hexKey]?.fields?.[key] ?? ""),
        v?.jpgPages ?? pageRange,
        tsvEscapeCell(v?.contenido_pdf ?? ""),
        v?.au_estado ?? "pendiente",
        resolucion[key] ?? "na",
      ].join("\t"),
    );
  }
  lines.push(`hex_fin\t${hex}\t\t\t\t`);

  const pilotPath = join(
    WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
    `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`,
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
        v?.jpgPages ?? pageRange,
        tsvEscapeCell(v?.contenido_pdf ?? ""),
        v?.au_estado ?? "pendiente",
        resolucion[row.field] ?? "na",
      ].join("\t"),
    );
  }
  disputeLines.push(`hex_fin\t${hex}\t\t\t\t${pageRange}\t\t\t`);
  const disputesPath = join(
    WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
    `wilhelm-de-comments-hex-${String(hex).padStart(2, "0")}-disputes.tsv`,
  );
  await writeFile(disputesPath, `${disputeLines.join("\n")}\n`, "utf8");

  const closed = Object.values(verified).filter(
    (v) => v.au_estado === "cerrado" || v.au_estado === "vacio_en_libro",
  ).length;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(REPORTS, `wilhelm-de-comments-au-pilot-hex${hex}-fill-${stamp}.json`);
  const report = {
    updatedAt: new Date().toISOString(),
    hex,
    jpgPages: pageRange,
    fieldsClosed: closed,
    fieldsTotal: Object.keys(verified).length,
    pilotPath,
    disputesPath,
    disputeResolutions: Object.fromEntries(disputeRows.map((r) => [r.field, resolucion[r.field]])),
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Pilot hex ${hex} filled: ${closed}/${Object.keys(verified).length} fields closed`);
  console.log(`Pilot TSV: ${pilotPath}`);
  console.log(`Disputes TSV: ${disputesPath}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
