#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanLeggeTxtText, LEGGE_64HEX_TXT_PATH } from "./lib/legge-txt-clean.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = LEGGE_64HEX_TXT_PATH;
const OUT = SRC;

const raw = readFileSync(SRC, "utf8");
const cleaned = cleanLeggeTxtText(raw);
if (cleaned !== raw.replace(/\r\n/g, "\n")) {
  writeFileSync(OUT, cleaned, "utf8");
  console.log("Normalized typography in", OUT);
} else {
  console.log("No cleanup changes needed:", OUT);
}
