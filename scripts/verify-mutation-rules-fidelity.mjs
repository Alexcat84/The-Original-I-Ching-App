/**
 * QA code: VF-FID-003 mutation-rules-fidelity · v1.0.0
 * Area: scripts/verify-mutation-rules-fidelity
 * Family: FID
 */

/**
 * QA: VF-MUT-001 (Docs/QA Registry)
 * Verifies that the mutation rules JSON bundles in @iching-oracle/iching-data
 * match the Tier-0 gold payloads field by field, guaranteeing 100% fidelity.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildHuangMutationRulesGold } from "./lib/huang-pdf-gold.mjs";
import { buildZhuxiAdlerMutationRulesGold } from "./lib/zhuxi-adler-pdf-gold.mjs";

const root = process.cwd();
const dataDir = join(root, "packages", "iching-data", "src", "generated");
const reportsDir = join(root, "reports");

async function assertNoLegacyRuleExplanationLiteral() {
  const enginePath = join(root, "packages", "iching-engine", "src", "engine.ts");
  const zhuxiPath = join(root, "packages", "iching-engine", "src", "rules", "zhuxi.ts");
  const [engineSrc, zhuxiSrc] = await Promise.all([
    readFile(enginePath, "utf8"),
    readFile(zhuxiPath, "utf8"),
  ]);
  const legacyPattern = /ruleExplanation\s*:/;
  const hits = [];
  if (legacyPattern.test(engineSrc)) hits.push(enginePath);
  if (legacyPattern.test(zhuxiSrc)) hits.push(zhuxiPath);
  if (hits.length > 0) {
    throw new Error(
      `Legacy ruleExplanation field assignment found in:\n${hits.join("\n")}`,
    );
  }
}

async function main() {
  await mkdir(reportsDir, { recursive: true });
  await assertNoLegacyRuleExplanationLiteral();

  const huangBundleRaw = await readFile(join(dataDir, "mutation-rules.huang.json"), "utf8");
  const huangBundle = JSON.parse(huangBundleRaw);

  const zhuxiBundleRaw = await readFile(join(dataDir, "mutation-rules.zhuxi.json"), "utf8");
  const zhuxiBundle = JSON.parse(zhuxiBundleRaw);

  const huangGold = buildHuangMutationRulesGold();
  const zhuxiGold = buildZhuxiAdlerMutationRulesGold();

  let pass = true;
  const errors = [];

  function assertEqual(system, id, field, actual, expected) {
    if (actual !== expected) {
      pass = false;
      errors.push(`${system} [${id}] mismatch on ${field}:\n  Expected: ${expected}\n  Actual:   ${actual}`);
    }
  }

  function verifyRules(system, bundleRules, goldRules) {
    if (bundleRules.length !== goldRules.length) {
      pass = false;
      errors.push(`${system} rule count mismatch: bundle=${bundleRules.length}, gold=${goldRules.length}`);
    }

    for (const goldRule of goldRules) {
      const bundleRule = bundleRules.find(r => r.id === goldRule.id);
      if (!bundleRule) {
        pass = false;
        errors.push(`${system} missing rule in bundle: ${goldRule.id}`);
        continue;
      }
      assertEqual(system, goldRule.id, "changingCount", bundleRule.changingCount, goldRule.changingCount);
      assertEqual(system, goldRule.id, "systemCode", bundleRule.systemCode, goldRule.systemCode);
      assertEqual(system, goldRule.id, "bookText", bundleRule.bookText, goldRule.bookText);
    }
  }

  verifyRules("huang", huangBundle.rules, huangGold);
  verifyRules("zhuxi", zhuxiBundle.rules, zhuxiGold);

  const report = {
    generatedAt: new Date().toISOString(),
    status: pass ? "PASS" : "FAIL",
    errors,
  };

  const reportPath = join(reportsDir, `mutation-rules-fidelity-${Date.now()}.json`);
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  if (!pass) {
    console.error("verify:mutation-rules-fidelity FAILED:");
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log("verify:mutation-rules-fidelity PASS (100% fidelity bundle ↔ gold)");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
