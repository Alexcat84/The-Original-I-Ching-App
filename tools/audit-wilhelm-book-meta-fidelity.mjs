#!/usr/bin/env node

/**
 * QA code: AU-FID-W-002 wilhelm-book-meta · v1.0.0
 * Area: tools/audit-wilhelm-book-meta-fidelity
 * Family: FID-W
 */

/**
 * Book-primary meta fidelity: cabecera TXT vs campos parseados vs bundle runtime.
 *
 * Usage:
 *   node tools/audit-wilhelm-book-meta-fidelity.mjs
 *   node tools/audit-wilhelm-book-meta-fidelity.mjs --dataset=comments
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_BOOK_ONE_PARSED_JSON,
  WILHELM_COMMENTS_PARSED_JSON,
} from "../scripts/lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");
const datasetArg = process.argv.find((a) => a.startsWith("--dataset="));
const dataset = datasetArg?.split("=")[1] ?? "book-one";
const PARSED =
  dataset === "comments" ? WILHELM_COMMENTS_PARSED_JSON : WILHELM_BOOK_ONE_PARSED_JSON;

const parsed = JSON.parse(readFileSync(PARSED, "utf8"));
const injMod = await import(
  new URL("../scripts/iching_wilhelm_translation.mjs", import.meta.url).href
);
const inj = injMod.default;

/** @type {Array<{ hex: string; bookTitle: string; bookChinese: string; bookHanzi: string; nombre: string; chinese: string; chinese_roman: string; injectorEnglish: string; injectorChinese: string; nombreMatchesBook: boolean; chineseRomanMatchesBook: boolean; chineseMatchesHanziGold: boolean; injectorEnglishDrift: boolean }>} */
const rows = [];

for (let n = 1; n <= 64; n++) {
  const key = String(n);
  const hex = parsed.hexagrams[key];
  if (!hex) continue;
  const f = hex.fields;
  const row = inj[key];
  const bookHanzi = hex.bookHanzi ?? row?.trad_chinese ?? "";
  rows.push({
    hex: key,
    bookTitle: hex.bookTitle,
    bookChinese: hex.bookChinese,
    bookHanzi,
    nombre: f.nombre,
    chinese: f.chinese,
    chinese_roman: f.chinese_roman ?? "",
    injectorEnglish: row?.english ?? "",
    injectorChinese: row?.trad_chinese ?? "",
    nombreMatchesBook: f.nombre === hex.bookTitle,
    chineseRomanMatchesBook: f.chinese_roman === hex.bookChinese,
    chineseMatchesHanziGold: f.chinese === bookHanzi,
    injectorEnglishDrift: f.nombre === hex.bookTitle && row?.english !== hex.bookTitle,
  });
}

const metaFail = rows.filter(
  (r) => !r.nombreMatchesBook || !r.chineseRomanMatchesBook || !r.chineseMatchesHanziGold,
);
const injectorDrift = rows.filter((r) => r.injectorEnglishDrift);

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const md = [
  `# Wilhelm book meta fidelity (${dataset})`,
  "",
  `- Parsed: \`${PARSED}\``,
  `- Generated: ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  `| Check | Result |`,
  `|-------|--------|`,
  `| nombre matches book title | **${rows.every((r) => r.nombreMatchesBook) ? "PASS" : "FAIL"}** |`,
  `| chinese_roman matches book header (Wade-Giles) | **${rows.every((r) => r.chineseRomanMatchesBook) ? "PASS" : "FAIL"}** |`,
  `| chinese (hanzi) matches gold trad_chinese | **${rows.every((r) => r.chineseMatchesHanziGold) ? "PASS" : "FAIL"}** |`,
  `| Bundle \`english\` differs from book title | **${injectorDrift.length}/64** (expected; product naming) |`,
  "",
  metaFail.length
    ? "## Meta mismatches (must be zero)\n\n" +
      metaFail
        .map(
          (r) =>
            `- Hex ${r.hex}: nombre=\`${r.nombre}\` bookTitle=\`${r.bookTitle}\`; chinese=\`${r.chinese}\` gold=\`${r.bookHanzi}\`; chinese_roman=\`${r.chinese_roman}\` bookChinese=\`${r.bookChinese}\``,
        )
        .join("\n")
    : "",
  "",
  "## Bundle vs book title (injector drift — not auto-fixed)",
  "",
  "| Hex | Book title (Wilhelm) | Bundle `english` |",
  "|-----|----------------------|-------------------|",
  ...rows
    .filter((r) => r.injectorEnglish !== r.bookTitle)
    .map(
      (r) =>
        `| ${r.hex} | ${r.bookTitle.replace(/\|/g, "\\|")} | ${r.injectorEnglish.replace(/\|/g, "\\|")} |`,
    ),
  "",
  "## Hanzi source",
  "",
  "Book TXT/EPUB headers carry Wade-Giles (`chinese_roman`), not extractable hanzi. Dataset `chinese` comes from `scripts/iching_wilhelm_translation.mjs` → `trad_chinese`, cross-checked vs Zhou Yi / ctext. See `tools/datasets/wilhelm/wilhelm-hex-chinese-gold.json`.",
  "",
].join("\n");

mkdirSync(REPORTS, { recursive: true });
const outMd = join(REPORTS, `wilhelm-book-meta-fidelity-${dataset}-${stamp}.md`);
const outLatest = join(REPORTS, `wilhelm-book-meta-fidelity-${dataset}-latest.md`);
writeFileSync(outMd, md, "utf8");
writeFileSync(outLatest, md, "utf8");

console.log(`Dataset: ${dataset}`);
console.log(`Meta vs book: ${metaFail.length === 0 ? "PASS" : "FAIL"} (${metaFail.length} mismatches)`);
console.log(`Injector english drift from book: ${injectorDrift.length}/64`);
console.log(`Report: ${outLatest}`);

if (metaFail.length) process.exitCode = 1;
