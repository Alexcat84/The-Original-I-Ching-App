#!/usr/bin/env node
/**
 * QA code: AU-FID-W-042 fill-wilhelm-de-book-one-au-pilot · v1.0.0
 * Area: scripts/fill-wilhelm-de-book-one-au-pilot.mjs
 * Family: FID-W
 *
 * Bootstrap Erstes Buch AU pilot TSV: Zeno reconciliado vs pass03/JPG-page anchor.
 * contenido_pdf starts as pass03 bootstrap — manual JPG review required before cerrado.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tsvEscapeCell } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import {
  auTextsEqual,
  normalizeWilhelmDeAuBookText,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import {
  isYongFieldAbsentInBook,
  jpgPageRangeForBookOneHex,
  loadBookOneHexStarts,
} from "./lib/wilhelm-de-book-one-au-pilot-common.mjs";
import { parseWilhelmDeHexFromJpgPageMap } from "./lib/wilhelm-de-jpg-extract.mjs";
import { WILHELM_MANUAL_FIELDS } from "./lib/wilhelm-manual-fields.mjs";
import {
  WILHELM_DE_BOOK_ONE_AU_GOLD_DIR,
  WILHELM_DE_BOOK_ONE_MERGED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

function parseArgs(argv) {
  const hexArg = argv.find((a) => a.startsWith("--hex="));
  const raw = hexArg?.split("=")[1] ?? "1,2,8";
  const hexList =
    raw === "all"
      ? Array.from({ length: 64 }, (_, i) => i + 1)
      : raw.split(",").map((s) => Number(s.trim()));
  return { hexList };
}

/**
 * @param {string} zeno
 * @param {string} pass03
 * @param {number} hex
 * @param {string} fieldKey
 */
function classifyResolution(zeno, pass03, hex, fieldKey) {
  if (isYongFieldAbsentInBook(hex, fieldKey)) return "vacio_en_libro";
  const z = normalizeWilhelmDeAuBookText(zeno);
  const p = normalizeWilhelmDeAuBookText(pass03);
  if (!z && !p) return "na";
  return auTextsEqual(zeno, pass03) ? "coincide_zeno" : "diff_zeno";
}

/**
 * @param {string} zeno
 * @param {string} pass03
 * @param {number} hex
 * @param {string} fieldKey
 */
function resolveAuEstado(zeno, pass03, hex, fieldKey) {
  if (isYongFieldAbsentInBook(hex, fieldKey)) return "vacio_en_libro";
  if (!normalizeWilhelmDeAuBookText(pass03) && !normalizeWilhelmDeAuBookText(zeno)) {
    return "vacio_en_libro";
  }
  // Bootstrap: never auto-close — pass03 ≠ JPG literal attestation
  return "pendiente";
}

async function fillHex(hex, zenoMerged) {
  const hexStarts = loadBookOneHexStarts();
  const pageRange = jpgPageRangeForBookOneHex(hexStarts, hex);
  const parsed = await parseWilhelmDeHexFromJpgPageMap(hex);
  const pass03Fields = parsed.fields;
  const zenoFields = zenoMerged.hexagrams[String(hex)]?.fields ?? {};

  const lines = [
    "campo\tcontenido_reconciliado\tcontenido_pass03\tjpg_paginas\tcontenido_pdf\tau_estado\tresolucion_disputa",
  ];
  let pendiente = 0;
  let vacio = 0;

  for (const { key } of WILHELM_MANUAL_FIELDS) {
    const zeno = zenoFields[key] ?? "";
    const pass03 = pass03Fields[key] ?? "";
    const resolucion = classifyResolution(zeno, pass03, hex, key);
    const auEstado = resolveAuEstado(zeno, pass03, hex, key);
    if (auEstado === "pendiente") pendiente++;
    if (auEstado === "vacio_en_libro") vacio++;
    const contenidoPdf = auEstado === "vacio_en_libro" ? "" : pass03;
    lines.push(
      [
        key,
        tsvEscapeCell(zeno),
        tsvEscapeCell(pass03),
        pageRange,
        tsvEscapeCell(contenidoPdf),
        auEstado,
        resolucion,
      ].join("\t"),
    );
  }
  lines.push(`hex_fin\t${hex}\t\t\t\t\t`);

  await mkdir(WILHELM_DE_BOOK_ONE_AU_GOLD_DIR, { recursive: true });
  const pilotPath = join(
    WILHELM_DE_BOOK_ONE_AU_GOLD_DIR,
    `wilhelm-de-book-one-hex-${hex}-pilot-au.tsv`,
  );
  await writeFile(pilotPath, `${lines.join("\n")}\n`, "utf8");

  return {
    hex,
    pilotPath,
    pageRange,
    pendiente,
    vacio,
    diffZeno: WILHELM_MANUAL_FIELDS.filter(
      ({ key }) => classifyResolution(zenoFields[key] ?? "", pass03Fields[key] ?? "", hex, key) === "diff_zeno",
    ).length,
    coincideZeno: WILHELM_MANUAL_FIELDS.filter(
      ({ key }) =>
        classifyResolution(zenoFields[key] ?? "", pass03Fields[key] ?? "", hex, key) === "coincide_zeno",
    ).length,
  };
}

async function main() {
  const { hexList } = parseArgs(process.argv);
  const zenoMerged = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));

  /** @type {object[]} */
  const results = [];
  for (const hex of hexList) {
    results.push(await fillHex(hex, zenoMerged));
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(REPORTS, `wilhelm-de-book-one-au-pilot-fill-${stamp}.json`);
  await mkdir(REPORTS, { recursive: true });
  const payload = {
    updatedAt: new Date().toISOString(),
    auditCode: "20260629-PLAN-DAT-W-03",
    hexList,
    note: "Bootstrap pass03 — all non-vacio fields pendiente until JPG literal AU",
    results,
  };
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(payload, null, 2));
  console.error(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
