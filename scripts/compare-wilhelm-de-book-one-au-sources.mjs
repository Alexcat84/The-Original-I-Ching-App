#!/usr/bin/env node
/**
 * QA code: AU-FID-W-044 compare-wilhelm-de-book-one-au-sources · v1.0.0
 * Area: scripts/compare-wilhelm-de-book-one-au-sources.mjs
 * Family: FID-W
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { auTextsEqual } from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { parseWilhelmDeHexFromJpgPageMap } from "./lib/wilhelm-de-jpg-extract.mjs";
import { jpgPageRangeForBookOneHex, loadBookOneHexStarts } from "./lib/wilhelm-de-book-one-au-pilot-common.mjs";
import { WILHELM_MANUAL_FIELDS } from "./lib/wilhelm-manual-fields.mjs";
import { WILHELM_DE_BOOK_ONE_MERGED } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

function parseArgs(argv) {
  const hexArg = argv.find((a) => a.startsWith("--hex="));
  const raw = hexArg?.split("=")[1] ?? "1,2,8";
  const hexList = raw.split(",").map((s) => Number(s.trim()));
  return { hexList };
}

async function compareHex(hex, zenoMerged) {
  const hexStarts = loadBookOneHexStarts();
  const pageRange = jpgPageRangeForBookOneHex(hexStarts, hex);
  const parsed = await parseWilhelmDeHexFromJpgPageMap(hex);
  const pass03 = parsed.fields;
  const zeno = zenoMerged.hexagrams[String(hex)]?.fields ?? {};

  /** @type {object[]} */
  const diffs = [];
  let match = 0;
  for (const { key } of WILHELM_MANUAL_FIELDS) {
    const z = zeno[key] ?? "";
    const p = pass03[key] ?? "";
    if (auTextsEqual(z, p)) {
      match++;
    } else {
      diffs.push({
        field: key,
        zenoLen: z.length,
        pass03Len: p.length,
        zenoSnippet: z.slice(0, 80),
        pass03Snippet: p.slice(0, 80),
      });
    }
  }

  return {
    hex,
    pageRange,
    fieldsTotal: WILHELM_MANUAL_FIELDS.length,
    match,
    diff: diffs.length,
    diffs,
  };
}

async function main() {
  const { hexList } = parseArgs(process.argv);
  const zenoMerged = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  const results = [];
  for (const hex of hexList) {
    results.push(await compareHex(hex, zenoMerged));
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(REPORTS, `wilhelm-de-book-one-au-source-compare-${stamp}.json`);
  await mkdir(REPORTS, { recursive: true });
  const payload = { updatedAt: new Date().toISOString(), results };
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(payload, null, 2));
  console.error(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
