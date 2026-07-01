#!/usr/bin/env node
/**
 * QA code: AU-FID-W-028 jpg-audit-wilhelm-de-comments-au-pilot · v1.0.0
 * Area: scripts/jpg-audit-wilhelm-de-comments-au-pilot.mjs
 * Family: FID-W
 *
 * Re-builds expected contenido_pdf via generic/hex builders and diffs pilot TSV.
 * Also lists coincide_ninguno fields for manual JPG confirmation.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  auTextsEqual,
  classifyAuDisputeResolution,
  parseAnnaCommentsAuVerticalTsv,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { buildWilhelmDeCommentsAnnaCompareRows } from "./lib/wilhelm-de-comments-anna-reconcile.mjs";
import { buildHex1JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex1-jpg.mjs";
import { buildHex2JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex2-jpg.mjs";
import { buildHex3JpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-hex3-jpg.mjs";
import { buildGenericHexJpgVerifiedFields } from "./lib/wilhelm-de-comments-au-pilot-generic.mjs";
import { jpgPageRangeForHex } from "./lib/wilhelm-de-comments-au-pilot-common.mjs";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./lib/wilhelm-comments-manual-fields.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");
const HEX_STARTS = join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json");

/** @type {Record<number, () => Record<string, { contenido_pdf: string; au_estado: string }>>} */
const BUILDERS = {
  1: buildHex1JpgVerifiedFields,
  2: buildHex2JpgVerifiedFields,
  3: buildHex3JpgVerifiedFields,
};

function parseArgs(argv) {
  const from = Number(argv.find((a) => a.startsWith("--from="))?.split("=")[1] ?? 4);
  const to = Number(argv.find((a) => a.startsWith("--to="))?.split("=")[1] ?? 64);
  return { from, to };
}

function buildExpected(hex) {
  const fn = BUILDERS[hex] ?? (() => buildGenericHexJpgVerifiedFields(hex));
  return fn();
}

function main() {
  const { from, to } = parseArgs(process.argv);
  const pass02 = JSON.parse(readFileSync(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
  const pass04 = JSON.parse(readFileSync(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));
  const hexStarts = JSON.parse(readFileSync(HEX_STARTS, "utf8"));
  const compareAll = buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04);

  /** @type {Array<object>} */
  const mismatches = [];
  /** @type {Array<object>} */
  const ninguno = [];

  for (let hex = from; hex <= to; hex++) {
    const pilotPath = join(
      WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
      `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`,
    );
    const pilot = parseAnnaCommentsAuVerticalTsv(readFileSync(pilotPath, "utf8"));
    const expected = buildExpected(hex);
    const pages = jpgPageRangeForHex(hexStarts, hex);
    const cmp = compareAll.filter((r) => r.hex === hex);

    for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
      const pdf = pilot.fields[key]?.contenido_pdf ?? "";
      const exp = expected[key]?.contenido_pdf ?? "";
      const estado = pilot.fields[key]?.au_estado ?? "pendiente";
      if (!auTextsEqual(pdf, exp)) {
        mismatches.push({
          hex,
          field: key,
          jpgPages: pages,
          au_estado: estado,
          pilotLen: pdf.length,
          expectedLen: exp.length,
          pilotSnippet: pdf.slice(0, 100),
          expectedSnippet: exp.slice(0, 100),
        });
      }
      const row = cmp.find((r) => r.field === key);
      const res = classifyAuDisputeResolution(
        row?.pass02 ?? "",
        row?.pass04 ?? "",
        pdf,
        row?.status ?? "both_empty",
      );
      if (res === "coincide_ninguno" && pdf.trim()) {
        ninguno.push({ hex, field: key, jpgPages: pages, snippet: pdf.slice(0, 120) });
      }
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outPath = join(REPORTS, `wilhelm-de-comments-au-jpg-audit-${from}-${to}-${stamp}.json`);
  mkdirSync(REPORTS, { recursive: true });
  writeFileSync(
    outPath,
    `${JSON.stringify({ updatedAt: new Date().toISOString(), from, to, mismatches, ninguno }, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `JPG audit ${from}-${to}: ${mismatches.length} pilot≠expected, ${ninguno.length} coincide_ninguno (non-empty)`,
  );
  console.log(`Report: ${outPath}`);
  process.exit(mismatches.length ? 1 : 0);
}

main();
