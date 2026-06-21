#!/usr/bin/env node
/**
 * scan-zhouyi-corruption.mjs
 *
 * Deterministic corruption scanner for the generated Zhou Yi dataset.
 * Does NOT compare against any gold (avoids edition or 简/繁 false positives):
 * only detects objectively corrupt patterns.
 *
 * Detects:
 *  1. 咸→鹹 — 鹹 (salty) where 咸 (Xian) belongs; 鹹 never appears in canonical Zhou Yi.
 *  2. Position label leaked (初九：, 九五：, 用六：, ...) inside body text.
 *  3. Junk punctuation prefix at line start (，、：。;).
 *  4. Cross-hex contamination: identical line text in more than one hexagram.
 *  5. Empty judgment/name fields.
 *
 * Usage:
 *   node tools/scan-zhouyi-corruption.mjs
 *   node tools/scan-zhouyi-corruption.mjs --file packages/iching-data/src/generated/hexagrams.zhouyi.json
 * Exit 1 if any finding (CI gate).
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fileArg = process.argv.includes("--file")
  ? process.argv[process.argv.indexOf("--file") + 1]
  : "packages/iching-data/src/generated/hexagrams.zhouyi.json";

const data = JSON.parse(readFileSync(resolve(ROOT, fileArg), "utf8"));
const hexagrams = data.hexagrams ?? data;

const LABELS = "(初九|初六|九二|六二|九三|六三|九四|六四|九五|六五|上九|上六|用九|用六)";
const labelLeak = new RegExp(LABELS + "[：:，、]");
const punctPrefix = /^[\s\u3000，,、：:。.；;]/;

const findings = { salty: [], labelLeak: [], punctPrefix: [], crossHex: [], empty: [] };
const lineIndex = new Map();

for (const h of hexagrams) {
  for (const ln of h.lines ?? []) {
    const t = (ln.text ?? "").trim();
    if (!t) continue;
    if (!lineIndex.has(t)) lineIndex.set(t, []);
    lineIndex.get(t).push({ hex: h.number, pos: ln.position });
  }
}

for (const h of hexagrams) {
  const fields = [
    ["judgment", h.judgment ?? ""],
    ["image", h.image ?? ""],
    ["name", h.name ?? ""],
    ["chineseName", h.chineseName ?? ""],
    ...(h.lines ?? []).map((ln) => [`L${ln.position}`, ln.text ?? ""]),
  ];
  for (const [field, raw] of fields) {
    const v = raw ?? "";
    if (v.includes("鹹")) findings.salty.push({ hex: h.number, field, sample: v.slice(0, 40) });
    if (labelLeak.test(v)) findings.labelLeak.push({ hex: h.number, field, sample: v.slice(0, 60) });
    if (field.startsWith("L") && punctPrefix.test(v))
      findings.punctPrefix.push({ hex: h.number, field, sample: v.slice(0, 40) });
    if ((field === "judgment" || field === "name") && !v.trim())
      findings.empty.push({ hex: h.number, field });
  }
}

for (const [t, locs] of lineIndex) {
  const hexes = [...new Set(locs.map((l) => l.hex))];
  if (hexes.length > 1)
    findings.crossHex.push({ text: t.slice(0, 40), locs: locs.map((l) => `${l.hex}.L${l.pos}`) });
}

const groups = [
  ["咸→鹹 corrupción (salado)", findings.salty],
  ["Etiqueta de posición filtrada", findings.labelLeak],
  ["Prefijo de puntuación basura", findings.punctPrefix],
  ["Contaminación cruzada entre hexagramas", findings.crossHex],
  ["Campos vacíos", findings.empty],
];

let total = 0;
for (const [title, items] of groups) {
  console.log(`\n### ${title} (${items.length})`);
  for (const it of items) console.log("  ", JSON.stringify(it));
  total += items.length;
}
const corruptHexes = [
  ...new Set(
    [...findings.salty, ...findings.labelLeak, ...findings.punctPrefix].map((f) => f.hex)
      .concat(findings.crossHex.flatMap((f) => f.locs.map((l) => Number(l.split(".")[0])))),
  ),
].sort((a, b) => a - b);

console.log(`\nTOTAL incidencias: ${total}`);
console.log(`Hexagramas afectados: ${corruptHexes.join(", ") || "ninguno"}`);
process.exit(total === 0 ? 0 : 1);
