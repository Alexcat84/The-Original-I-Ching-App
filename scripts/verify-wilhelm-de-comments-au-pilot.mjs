#!/usr/bin/env node
/**
 * QA code: AU-FID-W-020 verify-wilhelm-de-comments-au-pilot · v1.0.0
 * Area: scripts/verify-wilhelm-de-comments-au-pilot.mjs
 * Family: FID-W
 *
 * Gate: pilot TSV contenido_pdf must be closed + char diff vs pass02/04/reconciled.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  auTextsEqual,
  classifyAuDisputeResolution,
  isAuEstadoClosed,
  normalizeWilhelmDeAuBookText,
  parseAnnaCommentsAuVerticalTsv,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { buildWilhelmDeCommentsAnnaCompareRows } from "./lib/wilhelm-de-comments-anna-reconcile.mjs";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./lib/wilhelm-comments-manual-fields.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  WILHELM_DE_COMMENTS_ANNA_RECONCILED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

function parseArgs(argv) {
  const hexArg = argv.find((a) => a.startsWith("--hex="));
  return { hex: Number(hexArg?.split("=")[1] ?? 1) };
}

/** @param {string} a @param {string} b */
function charDiffSummary(a, b, max = 120) {
  const na = normalizeWilhelmDeAuBookText(a);
  const nb = normalizeWilhelmDeAuBookText(b);
  if (na === nb) return null;
  for (let i = 0; i < Math.max(na.length, nb.length); i++) {
    if (na[i] !== nb[i]) {
      const start = Math.max(0, i - 20);
      return {
        index: i,
        pdfSnippet: na.slice(start, start + max),
        otherSnippet: nb.slice(start, start + max),
      };
    }
  }
  return { index: 0, pdfSnippet: na.slice(0, max), otherSnippet: nb.slice(0, max) };
}

async function main() {
  const { hex } = parseArgs(process.argv);
  const pilotPath = join(
    WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
    `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`,
  );
  const pilot = parseAnnaCommentsAuVerticalTsv(await readFile(pilotPath, "utf8"));
  const pass02 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
  const pass04 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));
  const reconciled = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_RECONCILED, "utf8"));
  const compare = buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04).filter((r) => r.hex === hex);
  const byField = Object.fromEntries(compare.map((r) => [r.field, r]));

  /** @type {Array<object>} */
  const rows = [];
  let pending = 0;
  let closed = 0;

  for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
    const au = pilot.fields[key];
    const estado = au?.au_estado ?? "pendiente";
    if (!isAuEstadoClosed(estado)) {
      pending++;
      rows.push({ field: key, status: "PENDING_AU", au_estado: estado });
      continue;
    }
    closed++;
    const pdf = au.contenido_pdf ?? "";
    const row = byField[key];
    const resolucion = classifyAuDisputeResolution(
      row?.pass02 ?? "",
      row?.pass04 ?? "",
      pdf,
      row?.status ?? "both_empty",
    );
    rows.push({
      field: key,
      status: "CLOSED",
      au_estado: estado,
      resolucion_disputa: resolucion,
      vs_pass02: auTextsEqual(pdf, row?.pass02 ?? "") ? "match" : "diff",
      vs_pass04: auTextsEqual(pdf, row?.pass04 ?? "") ? "match" : "diff",
      vs_reconciled: auTextsEqual(
        pdf,
        reconciled.hexagrams[String(hex)]?.fields?.[key] ?? "",
      )
        ? "match"
        : "diff",
      diff_reconciled:
        charDiffSummary(
          pdf,
          reconciled.hexagrams[String(hex)]?.fields?.[key] ?? "",
        ) ?? undefined,
    });
  }

  const disputed = rows.filter(
    (r) => r.status === "CLOSED" && byField[r.field]?.status === "disputed",
  );
  const ok = pending === 0 && closed === WILHELM_COMMENTS_MANUAL_FIELDS.length;

  const report = {
    updatedAt: new Date().toISOString(),
    hex,
    pilotPath,
    ok,
    closed,
    pending,
    fieldsTotal: WILHELM_COMMENTS_MANUAL_FIELDS.length,
    disputedClosed: disputed.length,
    disputedTotal: compare.filter((r) => r.status === "disputed").length,
    rows,
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const out = join(REPORTS, `wilhelm-de-comments-au-pilot-hex${hex}-verify-${stamp}.json`);
  await mkdir(REPORTS, { recursive: true });
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Pilot hex ${hex} verify: ${ok ? "PASS" : "FAIL"} (${closed} closed, ${pending} pending)`);
  console.log(`Disputed fields closed: ${disputed.length}/${report.disputedTotal}`);
  for (const r of disputed) {
    console.log(`  ${r.field}: resolucion=${r.resolucion_disputa} vs02=${r.vs_pass02} vs04=${r.vs_pass04}`);
  }
  console.log(`Report: ${out}`);

  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
