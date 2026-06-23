#!/usr/bin/env node
/**
 * Gate: Wilhelm dataset meta (names + hanzi + hex symbols) vs gold + Zhou Yi.
 *
 * Usage: node tools/audit-wilhelm-hex-meta-gate.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_BOOK_ONE_PARSED_JSON,
  WILHELM_COMMENTS_PARSED_JSON,
} from "../scripts/lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GOLD = join(ROOT, "tools/datasets/wilhelm/wilhelm-hex-chinese-gold.json");
const REPORTS = join(ROOT, "reports");

const inj = (await import("../scripts/iching_wilhelm_translation.mjs")).default;
const zy = (await import("../scripts/iching_zhouyi_translation.mjs")).default;
const book = JSON.parse(readFileSync(WILHELM_BOOK_ONE_PARSED_JSON, "utf8"));
const comments = JSON.parse(readFileSync(WILHELM_COMMENTS_PARSED_JSON, "utf8"));
const gold = JSON.parse(readFileSync(GOLD, "utf8"));

/** @type {string[]} */
const errors = [];

/**
 * @param {string} dataset
 * @param {Record<string, { bookTitle: string; bookChinese: string; bookHanzi?: string; bookHexFont?: string; fields: Record<string, string> }>} hexagrams
 */
function checkDataset(dataset, hexagrams) {
  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const row = inj[key];
    const g = gold.hexagrams[key];
    const hex = hexagrams[key];
    const prefix = `${dataset} hex ${n}`;

    if (!hex) {
      errors.push(`${prefix}: missing`);
      continue;
    }
    if (!row) {
      errors.push(`${prefix}: missing injector`);
      continue;
    }
    if (!g) {
      errors.push(`${prefix}: missing gold`);
      continue;
    }

    const f = hex.fields;
    const expectedHanzi = row.trad_chinese;
    const expectedFont = row.hex_font;
    const expectedRoman = hex.bookChinese;
    const expectedTitle = hex.bookTitle;

    if (row.trad_chinese !== zy[key]?.name) {
      errors.push(`${prefix}: injector vs zhouyi hanzi`);
    }
    if (g.chinese !== expectedHanzi) {
      errors.push(`${prefix}: gold chinese mismatch`);
    }
    if (g.chinese_roman !== expectedRoman) {
      errors.push(`${prefix}: gold roman mismatch`);
    }
    if (g.hex_font !== expectedFont) {
      errors.push(`${prefix}: gold hex_font mismatch`);
    }
    if (g.bookTitle !== expectedTitle) {
      errors.push(`${prefix}: gold bookTitle mismatch`);
    }

    if (f.nombre !== expectedTitle) {
      errors.push(`${prefix}: nombre "${f.nombre}" != "${expectedTitle}"`);
    }
    if (f.chinese !== expectedHanzi) {
      errors.push(`${prefix}: chinese "${f.chinese}" != "${expectedHanzi}"`);
    }
    if (f.chinese_roman !== expectedRoman) {
      errors.push(`${prefix}: chinese_roman "${f.chinese_roman}" != "${expectedRoman}"`);
    }
    if (f.hex_font !== expectedFont) {
      errors.push(`${prefix}: hex_font "${f.hex_font}" != "${expectedFont}"`);
    }
  }
}

checkDataset("book-one", book.hexagrams);
checkDataset("comments", comments.hexagrams);

const pass = errors.length === 0;
const md = [
  "# Wilhelm hex meta gate",
  "",
  `- Generated: ${new Date().toISOString()}`,
  `- Gold: \`${GOLD}\``,
  `- Book-one: \`${WILHELM_BOOK_ONE_PARSED_JSON}\``,
  `- Comments: \`${WILHELM_COMMENTS_PARSED_JSON}\``,
  "",
  "## Result",
  "",
  pass ? "**PASS** — 64×2 datasets; nombre, chinese, chinese_roman, hex_font aligned." : `**FAIL** — ${errors.length} issue(s)`,
  "",
  pass
    ? ""
    : "## Errors\n\n" + errors.map((e) => `- ${e}`).join("\n"),
  "",
  "## Meta contract",
  "",
  "| Field | Source |",
  "|-------|--------|",
  "| `nombre` | Book TXT English title |",
  "| `chinese` | `trad_chinese` (Zhou Yi / ctext verified) |",
  "| `chinese_roman` | Book TXT Wade-Giles header |",
  "| `hex_font` | Unicode I Ching symbol from injector |",
  "",
].join("\n");

mkdirSync(REPORTS, { recursive: true });
const latest = join(REPORTS, "wilhelm-hex-meta-gate-latest.md");
writeFileSync(latest, md, "utf8");

console.log(pass ? "PASS: Wilhelm hex meta gate (128 checks)" : `FAIL: ${errors.length} errors`);
console.log(`Report: ${latest}`);
if (!pass) {
  errors.slice(0, 15).forEach((e) => console.error(e));
  process.exitCode = 1;
}
