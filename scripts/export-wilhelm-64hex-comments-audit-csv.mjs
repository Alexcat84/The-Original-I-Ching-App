#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWilhelmCommentsVerticalBlock,
  WILHELM_COMMENTS_MANUAL_FIELDS,
} from "../scripts/lib/wilhelm-comments-manual-fields.mjs";
import { WILHELM_COMMENTS_PARSED_JSON } from "../scripts/lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARSED = WILHELM_COMMENTS_PARSED_JSON;
const OUT_DIR = join(ROOT, "reports");

function csvEscape(cell) {
  const s = String(cell ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(cells) {
  return cells.map(csvEscape).join(",");
}

function main() {
  const parsed = JSON.parse(readFileSync(PARSED, "utf8"));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  /** @type {string[][]} */
  const rows = [["campo", "contenido_txt"]];
  for (let n = 1; n <= 64; n++) {
    const fields = parsed.hexagrams[String(n)]?.fields;
    if (!fields) throw new Error(`Missing parsed comments hex ${n}`);
    rows.push(...buildWilhelmCommentsVerticalBlock(fields));
  }

  const csv = `\uFEFF${rows.map(csvRow).join("\r\n")}`;
  mkdirSync(OUT_DIR, { recursive: true });
  const latest = join(OUT_DIR, "wilhelm-64hex-comments-audit-latest.csv");
  const dated = join(OUT_DIR, `wilhelm-64hex-comments-audit-${stamp}.csv`);
  writeFileSync(latest, csv, "utf8");
  writeFileSync(dated, csv, "utf8");

  console.log(`Fields per hex: ${WILHELM_COMMENTS_MANUAL_FIELDS.length}`);
  console.log(`Latest: ${latest}`);
}

main();
