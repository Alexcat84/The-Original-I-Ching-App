#!/usr/bin/env node
/** One-off gate: every hex 1-64 must have unique chineseName and hex_font per translator source. */
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function loadDefault(rel) {
  const mod = await import(pathToFileURL(join(root, rel)).href);
  return mod.default;
}

const zhouyi = await loadDefault("scripts/iching_zhouyi_translation.mjs");
const wilhelm = await loadDefault("scripts/iching_wilhelm_translation.mjs");

function dupes(dataset, key) {
  const m = new Map();
  for (let n = 1; n <= 64; n++) {
    const v = String(dataset[String(n)]?.[key] ?? "").trim();
    if (!v) continue;
    if (!m.has(v)) m.set(v, []);
    m.get(v).push(n);
  }
  return [...m.entries()].filter(([, nums]) => nums.length > 1);
}

const bundle = JSON.parse(
  readFileSync(join(root, "packages/iching-data/src/generated/hexagrams.zhouyi.json"), "utf8"),
);

console.log("=== Zhou Yi source (iching_zhouyi_translation.mjs) ===");
console.log("dup hex_font:", dupes(zhouyi, "hex_font"));
console.log("dup name:", dupes(zhouyi, "name"));

console.log("\n=== Wilhelm source (structural hex_font) ===");
console.log("dup hex_font:", dupes(wilhelm, "hex_font"));
console.log("dup trad_chinese:", dupes(wilhelm, "trad_chinese"));

console.log("\n=== Zhou Yi bundle ===");
const bn = new Map();
const bc = new Map();
for (const h of bundle.hexagrams) {
  for (const [m, k] of [
    [bn, h.chineseName],
    [bc, h.name],
  ]) {
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(h.number);
  }
}
console.log(
  "dup chineseName:",
  [...bn.entries()].filter(([, a]) => a.length > 1),
);
console.log(
  "dup name field:",
  [...bc.entries()].filter(([, a]) => a.length > 1),
);

// 咸 vs 鹹 in names
for (let n of [19, 31, 32, 34]) {
  const s = zhouyi[String(n)];
  console.log(`\nHex ${n}: name=${s?.name} font=${s?.hex_font} J=${s?.zhouyi_judgment?.text?.slice(0, 20)}`);
}
