#!/usr/bin/env node
/**
 * Scan raw 64hex TXT for orphaned footnote digits vs parsed output after stripper.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_BOOK_ONE_PARSED_JSON } from "../scripts/lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(
  ROOT,
  "tools/source-pdfs/I Ching or Book of Changes (Bollingen Series), The - Wilhelm, Hellmut-64hex.txt",
);
const PARSED = WILHELM_BOOK_ONE_PARSED_JSON;

const raw = readFileSync(RAW, "utf8");
const parsed = JSON.parse(readFileSync(PARSED, "utf8"));

/** @type {Array<[RegExp, string]>} */
const patterns = [
  [/Furthering\d/g, "Furthering+digit (oracle)"],
  [/means:\d/g, "label: digit before means:"],
  [/THE LINES\d/g, "THE LINES+digit header"],
  [/(?<=[\p{L},])\d{1,2}(?=\s)/gu, "letter/comma + digit + space"],
  [/(?<=["])\d{1,2}(?=\s)/gu, "quote + digit + space"],
  [/(?<=\.)\d{1,2}(?=\s|$)/gu, "period + digit at EOL/space"],
  [/,\d{1,2}\]/g, "comma+digit+] (Wên Yen style)"],
];

console.log("=== RAW orphan footnote markers ===\n");
for (const [re, label] of patterns) {
  const matches = raw.match(re);
  console.log(`${matches?.length ?? 0}\t${label}`);
}

/** @type {string[]} */
const suspicious = [];
const checkRe =
  /Furthering\d|means:\d|,\d{1,2}\]|(?<=[\p{L},"])\d{1,2}\s|(?<=\.)\d{1,2}$/u;

for (const [n, h] of Object.entries(parsed.hexagrams)) {
  for (const [k, v] of Object.entries(h.fields)) {
    if (v && checkRe.test(v)) suspicious.push(`hex${n} ${k}`);
  }
}

console.log(`\nParsed fields with leftover markers: ${suspicious.length}`);
if (suspicious.length) console.log(suspicious.slice(0, 25).join("\n"));

const lines = raw.split("\n");
const blanks = lines.filter((l) => !l.trim()).length;
console.log(`\nLines: ${lines.length} | blank: ${blanks} (${((100 * blanks) / lines.length).toFixed(1)}%)`);
console.log(`Ends with closing NOTE: ${/Book of Changes is a book of the future/.test(raw)}`);
console.log(`Appendix Shuo Kua present: ${/Shuo Kua/i.test(raw)}`);
console.log(`Second-pass Wen Yen (a\)/b\)): ${/\n\s*a\)\s*\n/.test(raw)}`);
