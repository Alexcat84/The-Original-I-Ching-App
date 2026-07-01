#!/usr/bin/env node
/**
 * Build packages/iching-data/src/generated/trigrams.json — the single source
 * of truth for the 8 trigram glyph + pinyin pairs shown in the Library UI.
 *
 * `wilhelmLabel` is the canonical Wilhelm DE join key (1924 Diederichs). Legacy
 * Baynes EN and OCR aliases live in scripts/lib/wilhelm-trigram-labels.mjs and
 * are resolved via trigramIdFromWilhelmLabel in @iching-oracle/iching-data.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pinyin } from "pinyin-pro";
import { WILHELM_TRIGRAMS } from "./lib/wilhelm-trigram-labels.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "packages", "iching-data", "src", "generated", "trigrams.json");

function derivePinyin(hanzi) {
  return pinyin(hanzi, { toneType: "symbol", v: true }).replace(/\s+/g, "");
}

const trigrams = WILHELM_TRIGRAMS.map((t) => ({
  id: t.id,
  chinese: t.chinese,
  wilhelmLabel: t.wilhelmLabel,
  aliases: t.aliases,
  pinyin: derivePinyin(t.chinese),
}));

for (const t of trigrams) {
  if (!t.pinyin) throw new Error(`pinyin-pro returned empty pinyin for ${t.id} (${t.chinese})`);
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify({ trigrams }, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT} (${trigrams.length} trigrams)`);
