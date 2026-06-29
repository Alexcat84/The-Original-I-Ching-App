#!/usr/bin/env node
/**
 * QA code: VF-FID-W-015 wilhelm-de-runtime-smoke · v1.0.0
 * Area: tools/wilhelm-de-runtime-smoke.mjs
 * Family: FID-W
 *
 * Post-build smoke: dist bundle names + trigram join keys used by library/overlay.
 */
import { getAllHexagramRecords, getHexagramRecordByNumber, trigramIdFromWilhelmLabel } from "@iching-oracle/iching-data";

const EXPECTED_NAMES = new Map([
  [1, "DAS SCHÖPFERISCHE"],
  [56, "DER WANDERER"],
  [64, "VOR DER VOLLENDUNG"],
]);

let failed = 0;

for (const [num, expected] of EXPECTED_NAMES) {
  const record = getHexagramRecordByNumber(num, { translator: "wilhelm" });
  if (record.name !== expected) {
    console.error(`G-runtime hex ${num}: expected name "${expected}", got "${record.name}"`);
    failed++;
  }
}

for (const record of getAllHexagramRecords({ translator: "wilhelm" })) {
  try {
    trigramIdFromWilhelmLabel(record.upperTrigram);
    trigramIdFromWilhelmLabel(record.lowerTrigram);
  } catch (err) {
    console.error(`G-runtime hex ${record.number} trigram: ${err instanceof Error ? err.message : err}`);
    failed++;
  }
}

if (failed === 0) {
  console.log("wilhelm-de-runtime-smoke PASS");
} else {
  console.error(`wilhelm-de-runtime-smoke FAIL (${failed} checks)`);
}
process.exit(failed === 0 ? 0 : 1);
