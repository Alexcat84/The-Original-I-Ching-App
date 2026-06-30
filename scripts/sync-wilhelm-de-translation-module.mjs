#!/usr/bin/env node

/**
 * QA code: VF-FID-W-013 sync-wilhelm-de-translation-module · v1.0.0
 * Area: scripts/sync-wilhelm-de-translation-module.mjs
 * Family: FID-W
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { WILHELM_DE_BOOK_ONE_MERGED } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT = join(ROOT, "scripts/iching_wilhelm_de_translation.mjs");
const BAYNES = join(ROOT, "scripts/iching_wilhelm_translation.baynes.mjs");

/**
 * @param {string} intro
 * @param {"above"|"below"} which
 */
function parseTrigramFromIntro(intro, which) {
  const re = new RegExp(`^${which}\\s+([^,\\n]+),\\s*(.+)$`, "im");
  const m = String(intro ?? "").match(re);
  if (!m) return null;
  const namePart = m[1].trim();
  const rest = m[2].trim();
  const comma = rest.indexOf(",");
  if (comma >= 0) {
    return {
      chinese: namePart.toUpperCase(),
      symbolic: `${rest.slice(0, comma).trim()},`,
      alchemical: rest.slice(comma + 1).trim().toUpperCase(),
    };
  }
  return {
    chinese: namePart.toUpperCase(),
    symbolic: `${rest},`,
    alchemical: "",
  };
}

/**
 * @param {string} s
 */
function jsString(s) {
  return JSON.stringify(String(s ?? ""));
}

async function main() {
  const merged = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  const baynes = (await import(pathToFileURL(BAYNES).href)).default;

  /** @type {string[]} */
  const lines = [
    "// Oracle text synced from Wilhelm DE 1924 (Diederichs) maestro — zeno.org extract, oracle slots only.",
    "// Hanzi + hex_font from Zhou Yi standard; binary/pinyin from Baynes structural archive.",
    "// Translator runtime id: wilhelm (German Wilhelm original, not Baynes EN).",
    "",
    "export default {",
  ];

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const b = baynes[key];
    const f = merged.hexagrams[key]?.fields;
    if (!b || !f) throw new Error(`Missing hex ${n}`);

    const above = parseTrigramFromIntro(f.intro, "oben") ?? b.wilhelm_above;
    const below = parseTrigramFromIntro(f.intro, "unten") ?? b.wilhelm_below;

    lines.push(`  "${key}": {`);
    lines.push(`    "hex": ${n},`);
    lines.push(`    "hex_font": ${jsString(f.hex_font || b.hex_font)},`);
    lines.push(`    "trad_chinese": ${jsString(f.chinese || b.trad_chinese)},`);
    lines.push(`    "pinyin": ${jsString(b.pinyin)},`);
    lines.push(`    "english": ${jsString(f.nombre || b.english)},`);
    lines.push(`    "binary": ${typeof b.binary === "number" ? b.binary : jsString(b.binary)},`);
    lines.push(`    "od": ${jsString(b.od)},`);
    lines.push(`    "wilhelm_above": {`);
    lines.push(`      "chinese": ${jsString(above.chinese)},`);
    lines.push(`      "symbolic": ${jsString(above.symbolic)},`);
    lines.push(`      "alchemical": ${jsString(above.alchemical)}`);
    lines.push(`    },`);
    lines.push(`    "wilhelm_below": {`);
    lines.push(`      "chinese": ${jsString(below.chinese)},`);
    lines.push(`      "symbolic": ${jsString(below.symbolic)},`);
    lines.push(`      "alchemical": ${jsString(below.alchemical)}`);
    lines.push(`    },`);
    lines.push(`    "wilhelm_symbolic": ${jsString(f.intro)},`);
    lines.push(`    "wilhelm_judgment": {`);
    lines.push(`      "text": ${jsString(f.judgment_oraculo)}`);
    lines.push(`    },`);
    lines.push(`    "wilhelm_image": {`);
    lines.push(`      "text": ${jsString(f.image_oraculo)}`);
    lines.push(`    },`);
    lines.push(`    "wilhelm_lines": {`);
    for (let p = 1; p <= 6; p++) {
      lines.push(`      "${p}": {`);
      lines.push(`        "text": ${jsString(f[`L${p}_oraculo`])}`);
      lines.push(`      }${p < 6 ? "," : ""}`);
    }
    lines.push(`    }${(n === 1 || n === 2) && f.yong_oraculo ? "," : ""}`);
    if (n === 1 && f.yong_oraculo) {
      lines.push(`    "yong_jiu": ${jsString(f.yong_oraculo)}`);
    }
    if (n === 2 && f.yong_oraculo) {
      lines.push(`    "yong_liu": ${jsString(f.yong_oraculo)}`);
    }
    lines.push(`  }${n < 64 ? "," : ""}`);
  }

  lines.push("};");
  lines.push("");

  await writeFile(OUT, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
