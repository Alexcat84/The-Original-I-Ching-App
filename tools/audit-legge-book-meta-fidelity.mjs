#!/usr/bin/env node
/**
 * Legge book-primary meta fidelity: TXT header vs parsed fields vs canonical zhouyi glyphs.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { leggeBookTitleToChineseRoman } from "../scripts/lib/legge-txt-clean.mjs";
import { LEGGE_BOOK_ONE_PARSED_JSON } from "../scripts/lib/legge-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");
const PARSED = LEGGE_BOOK_ONE_PARSED_JSON;

const parsed = JSON.parse(readFileSync(PARSED, "utf8"));
const zhouyi = (
  await import(new URL("../scripts/iching_zhouyi_translation.mjs", import.meta.url).href)
).default;

/** @type {string[]} */
const errors = [];

for (let n = 1; n <= 64; n++) {
  const key = String(n);
  const hex = parsed.hexagrams[key];
  const f = hex?.fields;
  const z = zhouyi[key];
  if (!hex || !f || !z) {
    errors.push(`hex ${n}: missing parsed or zhouyi row`);
    continue;
  }
  const expectedRoman = leggeBookTitleToChineseRoman(hex.bookTitle);
  if (f.nombre !== hex.bookTitle) {
    errors.push(`hex ${n}: nombre != bookTitle`);
  }
  if (f.chinese_roman !== expectedRoman) {
    errors.push(`hex ${n}: chinese_roman "${f.chinese_roman}" != "${expectedRoman}"`);
  }
  if (f.chinese !== z.name) {
    errors.push(`hex ${n}: chinese "${f.chinese}" != zhouyi "${z.name}"`);
  }
  if (f.hex_font !== z.hex_font) {
    errors.push(`hex ${n}: hex_font "${f.hex_font}" != zhouyi "${z.hex_font}"`);
  }
}

const md = [
  "# Legge book-one meta fidelity",
  "",
  `- Parsed: \`${PARSED}\``,
  `- Generated: ${new Date().toISOString()}`,
  "",
  errors.length ? `**FAIL** (${errors.length} errors)` : "**PASS** — nombre, chinese_roman, chinese, hex_font aligned",
  "",
  ...(errors.length ? errors.map((e) => `- ${e}`) : []),
].join("\n");

mkdirSync(REPORTS, { recursive: true });
writeFileSync(join(REPORTS, "legge-book-meta-fidelity-latest.md"), md, "utf8");

console.log(errors.length ? `Meta fidelity: FAIL (${errors.length})` : "Meta fidelity: PASS (64/64)");
if (errors.length) {
  for (const e of errors.slice(0, 10)) console.log(`  ${e}`);
  process.exitCode = 1;
}
