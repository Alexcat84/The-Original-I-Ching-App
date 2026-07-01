#!/usr/bin/env node
/**
 * QA code: AU-FID-W-030 scan-wilhelm-de-pilot-artifacts · v1.0.0
 * Area: scripts/scan-wilhelm-de-pilot-artifacts.mjs
 * Family: FID-W
 *
 * Broad artifact scan (includes expected CJK in chinese field).
 */
/** Scan contenido_pdf in pilot TSVs for known OCR artifacts. */
import { parseAnnaCommentsAuVerticalTsv } from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "tools/manual-gold/wilhelm-de-comments-au");

const patterns = [
  [/VERZEICHNIS/i, "VERZEICHNIS"],
  [/NIFAL/i, "NIFAL"],
  [/INHALT\s*\n/i, "INHALT_bleed"],
  [/iẞt/, "iẞt"],
  [/MiBerfolg/, "MiBerfolg"],
  [/auf Mann/, "auf_Mann"],
  [/ryearzu/, "ryearzu"],
  [/[\u0400-\u04FF]/u, "cyrillic"],
  [/[\u4e00-\u9fff]/u, "cjk"],
  [/\n[^\n]{0,2}\s*$/u, "orphan_tail"],
  [/\n•\s*\n/u, "bullet_noise"],
  [/\n-\s*\n-\s*$/u, "dash_noise"],
];

/** @type {Array<object>} */
const bad = [];
for (let h = 1; h <= 64; h++) {
  const path = join(DIR, `wilhelm-de-comments-hex-${h}-pilot-au.tsv`);
  const doc = parseAnnaCommentsAuVerticalTsv(readFileSync(path, "utf8"));
  for (const [key, field] of Object.entries(doc.fields)) {
    const pdf = field.contenido_pdf ?? "";
    if (!pdf.trim() || field.au_estado === "vacio_en_libro") continue;
    for (const [re, label] of patterns) {
      if (re.test(pdf)) {
        bad.push({
          hex: h,
          field: key,
          issue: label,
          tail: pdf.slice(-100).replace(/\n/g, " ↵ "),
        });
        break;
      }
    }
  }
}

const out = join(ROOT, "reports", `wilhelm-de-pilot-artifact-scan-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
mkdirSync(join(ROOT, "reports"), { recursive: true });
writeFileSync(out, JSON.stringify({ count: bad.length, issues: bad }, null, 2));
console.log(`Artifact scan: ${bad.length} fields flagged`);
console.log(`Report: ${out}`);
for (const b of bad.slice(0, 30)) {
  console.log(`  hex ${b.hex} ${b.field}: ${b.issue}`);
}
