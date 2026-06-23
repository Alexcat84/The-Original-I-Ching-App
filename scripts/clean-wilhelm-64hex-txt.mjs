#!/usr/bin/env node
/**
 * In-place cleanup of Wilhelm 64-hex TXT: normalize typography + strip orphan footnote digits.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { cleanWilhelmTxtText, WILHELM_64HEX_TXT_PATH } from "./lib/wilhelm-txt-clean.mjs";

export { cleanWilhelmTxtText };

const isMain = process.argv[1]?.endsWith("clean-wilhelm-64hex-txt.mjs");
if (isMain) {
  const dryRun = process.argv.includes("--dry-run");
  const before = readFileSync(WILHELM_64HEX_TXT_PATH, "utf8");
  const after = cleanWilhelmTxtText(before);

  /** @type {number} */
  let changedLines = 0;
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  for (let i = 0; i < Math.max(beforeLines.length, afterLines.length); i++) {
    if (beforeLines[i] !== afterLines[i]) changedLines++;
  }

  console.log(`Source: ${WILHELM_64HEX_TXT_PATH}`);
  console.log(`Lines changed: ${changedLines}`);
  console.log(`Bytes: ${before.length} → ${after.length} (${after.length - before.length})`);

  if (!dryRun) {
    writeFileSync(WILHELM_64HEX_TXT_PATH, after, "utf8");
    console.log("Written.");
  } else {
    console.log("Dry run — file not written.");
  }
}
