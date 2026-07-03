#!/usr/bin/env node

/**
 * QA code: VF-FID-W-024 extract-wilhelm-de-from-jpg · v1.0.0
 * Area: scripts/extract-wilhelm-de-from-jpg.mjs
 * Family: FID-W
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_MANUAL_FIELDS, WILHELM_HEX_FIN } from "./lib/wilhelm-manual-fields.mjs";
import { parseWilhelmDeHexFromJpgPageMap } from "./lib/wilhelm-de-jpg-extract.mjs";
import { WILHELM_DE_BOOK_ONE_DIR } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GOLD_DIR = join(ROOT, "tools/manual-gold");
const REPORTS = join(ROOT, "reports");

function parseArgs(argv) {
  /** @type {{ hex: number[]; all: boolean; tsv: boolean }} */
  const out = { hex: [1, 2, 8], all: false, tsv: true };
  for (const arg of argv) {
    if (arg === "--all") out.all = true;
    if (arg === "--no-tsv") out.tsv = false;
    if (arg.startsWith("--hex=")) {
      out.hex = arg
        .slice(6)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => n >= 1 && n <= 64);
    }
  }
  if (out.all) out.hex = Array.from({ length: 64 }, (_, i) => i + 1);
  return out;
}

/**
 * @param {string} cell
 */
function tsvEscape(cell) {
  return String(cell ?? "").replace(/\t/g, " ").replace(/\r?\n/g, "\\n");
}

/**
 * @param {number} hex
 * @param {Record<string, string>} fields
 * @param {string} source
 */
async function writeGoldTsv(hex, fields, source) {
  const lines = ["campo\tcontenido_de\tfuente_captura"];
  for (const { key } of WILHELM_MANUAL_FIELDS) {
    lines.push(`${key}\t${tsvEscape(fields[key])}\t${source}`);
  }
  lines.push(`${WILHELM_HEX_FIN}\t\t`);
  const out = join(GOLD_DIR, `wilhelm-de-hex-${hex}.tsv`);
  await writeFile(out, `${lines.join("\n")}\n`, "utf8");
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await mkdir(WILHELM_DE_BOOK_ONE_DIR, { recursive: true });
  await mkdir(GOLD_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });

  /** @type {Record<string, object>} */
  const hexagrams = {};
  /** @type {string[]} */
  const errors = [];

  for (const hex of args.hex) {
    try {
      const parsed = await parseWilhelmDeHexFromJpgPageMap(hex);
      hexagrams[String(hex)] = {
        bookChinese: parsed.bookMeta.chinese,
        bookTitle: parsed.fields.nombre,
        bookHanzi: parsed.fields.chinese,
        bookHexFont: parsed.fields.hex_font,
        jpgPages: parsed.range.sourceLabel,
        jpgPaths: parsed.range.jpgPaths,
        pass03LineStart: parsed.pass03Span.lineStart,
        pass03LineEnd: parsed.pass03Span.lineEnd,
        fields: parsed.fields,
      };
      if (args.tsv) {
        const tsvPath = await writeGoldTsv(hex, parsed.fields, parsed.source);
        console.log(`hex ${hex}: gold TSV → ${tsvPath}`);
      }
      console.log(
        `hex ${hex}: PASS pages ${parsed.range.startBookPage}-${parsed.range.endBookPage} (${parsed.range.jpgPaths.length} JPG)`,
      );
    } catch (err) {
      errors.push(`hex ${hex}: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`hex ${hex}: FAIL — ${errors.at(-1)}`);
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outJson = join(WILHELM_DE_BOOK_ONE_DIR, `wilhelm-de-64hex-jpg-extract-${stamp}.json`);
  const latestJson = join(WILHELM_DE_BOOK_ONE_DIR, "wilhelm-de-64hex-jpg-extract-latest.json");

  const payload = {
    schemaVersion: "1.0.0",
    extractedAt: new Date().toISOString(),
    method: "jpg-page-map+pass03",
    hexCount: Object.keys(hexagrams).length,
    errors,
    hexagrams,
  };

  await writeFile(outJson, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(latestJson, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Wrote ${latestJson}`);
  if (errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
