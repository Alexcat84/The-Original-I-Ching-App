#!/usr/bin/env node
/**
 * Extract Alfred Huang mutation rules from local PDF → JSON gold.
 *
 * Usage:
 *   node tools/extract-huang-pdf.mjs [--force]
 */
import { writeHuangGold, HUANG_GOLD_PATH } from "../scripts/lib/huang-pdf-gold.mjs";

const force = process.argv.includes("--force");

async function main() {
  console.log("Extracting Huang mutation rules (Master Yin method)…");
  const payload = await writeHuangGold({ force });
  const found = payload.extractChecks.filter((c) => c.found).length;
  const total = payload.extractChecks.length;
  console.log(`Wrote ${HUANG_GOLD_PATH}`);
  console.log(`Extract verification: ${found}/${total} rule snippets found in PDF core text`);
  for (const c of payload.extractChecks.filter((x) => !x.found)) {
    console.warn(`  [miss] ${c.id}`);
  }
  const exact = payload.rules.filter((r) => r.systemMatch === "exact").length;
  const equiv = payload.rules.filter((r) => r.systemMatch === "equivalent").length;
  console.log(`System alignment: ${exact} exact, ${equiv} equivalent`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
