/**
 * QA code: VF-FID-W-018 wilhelm-de-blank-maestro · v1.0.0
 * Area: scripts/lib/wilhelm-de-blank-maestro.mjs
 * Family: FID-W
 */

import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import {
  buildBlankFieldsForHex,
  buildWilhelmDeBlankMaestro,
  validateWilhelmDeBlankMaestro,
  WILHELM_DE_BLANK_FIELD_KEYS,
} from "./wilhelm-de-blank-maestro.mjs";
import {
  WILHELM_DE_BOOK_ONE_BLANK,
  WILHELM_BAYNES_BOOK_ONE_PARSED,
} from "./wilhelm-de-dataset-paths.mjs";

const fields = buildBlankFieldsForHex(1, { chinese: "乾", hex_font: "䷀" });
assert.equal(fields.hex, "1");
assert.equal(fields.chinese, "乾");
assert.equal(fields.hex_font, "䷀");
assert.equal(fields.judgment_oraculo, "");
assert.equal(WILHELM_DE_BLANK_FIELD_KEYS.length, 33);

/** @type {Record<string, { chinese: string; hex_font: string }>} */
const mockSymbols = Object.fromEntries(
  Array.from({ length: 64 }, (_, i) => {
    const n = String(i + 1);
    return [n, n === "1" ? { chinese: "乾", hex_font: "䷀" } : { chinese: "坤", hex_font: "䷁" }];
  }),
);
const fresh = buildWilhelmDeBlankMaestro(mockSymbols);
const strict = validateWilhelmDeBlankMaestro(fresh, null, { requireEmptyPaste: true });
assert.equal(strict.pass, true, strict.errors.join("; "));

const blank = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_BLANK, "utf8"));
const baynes = JSON.parse(await readFile(WILHELM_BAYNES_BOOK_ONE_PARSED, "utf8"));
const g0 = validateWilhelmDeBlankMaestro(blank, baynes);
assert.equal(g0.pass, true, g0.errors.join("; "));

console.log("wilhelm-de-blank-maestro: PASS");
