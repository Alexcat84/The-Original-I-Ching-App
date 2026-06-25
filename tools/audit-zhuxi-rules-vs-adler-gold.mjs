#!/usr/bin/env node

/**
 * QA code: AU-MUT-002 zhuxi-rules-vs-adler-gold · v1.0.0
 * Area: tools/audit-zhuxi-rules-vs-adler-gold
 * Family: MUT
 */

/**
 * Audit iching-engine Zhu Xi rules against Adler PDF gold.
 *
 * Usage:
 *   node tools/audit-zhuxi-rules-vs-adler-gold.mjs
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadZhuxiAdlerGoldOrThrow } from "../scripts/lib/zhuxi-adler-pdf-gold.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Expected engine behavior keyed by changing-count (non-special). */
const ENGINE_MATRIX = [
  { n: 0, code: "ZX_ZERO", reads: "primary judgment" },
  { n: 1, code: "ZX_ONE", reads: "1 primary line" },
  { n: 2, code: "ZX_TWO_UPPER", reads: "2 primary lines, upper primary" },
  { n: 3, code: "ZX_THREE_JUDGMENTS", reads: "both judgments, emphasis rule" },
  { n: 4, code: "ZX_FOUR_LOWER", reads: "2 stable transformed lines, lower primary" },
  { n: 5, code: "ZX_FIVE_ONLY", reads: "1 stable transformed line" },
  { n: 6, code: "ZX_SIX_TRANSFORMED", reads: "transformed judgment (non Q/K)" },
];

async function main() {
  const gold = await loadZhuxiAdlerGoldOrThrow();
  console.log("=== Zhu Xi Adler gold vs engine ===\n");
  console.log(`Source: ${gold.source}`);
  console.log(`Page map: printed 48 → PDF ${gold.pageMapping.printedToPdf[48]}`);
  console.log(`${gold.pageMapping.calibrationNote}\n`);

  const extractOk = gold.extractChecks.every((c) => c.found);
  console.log(
    extractOk
      ? `[PASS] All ${gold.extractChecks.length} rule snippets verified in PDF extract`
      : `[FAIL] Missing snippets: ${gold.extractChecks.filter((c) => !c.found).map((c) => c.id).join(", ")}`,
  );

  console.log("\n--- Rule alignment ---");
  for (const rule of gold.rules) {
    const icon =
      rule.systemMatch === "exact" ? "✓" : rule.systemMatch === "partial" ? "~" : "○";
    console.log(`${icon} [${rule.systemMatch}] ${rule.id} → ${rule.systemCode}`);
    if (rule.systemMatchNote) console.log(`    ${rule.systemMatchNote}`);
  }

  console.log("\n--- Critical footnotes ---");
  for (const [num, fn] of Object.entries(gold.footnotes)) {
    console.log(`  ${num}: ${fn.topic}`);
  }

  console.log("\n--- Engine matrix (count → code) ---");
  for (const row of ENGINE_MATRIX) {
    const goldRule = gold.rules.find((r) => r.changingCount === row.n && !r.specialHexagrams);
    const match = goldRule?.systemCode?.includes(row.code) ?? false;
    console.log(`  ${row.n} changing → ${row.code} ${match ? "[gold ok]" : "[check]"}`);
  }

  console.log("\n--- Running iching-engine line-reading tests ---");
  try {
    execSync("npx vitest run src/engine.line-reading-systems.test.ts", {
      cwd: join(root, "packages", "iching-engine"),
      stdio: "inherit",
    });
    console.log("\n[PASS] engine.line-reading-systems.test.ts");
  } catch {
    console.error("\n[FAIL] engine.line-reading-systems.test.ts");
    process.exit(1);
  }

  const blockers = gold.rules.filter((r) => r.systemMatch === "not_implemented");
  if (blockers.length) {
    console.log(
      `\n[INFO] ${blockers.length} book rule(s) intentionally not implemented (32-chart lookup). Documented in gold.`,
    );
  }

  if (!extractOk) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
