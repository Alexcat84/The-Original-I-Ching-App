#!/usr/bin/env node
/**
 * QA code: AU-FID-W-027 spot-check-wilhelm-de-comments-au-pilot · v1.0.0
 * Area: scripts/spot-check-wilhelm-de-comments-au-pilot.mjs
 * Family: FID-W
 *
 * Flags hex 4–64 pilot fields that differ from pass04 (JPG-OCR reference pass)
 * or are coincide_ninguno vs pass02/04 — candidates for JPG re-verification.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  auTextsEqual,
  classifyAuDisputeResolution,
  normalizeWilhelmDeAuBookText,
  parseAnnaCommentsAuVerticalTsv,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { buildWilhelmDeCommentsAnnaCompareRows } from "./lib/wilhelm-de-comments-anna-reconcile.mjs";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./lib/wilhelm-comments-manual-fields.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
} from "./lib/wilhelm-de-dataset-paths.mjs";
import { jpgPageRangeForHex } from "./lib/wilhelm-de-comments-au-pilot-common.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");
const HEX_STARTS = join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json");

function parseArgs(argv) {
  const from = Number(argv.find((a) => a.startsWith("--from="))?.split("=")[1] ?? 4);
  const to = Number(argv.find((a) => a.startsWith("--to="))?.split("=")[1] ?? 64);
  return { from, to };
}

function main() {
  const { from, to } = parseArgs(process.argv);
  const pass02 = JSON.parse(readFileSync(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
  const pass04 = JSON.parse(readFileSync(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));
  const hexStarts = JSON.parse(readFileSync(HEX_STARTS, "utf8"));
  const compareAll = buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04);

  /** @type {Array<object>} */
  const flags = [];
  /** @type {Record<number, number>} */
  const byHex = {};

  for (let hex = from; hex <= to; hex++) {
    const pilotPath = join(
      WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
      `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`,
    );
    const pilot = parseAnnaCommentsAuVerticalTsv(readFileSync(pilotPath, "utf8"));
    const cmp = compareAll.filter((r) => r.hex === hex);
    const pages = jpgPageRangeForHex(hexStarts, hex);

    for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
      const pdf = pilot.fields[key]?.contenido_pdf ?? "";
      const estado = pilot.fields[key]?.au_estado ?? "pendiente";
      if (estado === "vacio_en_libro" && !pdf.trim()) continue;

      const row = cmp.find((r) => r.field === key);
      const p2 = row?.pass02 ?? "";
      const p4 = row?.pass04 ?? "";
      const res = classifyAuDisputeResolution(p2, p4, pdf, row?.status ?? "both_empty");

      const reasons = [];
      if (res === "coincide_ninguno") reasons.push("coincide_ninguno");
      if (p4.trim() && !auTextsEqual(pdf, p4)) reasons.push("diff_pass04");
      if (p2.trim() && p4.trim() && auTextsEqual(p2, p4) && !auTextsEqual(pdf, p2)) {
        reasons.push("diff_both_passes");
      }
      if (!pdf.trim() && estado === "cerrado") reasons.push("cerrado_vacio");

      if (!reasons.length) continue;

      flags.push({
        hex,
        field: key,
        jpgPages: pages,
        au_estado: estado,
        resolucion: res,
        disputeStatus: row?.status ?? "na",
        reasons,
        pdfLen: pdf.length,
        pass02Len: p2.length,
        pass04Len: p4.length,
        snippetPdf: normalizeWilhelmDeAuBookText(pdf).slice(0, 80),
        snippetP4: normalizeWilhelmDeAuBookText(p4).slice(0, 80),
      });
      byHex[hex] = (byHex[hex] ?? 0) + 1;
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outPath = join(REPORTS, `wilhelm-de-comments-au-spot-check-${from}-${to}-${stamp}.json`);
  mkdirSync(REPORTS, { recursive: true });
  const report = {
    updatedAt: new Date().toISOString(),
    range: { from, to },
    flaggedFields: flags.length,
    hexesWithFlags: Object.keys(byHex).length,
    byHex,
    flags,
  };
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Spot-check ${from}-${to}: ${flags.length} flagged fields in ${Object.keys(byHex).length} hexes`);
  console.log(`Report: ${outPath}`);
  process.exit(flags.length ? 1 : 0);
}

main();
