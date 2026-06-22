#!/usr/bin/env node
/**
 * Extract Zhu Xi (Adler) ch. IV mutation rules from local PDF → JSON gold.
 *
 * Usage:
 *   node tools/extract-zhuxi-adler-pdf.mjs [--force]
 */
import { writeZhuxiAdlerGold, ZHUXI_ADLER_GOLD_PATH } from "../scripts/lib/zhuxi-adler-pdf-gold.mjs";

const force = process.argv.includes("--force");

async function main() {
  console.log("Extracting Zhu Xi / Adler ch. IV mutation rules…");
  const payload = await writeZhuxiAdlerGold({ force });
  const found = payload.extractChecks.filter((c) => c.found).length;
  const total = payload.extractChecks.length;
  console.log(`Wrote ${ZHUXI_ADLER_GOLD_PATH}`);
  console.log(`Extract verification: ${found}/${total} rule snippets found in PDF core text`);
  for (const c of payload.extractChecks.filter((x) => !x.found)) {
    console.warn(`  [miss] ${c.id}`);
  }
  const exact = payload.rules.filter((r) => r.systemMatch === "exact").length;
  const partial = payload.rules.filter((r) => r.systemMatch === "partial").length;
  const ni = payload.rules.filter((r) => r.systemMatch === "not_implemented").length;
  console.log(`System alignment: ${exact} exact, ${partial} partial, ${ni} not implemented (32 charts)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
