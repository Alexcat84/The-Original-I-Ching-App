#!/usr/bin/env node
/**
 * Build packages/iching-data/src/generated/trigrams.json — the single source
 * of truth for the 8 trigram glyph + pinyin pairs shown in the Library UI.
 *
 * Only the hanzi is a hand-maintained constant (the 8 trigram characters are
 * fixed classical constants, not translator-specific content). `pinyin` is
 * derived from the hanzi via pinyin-pro at build time, never hand-typed —
 * eliminates the duplicate hardcoded pinyin that used to live directly in
 * apps/web/src/lib/library/trigram-meta.ts with no audit trail.
 *
 * `wilhelmLabel` is the join key the Library UI uses to map a hexagram's
 * Wilhelm-sourced trigram label (e.g. "THE CREATIVE") to one of these 8
 * canonical entries — see trigramIdFromWilhelmLabel in trigram-meta.ts.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pinyin } from "pinyin-pro";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "packages/iching-data/src/generated/trigrams.json");

const SEED = [
  { id: "heaven", chinese: "乾", wilhelmLabel: "THE CREATIVE" },
  { id: "earth", chinese: "坤", wilhelmLabel: "THE RECEPTIVE" },
  { id: "water", chinese: "坎", wilhelmLabel: "THE ABYSMAL" },
  { id: "thunder", chinese: "震", wilhelmLabel: "THE AROUSING" },
  { id: "mountain", chinese: "艮", wilhelmLabel: "KEEPING STILL" },
  { id: "wind", chinese: "巽", wilhelmLabel: "THE GENTLE" },
  { id: "lake", chinese: "兌", wilhelmLabel: "THE JOYOUS" },
  { id: "fire", chinese: "離", wilhelmLabel: "THE CLINGING" },
];

function derivePinyin(hanzi) {
  return pinyin(hanzi, { toneType: "symbol", v: true }).replace(/\s+/g, "");
}

const trigrams = SEED.map((t) => ({ ...t, pinyin: derivePinyin(t.chinese) }));

for (const t of trigrams) {
  if (!t.pinyin) throw new Error(`pinyin-pro returned empty pinyin for ${t.id} (${t.chinese})`);
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify({ trigrams }, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT} (${trigrams.length} trigrams)`);
