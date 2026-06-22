#!/usr/bin/env node
/**
 * Audit iching-engine Huang rules against Alfred Huang PDF gold.
 *
 * Usage:
 *   node tools/audit-huang-rules-vs-pdf-gold.mjs
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadHuangGoldOrThrow } from "../scripts/lib/huang-pdf-gold.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const ENGINE_MATRIX = [
  { n: 0, code: "NO_CHANGING" },
  { n: 1, code: "ONE_CHANGING" },
  { n: 2, codes: ["TWO_YIN_YANG", "TWO_SAME_LOWER"] },
  { n: 3, code: "THREE_MIDDLE" },
  { n: 4, code: "FOUR_LOWEST_STABLE" },
  { n: 5, code: "FIVE_ONLY_STABLE" },
  { n: 6, codes: ["SIX_ALL_CHANGING", "QIAN_ALL_NINE", "KUN_ALL_SIX"] },
];

async function main() {
  const gold = await loadHuangGoldOrThrow();
  console.log("=== Huang PDF gold vs engine ===\n");
  console.log(`Source: ${gold.source}`);
  console.log(`PDF range: ${gold.pageMapping.corePdfRange.join("–")}`);
  console.log(`${gold.pageMapping.calibrationNote}\n`);

  const extractOk = gold.extractChecks.every((c) => c.found);
  console.log(
    extractOk
      ? `[PASS] All ${gold.extractChecks.length} rule snippets verified in PDF extract`
      : `[FAIL] Missing: ${gold.extractChecks.filter((c) => !c.found).map((c) => c.id).join(", ")}`,
  );

  console.log("\n--- Rule alignment ---");
  for (const rule of gold.rules) {
    const icon =
      rule.systemMatch === "exact" ? "✓" : rule.systemMatch === "equivalent" ? "~" : "○";
    console.log(`${icon} [${rule.systemMatch}] ${rule.id} → ${rule.systemCode}`);
    if (rule.systemMatchNote) console.log(`    ${rule.systemMatchNote}`);
    if (rule.engineChangeRequired) {
      console.log("    ⚠ ENGINE CHANGE REQUIRED before altering behavior");
    }
  }

  console.log("\n--- Engine matrix ---");
  for (const row of ENGINE_MATRIX) {
    const codes = row.codes ?? [row.code];
    console.log(`  ${row.n} changing → ${codes.join(" | ")}`);
  }

  console.log("\n--- Running iching-engine mutation tests ---");
  try {
    execSync("npx vitest run src/engine.mutation-rules.test.ts src/engine.line-reading-systems.test.ts", {
      cwd: join(root, "packages", "iching-engine"),
      stdio: "inherit",
    });
    console.log("\n[PASS] mutation + line-reading tests");
  } catch {
    console.error("\n[FAIL] engine tests");
    process.exit(1);
  }

  const equiv = gold.rules.filter((r) => r.systemMatch === "equivalent");
  if (equiv.length) {
    console.log(
      `\n[INFO] ${equiv.length} rule(s) marked equivalent — review notes before any prompt/motor change.`,
    );
  }

  if (!extractOk) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
