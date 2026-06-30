#!/usr/bin/env node
/**
 * QA code: VF-FID-W-032 validate-wilhelm-de-comments-anna-gate · v1.0.0
 * Area: scripts/validate-wilhelm-de-comments-anna-gate.mjs
 * Family: FID-W
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  diffWilhelmDeCommentsAnnaPasses,
  validateWilhelmDeCommentsAnnaExtract,
} from "./lib/wilhelm-de-comments-anna-extract.mjs";
import { validateWilhelmDeCommentsAnnaReconciled } from "./lib/wilhelm-de-comments-anna-reconcile.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_MANIFEST,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
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

  const v02 = validateWilhelmDeCommentsAnnaExtract(pass02);
  const v04 = validateWilhelmDeCommentsAnnaExtract(pass04);
  const dual = diffWilhelmDeCommentsAnnaPasses(pass02, pass04);

  /** @type {{ ok: boolean; coverage?: { fillLabel: string }; errors: string[] } | null} */
  let reconciledValidation = null;
  try {
    const reconciled = await loadJson(WILHELM_DE_COMMENTS_ANNA_RECONCILED);
    reconciledValidation = validateWilhelmDeCommentsAnnaReconciled(reconciled);
  } catch {
    reconciledValidation = null;
  }

  console.log("Wilhelm DE comments Anna gate (G-anna)");
  console.log(`  Pass 02 coverage: ${v02.coverage.fillLabel} · G0 ${v02.g0.ok ? "PASS" : "FAIL"}`);
  console.log(`  Pass 04 coverage: ${v04.coverage.fillLabel} · G0 ${v04.g0.ok ? "PASS" : "FAIL"}`);
  console.log(
    `  Dual-pass identical fields: ${dual.identicalFields}/${dual.comparableFields} (${(dual.identicalRatio * 100).toFixed(1)}%)`,
  );
  console.log(`  Dual-pass differing fields: ${dual.differingFieldCount}`);
  if (reconciledValidation) {
    console.log(
      `  Reconciled coverage: ${reconciledValidation.coverage?.fillLabel ?? "?"} · G0 ${reconciledValidation.ok ? "PASS" : "FAIL"}`,
    );
  } else {
    console.log("  Reconciled: (missing — run reconcile:wilhelm-de-comments-from-anna)");
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const report = [
    "# Wilhelm DE comments Anna gate (G-anna)",
    "",
    `- Manifest: \`${WILHELM_DE_COMMENTS_ANNA_MANIFEST}\``,
    "",
    "## Pass 02",
    `- Coverage: ${v02.coverage.fillLabel}`,
    `- G0: ${v02.g0.ok ? "PASS" : "FAIL"}`,
    v02.errors.length ? v02.errors.map((e) => `- ${e}`).join("\n") : "- No structural errors",
    "",
    "## Pass 04",
    `- Coverage: ${v04.coverage.fillLabel}`,
    `- G0: ${v04.g0.ok ? "PASS" : "FAIL"}`,
    v04.errors.length ? v04.errors.map((e) => `- ${e}`).join("\n") : "- No structural errors",
    "",
    "## Dual-pass diff (02 vs 04)",
    `- Identical: ${dual.identicalFields}/${dual.comparableFields}`,
    `- Differing: ${dual.differingFieldCount}`,
    "",
    "Sample diffs (length only):",
    ...dual.differingFieldsSample.map(
      (d) => `- hex ${d.hex} ${d.field}: pass02=${d.passA} chars, pass04=${d.passB} chars`,
    ),
    "",
    reconciledValidation
      ? `## Reconciled\n- Coverage: ${reconciledValidation.coverage?.fillLabel ?? "?"}\n- G0: ${reconciledValidation.ok ? "PASS" : "FAIL"}`
      : "## Reconciled\n- (not generated yet)",
    "",
    "## Verdict",
    "",
    v02.g0.ok && v04.g0.ok
      ? "**SANDBOX STRUCTURE OK** — pending AU before promote to merged maestro."
      : "**STRUCTURE ISSUES** — fix parser/markers before AU.",
    "",
  ].join("\n");

  const reportPath = join(REPORTS, `wilhelm-de-comments-anna-gate-${stamp}.md`);
  await import("node:fs/promises").then(({ mkdir, writeFile }) =>
    Promise.all([
      mkdir(REPORTS, { recursive: true }),
      writeFile(reportPath, `${report}\n`, "utf8"),
    ]),
  );

  console.log(`Report: ${reportPath}`);

  if (!v02.g0.ok || !v04.g0.ok || (reconciledValidation && !reconciledValidation.ok)) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
