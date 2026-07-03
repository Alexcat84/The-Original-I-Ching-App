#!/usr/bin/env node
/**
 * QA code: AU-FID-W-016 validate-wilhelm-de-comments-au-gold · v1.0.0
 * Area: scripts/validate-wilhelm-de-comments-au-gold.mjs
 * Family: FID-W
 */
import { readFile } from "node:fs/promises";
import { buildAnnaCommentsAuDisputeRows } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import {
  buildPromotedCommentsFromAuGold,
  validateCommentsAuGoldForPromote,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  WILHELM_DE_COMMENTS_ANNA_RECONCILED,
  WILHELM_DE_COMMENTS_AU_GOLD_JSON,
} from "./lib/wilhelm-de-dataset-paths.mjs";

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const auGold = await loadJson(WILHELM_DE_COMMENTS_AU_GOLD_JSON);
  const pass02 = await loadJson(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02);
  const pass04 = await loadJson(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04);
  const reconciled = await loadJson(WILHELM_DE_COMMENTS_ANNA_RECONCILED);
  const disputeRows = buildAnnaCommentsAuDisputeRows(pass02, pass04);

  const validation = validateCommentsAuGoldForPromote(auGold, disputeRows);
  const dry = buildPromotedCommentsFromAuGold(auGold, reconciled, pass02, pass04, disputeRows);

  console.log("AU gold validate:", validation.ok ? "PASS" : "FAIL");
  if (validation.errors.length) {
    console.log("\nErrors (bloquean promote):");
    for (const e of validation.errors.slice(0, 20)) console.log(`  - ${e}`);
    if (validation.errors.length > 20) {
      console.log(`  … +${validation.errors.length - 20} más`);
    }
  }
  if (validation.warnings.length) {
    console.log("\nWarnings:");
    for (const w of validation.warnings.slice(0, 10)) console.log(`  - ${w}`);
  }

  console.log(`\nDry-run promote: ${dry.promotable ? "OK" : "BLOCKED"} (${dry.blocked.length} campos)`);
  if (dry.blocked.length && dry.blocked.length <= 15) {
    for (const b of dry.blocked) console.log(`  hex ${b.hex} ${b.field}: ${b.reason}`);
  }

  process.exit(validation.ok && dry.promotable ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
