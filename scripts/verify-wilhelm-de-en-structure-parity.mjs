#!/usr/bin/env node
/**
 * QA code: VF-FID-W-038 verify-wilhelm-de-en-structure-parity · v1.0.0
 * Area: scripts/verify-wilhelm-de-en-structure-parity.mjs
 * Family: FID-W
 *
 * EN Baynes vs DE comments maestro — fill parity (vacío/lleno) per field × hex.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./lib/wilhelm-comments-manual-fields.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const EN_COMMENTS = join(ROOT, "tools/datasets/wilhelm/comments/wilhelm-64hex-comments-parsed.json");
const DE_COMMENTS = join(
  ROOT,
  "tools/datasets/wilhelm-de/comments/wilhelm-de-64hex-comments-merged.json",
);

const FIELD_KEYS = WILHELM_COMMENTS_MANUAL_FIELDS.map((f) => f.key);

async function main() {
  const en = JSON.parse(await readFile(EN_COMMENTS, "utf8"));
  const de = JSON.parse(await readFile(DE_COMMENTS, "utf8"));

  /** @type {Array<{ hex: number; field: string; enFilled: boolean; deFilled: boolean }>} */
  const asymmetric = [];

  for (let h = 1; h <= 64; h++) {
    const ek = Object.keys(en.hexagrams[String(h)].fields);
    const dk = Object.keys(de.hexagrams[String(h)].fields);
    if (JSON.stringify(ek.sort()) !== JSON.stringify(dk.sort())) {
      console.error(`hex ${h}: key set mismatch EN vs DE`);
      process.exit(1);
    }

    for (const field of FIELD_KEYS) {
      const enFilled = Boolean(String(en.hexagrams[String(h)].fields[field] ?? "").trim());
      const deFilled = Boolean(String(de.hexagrams[String(h)].fields[field] ?? "").trim());
      if (enFilled !== deFilled) {
        asymmetric.push({ hex: h, field, enFilled, deFilled });
      }
    }
  }

  const total = FIELD_KEYS.length * 64;
  const symmetric = total - asymmetric.length;

  console.log(`Comments EN↔DE fill parity: ${symmetric}/${total}`);

  if (asymmetric.length) {
    console.log("\nAsymmetric slots (first 20):");
    for (const row of asymmetric.slice(0, 20)) {
      console.log(
        `  hex ${row.hex} ${row.field}: EN ${row.enFilled ? "filled" : "empty"} · DE ${row.deFilled ? "filled" : "empty"}`,
      );
    }
    process.exit(1);
  }

  console.log("verify:wilhelm-de-en-structure-parity PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
