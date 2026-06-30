#!/usr/bin/env node

/**
 * QA code: VF-FID-W-015 wilhelm-de-runtime-smoke · v1.0.0
 * Area: tools/wilhelm-de-runtime-smoke.mjs
 * Family: FID-W
 */

import { getAllHexagramRecords, getHexagramRecordByNumber, trigramIdFromWilhelmLabel } from "@iching-oracle/iching-data";

const EXPECTED_NAMES = new Map([
  [1, "DAS SCHÖPFERISCHE"],
  [9, "DES KLEINEN ZÄHMUNGSKRAFT"],
  [13, "GEMEINSCHAFT MIT MENSCHEN"],
  [26, "DES GROSSEN ZÄHMUNGSKRAFT"],
  [28, "DES GROSSEN ÜBERGEWICHT"],
  [34, "DES GROSSEN MACHT"],
  [36, "DIE VERFINSTERUNG DES LICHTS"],
  [54, "DAS HEIRATENDE MÄDCHEN"],
  [56, "DER WANDERER"],
  [62, "DES KLEINEN ÜBERGEWICHT"],
  [64, "VOR DER VOLLENDUNG"],
]);

/** Runtime Wilhelm DE titles are uppercase German book headings, not Baynes Title Case. */
function looksLikeBaynesTitleCase(name) {
  return /[a-z]/.test(String(name ?? ""));
}

let failed = 0;

for (const record of getAllHexagramRecords({ translator: "wilhelm" })) {
  if (looksLikeBaynesTitleCase(record.name)) {
    console.error(
      `G-runtime hex ${record.number}: name looks like English Title Case: "${record.name}"`,
    );
    failed++;
  }
}

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
