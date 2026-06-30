#!/usr/bin/env node
/**
 * QA code: AU-FID-W-014 export-wilhelm-de-comments-anna-au-tsv · v1.0.0
 * Area: scripts/export-wilhelm-de-comments-anna-au-tsv.mjs
 * Family: FID-W
 *
 * Export Anna dual-pass disputes as vertical TSV for PDF AU (Google Sheets).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAnnaCommentsAuDisputeRows,
  buildAnnaCommentsDisputesFlatTsv,
  buildAnnaCommentsHexDisputesVerticalTsv,
  buildAnnaCommentsHexFullVerticalAuTsv,
  uniqueDisputeHexes,
} from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import { loadCommentsHexJpgRange } from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
  WILHELM_DE_COMMENTS_ANNA_DISPUTES_FLAT_TSV,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  WILHELM_DE_COMMENTS_ANNA_RECONCILED,
  WILHELM_DE_COMMENTS_HEX_STARTS_JSON,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

const DEFAULT_PILOT = [1, 2, 8];

function parsePilotArg(argv) {
  const raw = argv.find((a) => a.startsWith("--pilot="))?.split("=")[1];
  if (!raw) return DEFAULT_PILOT;
  return raw.split(",").map((s) => Number(s.trim())).filter((n) => n >= 1 && n <= 64);
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const pilotHexes = parsePilotArg(process.argv);
  const pass02 = await loadJson(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02);
  const pass04 = await loadJson(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04);
  const reconciled = await loadJson(WILHELM_DE_COMMENTS_ANNA_RECONCILED);

  const disputeRows = buildAnnaCommentsAuDisputeRows(pass02, pass04);
  /** @type {Record<number, string>} */
  const jpgPagesByHex = {};
  for (let h = 1; h <= 64; h++) {
    jpgPagesByHex[h] = loadCommentsHexJpgRange(WILHELM_DE_COMMENTS_HEX_STARTS_JSON, h);
  }
  const flatTsv = buildAnnaCommentsDisputesFlatTsv(disputeRows, jpgPagesByHex);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  await mkdir(WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR, { recursive: true });
  await mkdir(WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR, { recursive: true });

  await writeFile(WILHELM_DE_COMMENTS_ANNA_DISPUTES_FLAT_TSV, flatTsv, "utf8");
  const datedFlat = join(
    WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
    `wilhelm-de-comments-anna-disputes-flat-${stamp}.tsv`,
  );
  await writeFile(datedFlat, flatTsv, "utf8");

  const hexesWithDisputes = uniqueDisputeHexes(disputeRows);
  /** @type {string[]} */
  const byHexPaths = [];
  for (const hex of hexesWithDisputes) {
    const rowsForHex = disputeRows.filter((r) => r.hex === hex);
    const jpgPages = jpgPagesByHex[hex] ?? "";
    const body = buildAnnaCommentsHexDisputesVerticalTsv(hex, rowsForHex, jpgPages);
    const out = join(
      WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
      `wilhelm-de-comments-hex-${String(hex).padStart(2, "0")}-disputes.tsv`,
    );
    await writeFile(out, body, "utf8");
    byHexPaths.push(out);
  }

  /** @type {string[]} */
  const pilotPaths = [];
  for (const n of pilotHexes) {
    const fields = reconciled.hexagrams?.[String(n)]?.fields;
    if (!fields) throw new Error(`reconciled missing hex ${n}`);
    const body = buildAnnaCommentsHexFullVerticalAuTsv(n, fields, jpgPagesByHex[n] ?? "");
    const out = join(WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR, `wilhelm-de-comments-hex-${n}-pilot-au.tsv`);
    await writeFile(out, body, "utf8");
    pilotPaths.push(out);
  }

  const summary = {
    updatedAt: new Date().toISOString(),
    disputeRowCount: disputeRows.length,
    hexesWithDisputes: hexesWithDisputes.length,
    flatLatest: WILHELM_DE_COMMENTS_ANNA_DISPUTES_FLAT_TSV,
    flatDated: datedFlat,
    byHexDir: WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
    pilotHexes,
    pilotPaths,
    statusBreakdown: disputeRows.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, /** @type {Record<string, number>} */ ({})),
  };

  await mkdir(REPORTS, { recursive: true });
  const reportPath = join(REPORTS, `wilhelm-de-comments-anna-au-export-${stamp}.json`);
  await writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Dispute rows: ${disputeRows.length} (${hexesWithDisputes.length} hex)`);
  console.log(`Flat TSV: ${WILHELM_DE_COMMENTS_ANNA_DISPUTES_FLAT_TSV}`);
  console.log(`By-hex dir: ${WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR} (${byHexPaths.length} files)`);
  console.log(`Pilot AU (${pilotHexes.join(", ")}): ${pilotPaths.join(", ")}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
