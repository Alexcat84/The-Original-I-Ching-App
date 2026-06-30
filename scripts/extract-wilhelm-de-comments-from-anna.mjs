#!/usr/bin/env node
/**
 * QA code: VF-FID-W-031 extract-wilhelm-de-comments-from-anna · v1.0.0
 * Area: scripts/extract-wilhelm-de-comments-from-anna.mjs
 * Family: FID-W
 *
 * Parse Drittes Buch (Ten Wings) from Anna TXT passes 02/04 into isolated sandbox JSON.
 * Does NOT write wilhelm-de-64hex-comments-merged.json or touch OCR lock blocked paths.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseWilhelmDe64HexCommentsTxtFull } from "./lib/wilhelm-de-64hex-comments-txt.mjs";
import {
  buildWilhelmDeCommentsAnnaExport,
  computeWilhelmDeCommentsAnnaCoverage,
  validateWilhelmDeCommentsAnnaExtract,
} from "./lib/wilhelm-de-comments-anna-extract.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_COVERAGE,
  WILHELM_DE_COMMENTS_ANNA_DIR,
  WILHELM_DE_COMMENTS_ANNA_MANIFEST,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  WILHELM_DE_STITCHED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

const PASS_CONFIG = {
  "02": {
    sourcePath: WILHELM_DE_STITCHED.bookThreePass02,
    outPath: WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  },
  "04": {
    sourcePath: WILHELM_DE_STITCHED.bookThreePass04,
    outPath: WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  },
};

/**
 * @param {"02"|"04"} pass
 */
async function extractPass(pass) {
  const cfg = PASS_CONFIG[pass];
  const parsed = await parseWilhelmDe64HexCommentsTxtFull(cfg.sourcePath);
  const payload = buildWilhelmDeCommentsAnnaExport(parsed, {
    pass,
    sourcePath: cfg.sourcePath,
  });
  const validation = validateWilhelmDeCommentsAnnaExtract(payload);

  await mkdir(WILHELM_DE_COMMENTS_ANNA_DIR, { recursive: true });
  await writeFile(cfg.outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  return { pass, cfg, payload, validation };
}

async function main() {
  const passArg = process.argv.find((a) => a.startsWith("--pass="));
  const passRaw = passArg?.split("=")[1] ?? "all";
  const passes =
    passRaw === "all" ? /** @type {const} */ (["02", "04"]) : /** @type {const} */ ([passRaw]);

  /** @type {Awaited<ReturnType<typeof extractPass>>[]} */
  const results = [];
  for (const pass of passes) {
    if (!PASS_CONFIG[pass]) {
      console.error(`Unknown pass: ${pass}. Use 02, 04, or all.`);
      process.exit(1);
    }
    console.log(`Extracting Anna pass ${pass}…`);
    results.push(await extractPass(pass));
  }

  const stamp = new Date().toISOString();
  const coverageByPass = Object.fromEntries(
    results.map((r) => [r.pass, r.validation.coverage]),
  );

  const manifest = {
    schemaVersion: "1.0.0",
    updatedAt: stamp,
    sandbox: WILHELM_DE_COMMENTS_ANNA_DIR,
    runtimeIngest: false,
    passes: results.map((r) => ({
      pass: r.pass,
      source: r.cfg.sourcePath,
      outPath: r.cfg.outPath,
      headerCount: r.payload.headerCount,
      fillLabel: r.validation.coverage.fillLabel,
      g0Ok: r.validation.g0.ok,
      errorCount: r.validation.errors.length,
    })),
    coverageByPass,
    nextSteps: [
      "npm run validate:wilhelm-de-comments-anna-gate",
      "AU campo a campo vs PDF físico antes de promote",
      "Dual-pass diff 02 vs 04 antes de merge a maestro oficial",
    ],
  };

  await writeFile(WILHELM_DE_COMMENTS_ANNA_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(
    WILHELM_DE_COMMENTS_ANNA_COVERAGE,
    `${JSON.stringify({ updatedAt: stamp, coverageByPass }, null, 2)}\n`,
    "utf8",
  );

  await mkdir(REPORTS, { recursive: true });
  const reportLines = [
    "# Wilhelm DE comments — Anna sandbox extract",
    "",
    `- Updated: ${stamp}`,
    `- Sandbox: \`${WILHELM_DE_COMMENTS_ANNA_DIR}\``,
    "",
  ];

  let exitCode = 0;
  for (const r of results) {
    console.log(`\nPass ${r.pass}:`);
    console.log(`  Wrote ${r.cfg.outPath}`);
    console.log(`  Coverage: ${r.validation.coverage.fillLabel} (${(r.validation.coverage.fillRatio * 100).toFixed(1)}%)`);
    console.log(`  G0 structure: ${r.validation.g0.ok ? "PASS" : "FAIL"} (${r.validation.errors.length} issues)`);

    reportLines.push(`## Pass ${r.pass}`, "");
    reportLines.push(`- Source: \`${r.cfg.sourcePath}\``);
    reportLines.push(`- Output: \`${r.cfg.outPath}\``);
    reportLines.push(`- Coverage: **${r.validation.coverage.fillLabel}**`);
    reportLines.push(`- G0: ${r.validation.g0.ok ? "**PASS**" : "**FAIL**"}`);
    if (r.validation.errors.length) {
      reportLines.push("", "Issues:", ...r.validation.errors.slice(0, 30).map((e) => `- ${e}`));
      if (!r.validation.g0.ok) exitCode = 1;
    }
    reportLines.push("");
  }

  const reportPath = join(
    REPORTS,
    `wilhelm-de-comments-anna-extract-${stamp.replace(/[:.]/g, "-")}.md`,
  );
  await writeFile(reportPath, `${reportLines.join("\n")}\n`, "utf8");
  console.log(`\nManifest: ${WILHELM_DE_COMMENTS_ANNA_MANIFEST}`);
  console.log(`Report: ${reportPath}`);

  if (exitCode) process.exitCode = exitCode;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
