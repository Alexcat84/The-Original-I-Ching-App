#!/usr/bin/env node
/**
 * QA code: VF-FID-W-012 merge-wilhelm-de-dual-pass · v1.0.0
 * Area: scripts/merge-wilhelm-de-dual-pass.mjs
 * Family: FID-W
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAndMergeWilhelmDeDualPass } from "./lib/wilhelm-de-dual-pass-merge.mjs";
import {
  WILHELM_DE_BOOK_ONE_DIR,
  WILHELM_DE_BOOK_ONE_MERGED,
  WILHELM_DE_BOOK_ONE_PARSED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PASS01 = join(WILHELM_DE_BOOK_ONE_DIR, "wilhelm-de-64hex-parsed-pass01.json");
const PASS03 = WILHELM_DE_BOOK_ONE_PARSED;
const checkOnly = process.argv.includes("--check");

async function main() {
  const merged = loadAndMergeWilhelmDeDualPass(PASS01, PASS03);
  await mkdir(WILHELM_DE_BOOK_ONE_DIR, { recursive: true });
  await writeFile(WILHELM_DE_BOOK_ONE_MERGED, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

  const reportPath = join(ROOT, "reports", `wilhelm-de-dual-pass-merge-${Date.now()}.json`);
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        mergedPath: WILHELM_DE_BOOK_ONE_MERGED,
        disputeCount: merged.disputeCount,
        sampleDisputes: merged.disputes.slice(0, 30),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`Wrote ${WILHELM_DE_BOOK_ONE_MERGED}`);
  console.log(`Disputes: ${merged.disputeCount}`);

  if (checkOnly && merged.disputeCount > 0) {
    console.error("--check failed: unresolved disputes remain (informational; merged uses heuristics)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
