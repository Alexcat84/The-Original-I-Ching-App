#!/usr/bin/env node

/**
 * QA code: VF-FID-W-022 promote-wilhelm-de-parsed-v2 · v1.0.0
 * Area: scripts/promote-wilhelm-de-parsed-v2.mjs
 * Family: FID-W
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_DE_BOOK_ONE_BLANK,
  WILHELM_DE_BOOK_ONE_PARSED_V2,
} from "./lib/wilhelm-de-dataset-paths.mjs";
import { runWilhelmDeFieldSplitG2 } from "./lib/validate-wilhelm-de-field-split-g2.mjs";
import { WILHELM_MANUAL_FIELDS } from "./lib/wilhelm-manual-fields.mjs";
import { buildWilhelmBaynesDeRows, summarizeWilhelmBaynesDeRows } from "./lib/wilhelm-baynes-de-field-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

async function main() {
  const v2 = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_PARSED_V2, "utf8"));
  const blank = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_BLANK, "utf8"));
  const g2 = await runWilhelmDeFieldSplitG2();

  /** @type {Record<string, { filled: number; total: number }>} */
  const fillByHex = {};
  let totalFilled = 0;
  let totalPaste = 0;

  for (let n = 1; n <= 64; n++) {
    const v2f = v2.hexagrams[String(n)]?.fields ?? {};
    let filled = 0;
    let total = 0;
    for (const { key, paste } of WILHELM_MANUAL_FIELDS) {
      if (!paste) continue;
      total++;
      if (String(v2f[key] ?? "").trim()) filled++;
    }
    fillByHex[String(n)] = { filled, total };
    totalFilled += filled;
    totalPaste += total;
  }

  const rows = await buildWilhelmBaynesDeRows({ deMaestroPath: WILHELM_DE_BOOK_ONE_PARSED_V2 });
  const summary = summarizeWilhelmBaynesDeRows(rows);

  const report = {
    generatedAt: new Date().toISOString(),
    g2,
    fillProgress: {
      totalFilled,
      totalPaste,
      pct: Math.round((1000 * totalFilled) / totalPaste) / 10,
      byHex: fillByHex,
    },
    enDeSummary: summary,
    note: "parsed-v2 not promoted to runtime; merged.json unchanged until AU closure",
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = join(REPORTS, `wilhelm-de-parsed-v2-promotion-${stamp}.json`);
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`G2 pilot split: ${g2.pass ? "PASS" : "FAIL"} (${g2.matched}/${g2.checked})`);
  console.log(`V2 fill: ${totalFilled}/${totalPaste} (${report.fillProgress.pct}%)`);
  console.log(`EN↔DE pair: ${summary.pair} · en_only: ${summary.en_only} · de_only: ${summary.de_only}`);
  console.log(`Report: ${out}`);

  if (!g2.pass) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
