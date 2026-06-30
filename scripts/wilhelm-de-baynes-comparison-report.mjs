#!/usr/bin/env node

/**
 * QA code: AU-FID-W-009 wilhelm-de-baynes-comparison · v2.0.0
 * Area: scripts/wilhelm-de-baynes-comparison-report.mjs
 * Family: FID-W
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWilhelmBaynesDeRows,
  summarizeWilhelmBaynesDeRows,
} from "./lib/wilhelm-baynes-de-field-map.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function preview(text, max = 120) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function tsvEscape(value) {
  return String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ").replace(/"/g, '""');
}

async function main() {
  const sourceRows = await buildWilhelmBaynesDeRows();
  const rows = sourceRows.map((row) => ({
    blockId: row.blockId,
    blockTitle: row.blockTitle,
    hex: row.hex,
    field: row.field,
    classification: row.classification,
    enPreview: preview(row.en),
    dePreview: preview(row.de),
  }));

  const summary = summarizeWilhelmBaynesDeRows(sourceRows);

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = `wilhelm-en-de-comparison-${ts}`;
  const jsonPath = join(ROOT, "reports", `${baseName}.json`);
  const tsvPath = join(ROOT, "reports", `${baseName}.tsv`);

  await mkdir(join(ROOT, "reports"), { recursive: true });
  await writeFile(
    jsonPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, rows }, null, 2)}\n`,
    "utf8",
  );

  const tsvHeader = [
    "block_id",
    "block_title",
    "hex",
    "field",
    "classification",
    "en_preview",
    "de_preview",
  ].join("\t");
  const tsvBody = rows
    .map((r) =>
      [r.blockId, r.blockTitle, r.hex, r.field, r.classification, r.enPreview, r.dePreview]
        .map(tsvEscape)
        .join("\t"),
    )
    .join("\n");
  await writeFile(tsvPath, `${tsvHeader}\n${tsvBody}\n`, "utf8");

  console.log(`Rows: ${summary.total} (${summary.fieldsPerHex} fields × 64 hex)`);
  console.log(`Pairs EN+DE: ${summary.pair}`);
  console.log(`EN-only gaps: ${summary.en_only}`);
  console.log(`DE-only gaps: ${summary.de_only}`);
  console.log(`Both empty: ${summary.both_empty}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`TSV: ${tsvPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
