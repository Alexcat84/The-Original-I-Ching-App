/**
 * QA code: VF-FID-W-017 wilhelm-de-baynes-quality-compare · v1.0.0
 * Area: scripts/lib/wilhelm-de-baynes-quality-compare.mjs
 * Family: FID-W
 */
import { strict as assert } from "node:assert";
import {
  compareWilhelmDeBaynesQuality,
  normalizeForCompare,
  tokenJaccard,
} from "./wilhelm-de-baynes-quality-compare.mjs";

assert.ok(normalizeForCompare("Das Schöpferische!") === "das schopferische");

const aligned = compareWilhelmDeBaynesQuality({
  de: "Das Schöpferische wirkt erhabenes Gelingen.",
  enAuto: "The Creative works sublime success.",
  enBaynes: "THE CREATIVE works sublime success,\nFurthering through perseverance.",
  classification: "translation_pair",
  field: "judgment",
});
assert.equal(aligned.verdict, "strong_align");
assert.ok((aligned.score ?? 0) > 0.2);

const deOnly = compareWilhelmDeBaynesQuality({
  de: "Reihenfolge …",
  enAuto: "Sequence …",
  enBaynes: "",
  classification: "de_only",
});
assert.equal(deOnly.verdict, "de_only");

assert.ok(tokenJaccard("hidden dragon do not act", "Hidden dragon. Do not act.") > 0.5);

console.log("wilhelm-de-baynes-quality-compare: PASS");
