/**
 * QA code: VF-FID-W-019 wilhelm-de-commentary-split · v1.0.0
 * Area: scripts/lib/wilhelm-de-commentary-split.test.mjs
 * Family: FID-W
 */

import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseWilhelmDe64HexTxtFull,
  WILHELM_DE_64HEX_DEFAULT_PATH,
} from "./wilhelm-de-64hex-txt.mjs";
import { WILHELM_G2_ORACLE_KEYS } from "./wilhelm-manual-fields.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PILOT_HEX = [1, 2, 8];

/** @type {Record<number, Partial<Record<string, string>>>} */
const GOLD_SNIPPETS = {
  1: {
    judgment_oraculo: "Das Schöpferische wirkt erhabenes Gelingen",
    judgment_comentario: "Dem ursprünglichen Sinne nach",
    L1_oraculo: "Verdeckter Drache. Handle nicht.",
    L1_comentario: "Der Drache hat in China",
  },
  2: {
    judgment_oraculo: "Das Empfangende wirkt erhabenes Gelingen",
    judgment_comentario: "Die vier Grundrichtungen",
    yong_etiqueta: "Wenn lauter Sechsen",
  },
  8: {
    judgment_oraculo: "Das Zusammenhalten bringt Heil",
    L1_oraculo: "Halte wahr und treu",
  },
};

const parsed = await parseWilhelmDe64HexTxtFull(WILHELM_DE_64HEX_DEFAULT_PATH, {
  require64: true,
});

for (const n of PILOT_HEX) {
  const fields = parsed.hexagrams[String(n)]?.fields;
  assert.ok(fields, `hex ${n} missing`);

  for (const [key, snippet] of Object.entries(GOLD_SNIPPETS[n] ?? {})) {
    const value = String(fields[key] ?? "");
    assert.ok(
      value.includes(snippet),
      `hex ${n}.${key}: expected snippet "${snippet}" in "${value.slice(0, 80)}…"`,
    );
  }

  for (let p = 1; p <= 6; p++) {
    const com = String(fields[`L${p}_comentario`] ?? "").trim();
    if (com) {
      assert.ok(com.length >= 20, `hex ${n} L${p}_comentario too short (${com.length})`);
    }
  }

  const oracleKeys = WILHELM_G2_ORACLE_KEYS.filter((k) => k.includes("comentario"));
  const filled = oracleKeys.filter((k) => String(fields[k] ?? "").trim().length > 0);
  const minCommentary = { 1: 4, 2: 1, 8: 1 }[n] ?? 2;
  assert.ok(
    filled.length >= minCommentary,
    `hex ${n}: expected ≥${minCommentary} commentary fields filled, got ${filled.length} (${filled.join(", ")})`,
  );
}

const goldPath = join(ROOT, "tools/manual-gold/wilhelm-de-hex-1.tsv");
const gold1 = await readFile(goldPath, "utf8").catch(() => "");
if (gold1.includes("judgment_oraculo")) {
  for (const line of gold1.split("\n")) {
    if (!line.trim() || line.startsWith("campo")) continue;
    const [campo, contenido] = line.split("\t");
    if (!campo || !contenido?.trim()) continue;
    if (!/_oraculo$|_comentario$/.test(campo)) continue;
    const actual = String(parsed.hexagrams["1"]?.fields?.[campo] ?? "").trim();
    const goldText = contenido.trim().replace(/\\n/g, "\n");
    if (actual && goldText) {
      assert.ok(
        actual.includes(goldText.slice(0, 40)) || goldText.includes(actual.slice(0, 40)),
        `gold hex1 ${campo} drift`,
      );
    }
  }
}

console.log("wilhelm-de-commentary-split: PASS (hex 1, 2, 8)");
