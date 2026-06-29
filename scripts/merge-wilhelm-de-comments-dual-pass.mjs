#!/usr/bin/env node
/**
 * QA code: VF-FID-W-016 merge-wilhelm-de-comments-dual-pass · v1.0.0
 * Area: scripts/merge-wilhelm-de-comments-dual-pass.mjs
 * Family: FID-W
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAndMergeWilhelmDeCommentsDualPass } from "./lib/wilhelm-de-comments-dual-pass-merge.mjs";
import {
  WILHELM_DE_COMMENTS_DIR,
  WILHELM_DE_COMMENTS_MERGED,
  WILHELM_DE_COMMENTS_PARSED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PASS02 = WILHELM_DE_COMMENTS_PARSED;
const PASS04 = join(WILHELM_DE_COMMENTS_DIR, "wilhelm-de-64hex-comments-parsed-pass04.json");

async function main() {
  const merged = loadAndMergeWilhelmDeCommentsDualPass(PASS02, PASS04);
  await mkdir(WILHELM_DE_COMMENTS_DIR, { recursive: true });
  await writeFile(WILHELM_DE_COMMENTS_MERGED, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

  const reportPath = join(ROOT, "reports", `wilhelm-de-comments-dual-pass-merge-${Date.now()}.json`);
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        mergedPath: WILHELM_DE_COMMENTS_MERGED,
        disputeCount: merged.disputeCount,
        sampleDisputes: merged.disputes.slice(0, 30),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`Wrote ${WILHELM_DE_COMMENTS_MERGED}`);
  console.log(`Disputes: ${merged.disputeCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
