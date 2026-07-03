#!/usr/bin/env node
/**
 * QA code: AU-FID-W-043 verify-wilhelm-de-book-one-au-pilot · v1.0.0
 * Area: scripts/verify-wilhelm-de-book-one-au-pilot.mjs
 * Family: FID-W
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  auTextsEqual,
  isAuEstadoClosed,
  parseAnnaCommentsAuVerticalTsv,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { WILHELM_MANUAL_FIELDS } from "./lib/wilhelm-manual-fields.mjs";
import {
  WILHELM_DE_BOOK_ONE_AU_GOLD_DIR,
  WILHELM_DE_BOOK_ONE_MERGED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

function parseArgs(argv) {
  const hexArg = argv.find((a) => a.startsWith("--hex="));
  return { hex: Number(hexArg?.split("=")[1] ?? 1) };
}

async function main() {
  const { hex } = parseArgs(process.argv);
  const pilotPath = join(
    WILHELM_DE_BOOK_ONE_AU_GOLD_DIR,
    `wilhelm-de-book-one-hex-${hex}-pilot-au.tsv`,
  );
  const pilot = parseAnnaCommentsAuVerticalTsv(await readFile(pilotPath, "utf8"));
  const zenoMerged = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  const zenoFields = zenoMerged.hexagrams[String(hex)]?.fields ?? {};

  let pending = 0;
  let closed = 0;
  /** @type {object[]} */
  const rows = [];

  for (const { key } of WILHELM_MANUAL_FIELDS) {
    const au = pilot.fields[key];
    const estado = au?.au_estado ?? "pendiente";
    if (!isAuEstadoClosed(estado)) {
      pending++;
      rows.push({
        field: key,
        status: "PENDING_AU",
        au_estado: estado,
        resolucion_disputa: au?.resolucion_disputa,
      });
      continue;
    }
    closed++;
    const pdf = au.contenido_pdf ?? "";
    rows.push({
      field: key,
      status: "CLOSED",
      au_estado: estado,
      vs_zeno: auTextsEqual(pdf, zenoFields[key] ?? "") ? "match" : "diff",
    });
  }

  const ok = pending === 0 && closed === WILHELM_MANUAL_FIELDS.length;
  const report = {
    updatedAt: new Date().toISOString(),
    auditCode: "20260629-PLAN-DAT-W-03",
    hex,
    pilotPath,
    ok,
    closed,
    pending,
    fieldsTotal: WILHELM_MANUAL_FIELDS.length,
    rows,
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const out = join(REPORTS, `wilhelm-de-book-one-au-pilot-hex${hex}-verify-${stamp}.json`);
  await mkdir(REPORTS, { recursive: true });
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `Pilot hex ${hex} verify: ${ok ? "PASS" : "FAIL"} (${closed} closed, ${pending} pending)`,
  );
  console.error(`Report: ${out}`);
  process.exitCode = ok ? 0 : 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
