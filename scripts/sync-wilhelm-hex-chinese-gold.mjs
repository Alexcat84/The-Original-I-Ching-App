#!/usr/bin/env node
/**
 * Regenerate wilhelm-hex-chinese-gold.json from injector + book-one parsed headers.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_BOOK_ONE_PARSED_JSON } from "./lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "tools/datasets/wilhelm/wilhelm-hex-chinese-gold.json");

const inj = (await import("./iching_wilhelm_translation.mjs")).default;
const parsed = JSON.parse(readFileSync(WILHELM_BOOK_ONE_PARSED_JSON, "utf8"));

/** @type {Record<string, { chinese: string; chinese_roman: string; hex_font: string; pinyin: string; bookTitle: string }>} */
const hexagrams = {};

for (let n = 1; n <= 64; n++) {
  const key = String(n);
  const row = inj[key];
  const hex = parsed.hexagrams[key];
  if (!row) throw new Error(`Missing injector row ${n}`);
  if (!hex) throw new Error(`Missing parsed hex ${n}`);
  hexagrams[key] = {
    chinese: String(row.trad_chinese ?? ""),
    chinese_roman: hex.bookChinese,
    hex_font: String(row.hex_font ?? ""),
    pinyin: String(row.pinyin ?? ""),
    bookTitle: hex.bookTitle,
  };
}

const payload = {
  schemaVersion: 2,
  description:
    "Canonical hanzi + Unicode hex symbol + Wade-Giles roman for Wilhelm 64 hex names.",
  provenance: {
    chinese: "scripts/iching_wilhelm_translation.mjs → trad_chinese",
    hex_font: "scripts/iching_wilhelm_translation.mjs → hex_font (Unicode I Ching block)",
    chinese_roman: "Book I TXT header (Wade-Giles); EPUB hanzi are scan images, not extractable",
    bookTitle: "Book I TXT header (English Wilhelm title)",
    crossCheck: "scripts/iching_zhouyi_translation.mjs → name (64/64 vs trad_chinese)",
  },
  fields: {
    chinese: "Traditional hanzi — dataset field `chinese`",
    chinese_roman: "Wade-Giles — dataset field `chinese_roman`",
    hex_font: "Unicode hexagram glyph — dataset field `hex_font`",
    bookTitle: "English title — dataset field `nombre`",
  },
  hexagrams,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT} (64 hex)`);
