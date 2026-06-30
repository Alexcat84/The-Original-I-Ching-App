#!/usr/bin/env node
/**
 * QA code: AU-FID-W-015 apply-wilhelm-de-comments-au-gold · v1.0.0
 * Area: scripts/apply-wilhelm-de-comments-au-gold.mjs
 * Family: FID-W
 *
 * Merge filled AU TSVs → wilhelm-de-64hex-comments-au-gold.json (book-primary).
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyAuDisputeResolution,
  isAuEstadoClosed,
  loadCommentsHexJpgRange,
  normalizeWilhelmDeAuBookText,
  parseAnnaCommentsAuVerticalTsv,
  parseAnnaCommentsDisputesFlatTsv,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { buildAnnaCommentsAuDisputeRows } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
  WILHELM_DE_COMMENTS_ANNA_DISPUTES_FLAT_TSV,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  WILHELM_DE_COMMENTS_AU_GOLD_JSON,
  WILHELM_DE_COMMENTS_HEX_STARTS_JSON,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

/**
 * @param {string} dir
 * @param {RegExp} re
 */
async function listMatching(dir, re) {
  const names = await readdir(dir);
  return names.filter((n) => re.test(n)).sort();
}

async function main() {
  /** @type {Record<string, { hex: number; jpgPages: string; fields: Record<string, object> }>} */
  const hexagrams = {};
  const sources = [];

  const pilotFiles = await listMatching(
    WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
    /^wilhelm-de-comments-hex-\d+-pilot-au\.tsv$/,
  );
  for (const name of pilotFiles) {
    const path = join(WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR, name);
    const parsed = parseAnnaCommentsAuVerticalTsv(await readFile(path, "utf8"));
    const jpgPages =
      loadCommentsHexJpgRange(WILHELM_DE_COMMENTS_HEX_STARTS_JSON, parsed.hex) || "";
    hexagrams[String(parsed.hex)] = {
      hex: parsed.hex,
      jpgPages,
      fields: parsed.fields,
      sourceTsv: path,
    };
    sources.push(path);
  }

  const byHexFiles = await listMatching(
    WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
    /^wilhelm-de-comments-hex-\d+-disputes\.tsv$/,
  );
  for (const name of byHexFiles) {
    const path = join(WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR, name);
    const parsed = parseAnnaCommentsAuVerticalTsv(await readFile(path, "utf8"));
    const key = String(parsed.hex);
    const jpgPages =
      loadCommentsHexJpgRange(WILHELM_DE_COMMENTS_HEX_STARTS_JSON, parsed.hex) || "";
    hexagrams[key] = {
      hex: parsed.hex,
      jpgPages,
      fields: { ...(hexagrams[key]?.fields ?? {}), ...parsed.fields },
      sourceTsv: path,
    };
    sources.push(path);
  }

  const pass02 = await loadJson(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02);
  const pass04 = await loadJson(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04);
  const compareRows = buildAnnaCommentsAuDisputeRows(pass02, pass04);

  let flatUpdated = false;
  try {
    const flatRaw = await readFile(WILHELM_DE_COMMENTS_ANNA_DISPUTES_FLAT_TSV, "utf8");
    const flatRows = parseAnnaCommentsDisputesFlatTsv(flatRaw);
    /** @type {string[]} */
    const outLines = [
      "hex\tcampo\testado\tpass02\tpass04\treconciliado\trazon_pick\tjpg_paginas\tcontenido_pdf\tau_estado\tresolucion_disputa",
    ];
    for (const row of flatRows) {
      const au = hexagrams[String(row.hex)]?.fields?.[row.field];
      const contenido_pdf = au?.contenido_pdf ?? row.contenido_pdf ?? "";
      const au_estado = au?.au_estado ?? row.au_estado ?? "pendiente";
      const resolucion =
        au?.resolucion_disputa ||
        classifyAuDisputeResolution(row.pass02, row.pass04, contenido_pdf, row.status);
      if (au && isAuEstadoClosed(au_estado)) flatUpdated = true;
      outLines.push(
        [
          row.hex,
          row.field,
          row.status,
          row.pass02.replace(/\n/g, "\\n").replace(/\t/g, " "),
          row.pass04.replace(/\n/g, "\\n").replace(/\t/g, " "),
          row.reconciled.replace(/\n/g, "\\n").replace(/\t/g, " "),
          (row.pickReason ?? "").replace(/\n/g, "\\n"),
          row.jpg_paginas ||
            hexagrams[String(row.hex)]?.jpgPages ||
            loadCommentsHexJpgRange(WILHELM_DE_COMMENTS_HEX_STARTS_JSON, row.hex),
          normalizeWilhelmDeAuBookText(contenido_pdf).replace(/\n/g, "\\n"),
          au_estado,
          resolucion,
        ].join("\t"),
      );
    }
    if (flatUpdated) {
      await writeFile(WILHELM_DE_COMMENTS_ANNA_DISPUTES_FLAT_TSV, `${outLines.join("\n")}\n`, "utf8");
    }
  } catch {
    /* flat optional */
  }

  const payload = {
    schemaVersion: "1.0.0",
    authority: "contenido_pdf",
    source: "Wilhelm DE 1924 Diederichs JPG 300 DPI",
    contract: join(WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR, "au-contract.json"),
    updatedAt: new Date().toISOString(),
    hexCount: Object.keys(hexagrams).length,
    sources,
    hexagrams,
    stats: {
      closedFields: 0,
      pendingFields: 0,
      disputeRowsClosed: 0,
      disputeRowsPending: compareRows.length,
    },
  };

  for (const entry of Object.values(hexagrams)) {
    for (const field of Object.values(entry.fields)) {
      if (isAuEstadoClosed(field.au_estado)) payload.stats.closedFields++;
      else payload.stats.pendingFields++;
    }
  }

  for (const row of compareRows) {
    const au = hexagrams[String(row.hex)]?.fields?.[row.field];
    if (au && isAuEstadoClosed(au.au_estado)) payload.stats.disputeRowsClosed++;
  }
  payload.stats.disputeRowsPending = compareRows.length - payload.stats.disputeRowsClosed;

  await mkdir(join(ROOT, "tools/output/fidelity-gold"), { recursive: true });
  await writeFile(WILHELM_DE_COMMENTS_AU_GOLD_JSON, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`AU gold: ${WILHELM_DE_COMMENTS_AU_GOLD_JSON}`);
  console.log(`Hex blocks: ${payload.hexCount}`);
  console.log(
    `Fields closed/pending: ${payload.stats.closedFields}/${payload.stats.pendingFields}`,
  );
  console.log(
    `Disputes closed: ${payload.stats.disputeRowsClosed}/${compareRows.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
