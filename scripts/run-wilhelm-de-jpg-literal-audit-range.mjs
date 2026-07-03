#!/usr/bin/env node
/**
 * QA code: AU-FID-W-029 run-wilhelm-de-jpg-literal-audit-range · v1.0.0
 * Area: scripts/run-wilhelm-de-jpg-literal-audit-range.mjs
 * Family: FID-W
 *
 * Batch: fill pilot+disputes from JPG-verified builder, verify, markHexComplete.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tsvEscapeCell } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import {
  classifyAuDisputeResolution,
  isAuEstadoClosed,
  parseAnnaCommentsAuVerticalTsv,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { buildWilhelmDeCommentsAnnaCompareRows } from "./lib/wilhelm-de-comments-anna-reconcile.mjs";
import { buildHex1JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex1-jpg.mjs";
import { buildHex2JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex2-jpg.mjs";
import { buildHex3JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex3-jpg.mjs";
import { buildGenericHexJpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-generic.mjs";
import { jpgPageRangeForHex } from "./lib/wilhelm-de-comments-au-pilot-common.mjs";
import { markHexComplete, loadLedger } from "./lib/wilhelm-de-jpg-literal-audit-ledger.mjs";
import { JPG_LITERAL_FIELD_PATCHES } from "./lib/wilhelm-de-jpg-literal-field-patches.mjs";
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
  const from = Number(argv.find((a) => a.startsWith("--from="))?.split("=")[1] ?? 33);
  const to = Number(argv.find((a) => a.startsWith("--to="))?.split("=")[1] ?? 64);
  return { from, to };
}

/**
 * @param {number} hex
 * @param {Record<string, { contenido_pdf: string; au_estado: string; jpgPages: string }>} verified
 */
function applyJpgPatches(hex, verified) {
  const patches = JPG_LITERAL_FIELD_PATCHES[hex];
  if (!patches) return [];
  /** @type {string[]} */
  const corrected = [];
  for (const [field, pdf] of Object.entries(patches)) {
    if (verified[field] && verified[field].contenido_pdf !== pdf) {
      verified[field].contenido_pdf = pdf;
      corrected.push(field);
    }
  }
  return corrected;
}

/**
 * @param {number} hex
 */
async function fillHex(hex, hexStarts, pass02, pass04) {
  const build = BUILDERS[hex] ?? (() => buildGenericHexJpgVerifiedFields(hex));
  const pageRange = jpgPageRangeForHex(hexStarts, hex);
  const verified = build();
  const patchCorrected = applyJpgPatches(hex, verified);
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

  return { pilotPath, disputesPath, pageRange, patchCorrected, verified };
}

/**
 * @param {number} hex
 */
function verifyHex(hex) {
  const r = spawnSync(
    process.execPath,
    ["scripts/verify-wilhelm-de-comments-au-pilot.mjs", `--hex=${hex}`],
    { cwd: ROOT, encoding: "utf8" },
  );
  return { ok: r.status === 0, stdout: r.stdout, stderr: r.stderr };
}

async function main() {
  const { from, to } = parseArgs(process.argv);
  const hexStarts = JSON.parse(await readFile(HEX_STARTS, "utf8"));
  const pass02 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
  const pass04 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));

  /** @type {Record<string, object>} */
  const hexResults = {};
  /** @type {string[]} */
  const failed = [];

  for (let hex = from; hex <= to; hex++) {
    const { pageRange, patchCorrected, verified } = await fillHex(hex, hexStarts, pass02, pass04);
    const verify = verifyHex(hex);
    const pilot = parseAnnaCommentsAuVerticalTsv(
      await readFile(
        join(WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR, `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`),
        "utf8",
      ),
    );

    /** @type {Array<{field: string; reason: string}>} */
    const corrections = patchCorrected.map((field) => ({
      field,
      reason: "JPG literal patch",
    }));

    let marked = false;
    if (verify.ok) {
      const allClosed = WILHELM_COMMENTS_MANUAL_FIELDS.every(({ key }) =>
        isAuEstadoClosed(pilot.fields[key]?.au_estado ?? "pendiente"),
      );
      if (allClosed) {
        await markHexComplete(hex, {
          note: `JPG literal AUD-DAT-W-07 hex ${hex} pp.${pageRange}`,
          jpgPagesRead: pageRange,
          correctedFields: corrections.map((c) => c.field),
        });
        marked = true;
      }
    } else {
      failed.push(String(hex));
    }

    hexResults[String(hex)] = {
      verified: verify.ok && marked,
      jpgPagesRead: pageRange,
      verifyPass: verify.ok,
      markedComplete: marked,
      corrections,
      fieldsClosed: Object.values(verified).filter(
        (v) => v.au_estado === "cerrado" || v.au_estado === "vacio_en_libro",
      ).length,
    };
  }

  const ledger = await loadLedger();
  const summary = {
    updatedAt: new Date().toISOString(),
    auditCode: "20260630-AUD-DAT-W-07",
    range: { from, to },
    hexProcessed: to - from + 1,
    hexMarkedComplete: Object.values(hexResults).filter((h) => h.markedComplete).length,
    hexVerifyFailed: failed,
    ledgerSummary: ledger.summary,
    hexResults,
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outPath = join(REPORTS, `wilhelm-de-jpg-literal-audit-${from}-${to}-${stamp}.json`);
  await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(JSON.stringify(summary, null, 2));
  console.error(`Report: ${outPath}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
