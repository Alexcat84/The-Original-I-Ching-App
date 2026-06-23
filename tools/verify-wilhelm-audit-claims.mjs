#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { WILHELM_MANUAL_FIELDS } from "../scripts/lib/wilhelm-manual-fields.mjs";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "../scripts/lib/wilhelm-comments-manual-fields.mjs";

const book = JSON.parse(
  readFileSync("tools/datasets/wilhelm/book-one/wilhelm-64hex-parsed.json", "utf8"),
);
const comments = JSON.parse(
  readFileSync("tools/datasets/wilhelm/comments/wilhelm-64hex-comments-parsed.json", "utf8"),
);

function countTrigramSpellings(ds) {
  const stats = {
    LI_FIRE: 0,
    LI_FLAME: 0,
    WIND_comma: 0,
    WIND_no_comma: 0,
    Sun_lower: 0,
    CHEN: new Map(),
    KEN: new Map(),
  };
  for (let n = 1; n <= 64; n++) {
    for (const col of ["trigrama_arriba", "trigrama_abajo"]) {
      const v = ds.hexagrams[String(n)].fields[col] || "";
      if (/\bFIRE\b/.test(v) && /\bLI\b/.test(v)) stats.LI_FIRE++;
      if (/\bFLAME\b/.test(v) && /\bLI\b/.test(v)) stats.LI_FLAME++;
      if (/WIND,/.test(v)) stats.WIND_comma++;
      if (/\bWIND\b/.test(v) && !/WIND,/.test(v)) stats.WIND_no_comma++;
      if (/\bSun\b/.test(v) && !/\bSUN\b/.test(v)) stats.Sun_lower++;
      for (const tok of v.split(/\s+/)) {
        if (/^CH[êe]N,?$/.test(tok)) {
          const k = tok.replace(/,$/, "");
          stats.CHEN.set(k, (stats.CHEN.get(k) || 0) + 1);
        }
        if (/^K[êe]N,?$/.test(tok)) {
          const k = tok.replace(/,$/, "");
          stats.KEN.set(k, (stats.KEN.get(k) || 0) + 1);
        }
      }
    }
  }
  return stats;
}

function auditBook() {
  const fieldCount = WILHELM_MANUAL_FIELDS.length;
  console.log("BOOK-ONE fields:", fieldCount, "+ hex_fin =", fieldCount + 1);
  console.log("Expected CSV rows:", (fieldCount + 1) * 64);

  const emptyMandatory = [];
  const dupNames = new Map();
  for (let n = 1; n <= 64; n++) {
    const f = book.hexagrams[String(n)].fields;
    if (dupNames.has(f.nombre)) dupNames.get(f.nombre).push(n);
    else dupNames.set(f.nombre, [n]);
    for (const k of ["intro", "judgment_oraculo", "image_oraculo", "chinese", "hex_font", "nombre"]) {
      if (!String(f[k] ?? "").trim()) emptyMandatory.push({ n, k });
    }
    for (let p = 1; p <= 6; p++) {
      for (const k of [`L${p}_etiqueta`, `L${p}_oraculo`]) {
        if (!String(f[k] ?? "").trim()) emptyMandatory.push({ n, k });
      }
    }
  }
  console.log("Hex order 1-64:", [...Array(64)].every((_, i) => book.hexagrams[String(i + 1)]));
  console.log("Duplicate nombres:", [...dupNames.entries()].filter(([, a]) => a.length > 1));
  console.log("Empty mandatory fields:", emptyMandatory.length);
  console.log("yong_oraculo filled:", [1, 2].filter((n) => book.hexagrams[String(n)].fields.yong_oraculo?.trim()).length, "/2");
  console.log("yong_oraculo in hex 3-64:", [3, 4, 5].every((n) => !book.hexagrams[String(n)].fields.yong_oraculo?.trim()));
  console.log("Trigram stats:", countTrigramSpellings(book));
}

function auditComments() {
  const fieldCount = WILHELM_COMMENTS_MANUAL_FIELDS.length;
  console.log("\nCOMMENTS fields:", fieldCount, "+ hex_fin =", fieldCount + 1);
  console.log("Expected CSV rows:", (fieldCount + 1) * 64, "(+1 header =", (fieldCount + 1) * 64 + 1, ")");

  const roman = new Map();
  const seqEmpty = [];
  for (let n = 1; n <= 64; n++) {
    const h = comments.hexagrams[String(n)];
    const r = h.fields.chinese_roman;
    if (!roman.has(r)) roman.set(r, []);
    roman.get(r).push(n);
    if (!h.fields.sequence?.trim()) seqEmpty.push(n);
  }
  console.log("sequence empty hex:", seqEmpty);
  console.log("Duplicate chinese_roman:", [...roman.entries()].filter(([, a]) => a.length > 1));
  console.log("wen_yen filled hex:", [...Array(64)].map((_, i) => i + 1).filter((n) => comments.hexagrams[String(n)].fields.wen_yen?.trim()));
  console.log("yong filled hex:", [...Array(64)].map((_, i) => i + 1).filter((n) => comments.hexagrams[String(n)].fields.yong_a_oraculo?.trim()));
  console.log("Trigram stats:", countTrigramSpellings(comments));
}

auditBook();
auditComments();
