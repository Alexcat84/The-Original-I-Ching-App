#!/usr/bin/env node
/**
 * QA code: AU-FID-W-029 scan-wilhelm-de-pilot-real-artifacts · v1.0.0
 * Area: scripts/scan-wilhelm-de-pilot-real-artifacts.mjs
 * Family: FID-W
 *
 * Scan contenido_pdf in pilot TSVs for OCR/back-matter artifacts (post JPG AU).
 */
import { parseAnnaCommentsAuVerticalTsv } from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["chinese", "hex_font"]);

/** @type {Array<object>} */
const issues = [];
for (let h = 1; h <= 64; h++) {
  const doc = parseAnnaCommentsAuVerticalTsv(
    readFileSync(join(ROOT, `tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-hex-${h}-pilot-au.tsv`), "utf8"),
  );
  for (const [key, field] of Object.entries(doc.fields)) {
    if (SKIP.has(key) || field.au_estado === "vacio_en_libro") continue;
    const pdf = field.contenido_pdf ?? "";
    if (!pdf.trim()) continue;
    const checks = [
      [/VERZEICHNIS|NIFAL|INHALT\s*\n|DRUCK DER HOFBUCHDRUCKEREI/i, "back_matter"],
      [/iẞt|MiBerfolg|ryearzu|\bauf Mann\b|GroBem|Entsprediens|Zeidiens|Dadurdi|fünfist/i, "ocr_typo"],
      [/[\u0400-\u04FF]/u, "cyrillic"],
      [/[\u0900-\u097F]/u, "devanagari"],
      [/\n[\u4e00-\u9fff\u200b\u2060\s]{1,8}\s*$/u, "trailing_cjk_line"],
      [/\n[a-zäöüß]{1,2}\s*$/u, "trailing_orphan_latin"],
      [/\n[^\n]*[\u4e00-\u9fff][^\n]*[\u0900-\u097F]/u, "mixed_script_garbage"],
    ];
    for (const [re, label] of checks) {
      if (re.test(pdf)) {
        issues.push({ hex: h, field: key, issue: label, sample: pdf.slice(-120).replace(/\n/g, " | ") });
        break;
      }
    }
  }
}
console.log(JSON.stringify({ count: issues.length, issues }, null, 2));
