/**
 * QA code: VF-FID-W-017 wilhelm-en-de-quality-compare · v2.0.0
 * Area: scripts/lib/wilhelm-en-de-quality-compare.mjs
 * Family: FID-W
 */

import { strict as assert } from "node:assert";
import { compareWilhelmEnDeField } from "./wilhelm-en-de-quality-compare.mjs";

assert.equal(
  compareWilhelmEnDeField({
    en: "乾",
    de: "乾",
    field: "chinese",
    classification: "pair",
  }).verdict,
  "exact",
);

assert.equal(
  compareWilhelmEnDeField({
    en: "Anfangs-Neun bedeutet:",
    de: "Anfangs eine Neun bedeutet:",
    field: "L1_etiqueta",
    classification: "pair",
  }).verdict,
  "label_pair",
);

assert.equal(
  compareWilhelmEnDeField({
    en: "THE CREATIVE works sublime success.",
    de: "",
    field: "judgment_oraculo",
    classification: "en_only",
  }).verdict,
  "en_only",
);

console.log("wilhelm-en-de-quality-compare: PASS");
