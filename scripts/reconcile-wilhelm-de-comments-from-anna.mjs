#!/usr/bin/env node
/**
 * QA code: VF-FID-W-034 reconcile-wilhelm-de-comments-from-anna · v1.0.0
 * Area: scripts/reconcile-wilhelm-de-comments-from-anna.mjs
 * Family: FID-W
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { reconcileWilhelmDeCommentsAnnaPasses } from "./lib/wilhelm-de-comments-anna-reconcile.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_MANIFEST,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  WILHELM_DE_COMMENTS_ANNA_RECONCILE_REPORT,
  WILHELM_DE_COMMENTS_ANNA_RECONCILED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const pass02 = await loadJson(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02);
  const pass04 = await loadJson(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04);

  const result = reconcileWilhelmDeCommentsAnnaPasses(pass02, pass04);
  const stamp = new Date().toISOString();

  await mkdir(dirname(WILHELM_DE_COMMENTS_ANNA_RECONCILED), { recursive: true });
  await writeFile(
    WILHELM_DE_COMMENTS_ANNA_RECONCILED,
    `${JSON.stringify(result.payload, null, 2)}\n`,
    "utf8",
  );

  const report = {
    updatedAt: stamp,
    reconciledPath: WILHELM_DE_COMMENTS_ANNA_RECONCILED,
    disputeCount: result.disputes.length,
    compareSummary: result.compareSummary,
    coverage: result.coverage,
    g0Ok: result.g0.ok,
    g0Errors: result.g0.errors,
    sampleDisputes: result.disputes.slice(0, 50),
  };

  await writeFile(
    WILHELM_DE_COMMENTS_ANNA_RECONCILE_REPORT,
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  const manifest = await loadJson(WILHELM_DE_COMMENTS_ANNA_MANIFEST).catch(() => ({
    schemaVersion: "1.0.0",
    passes: [],
  }));
  manifest.updatedAt = stamp;
  manifest.reconciled = {
    path: WILHELM_DE_COMMENTS_ANNA_RECONCILED,
    reportPath: WILHELM_DE_COMMENTS_ANNA_RECONCILE_REPORT,
    disputeCount: result.disputes.length,
    coverage: result.coverage.fillLabel,
    g0Ok: result.g0.ok,
    compareSummary: result.compareSummary,
  };
  manifest.nextSteps = [
    "npm run export:wilhelm-de-comments-anna-comparison-viewer",
    "AU campo a campo vs PDF físico (disputas primero)",
    "Promote a comments-merged solo tras AU",
  ];
  await writeFile(WILHELM_DE_COMMENTS_ANNA_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  await mkdir(REPORTS, { recursive: true });
  const mdPath = join(
    REPORTS,
    `wilhelm-de-comments-anna-reconcile-${stamp.replace(/[:.]/g, "-")}.md`,
  );
  const md = [
    "# Wilhelm DE comments Anna reconcile (fase C)",
    "",
    `- Reconciled: \`${WILHELM_DE_COMMENTS_ANNA_RECONCILED}\``,
    `- Coverage: **${result.coverage.fillLabel}** (${(result.coverage.fillRatio * 100).toFixed(1)}%)`,
    `- G0: ${result.g0.ok ? "**PASS**" : "**FAIL**"}`,
    `- Disputes: **${result.disputes.length}**`,
    "",
    "## Compare summary",
    "",
    `- Identical: ${result.compareSummary.identical}`,
    `- Disputed: ${result.compareSummary.disputed}`,
    `- Pass02 only: ${result.compareSummary.pass02Only}`,
    `- Pass04 only: ${result.compareSummary.pass04Only}`,
    "",
  ].join("\n");
  await writeFile(mdPath, `${md}\n`, "utf8");

  console.log(`Wrote ${WILHELM_DE_COMMENTS_ANNA_RECONCILED}`);
  console.log(`Disputes: ${result.disputes.length}`);
  console.log(`Coverage: ${result.coverage.fillLabel}`);
  console.log(`G0: ${result.g0.ok ? "PASS" : "FAIL"}`);
  console.log(`Compare identical: ${result.compareSummary.identical}/${result.compareSummary.rowCount}`);
  console.log(`Report: ${mdPath}`);

  if (!result.g0.ok) {
    for (const e of result.g0.errors.slice(0, 20)) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
