#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { cleanWilhelmTxtText, WILHELM_APPENDIX_TXT_PATH } from "./lib/wilhelm-txt-clean.mjs";

const isMain = process.argv[1]?.endsWith("clean-wilhelm-appendix-txt.mjs");
if (isMain) {
  const dryRun = process.argv.includes("--dry-run");
  const before = readFileSync(WILHELM_APPENDIX_TXT_PATH, "utf8");
  const after = cleanWilhelmTxtText(before);
  console.log(`Source: ${WILHELM_APPENDIX_TXT_PATH}`);
  console.log(`Bytes: ${before.length} → ${after.length} (${after.length - before.length})`);
  if (!dryRun) {
    writeFileSync(WILHELM_APPENDIX_TXT_PATH, after, "utf8");
    console.log("Written.");
  }
}
