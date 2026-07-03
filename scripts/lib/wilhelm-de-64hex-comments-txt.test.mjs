/**
 * QA code: VF-FID-W-033 wilhelm-de-64hex-comments-txt · v1.0.0
 * Area: scripts/lib/wilhelm-de-64hex-comments-txt.mjs
 * Family: FID-W
 */
import { strict as assert } from "node:assert";
import {
  parseWilhelmDe64HexCommentsTxtFile,
  validateWilhelmDe64HexCommentsStructure,
} from "./wilhelm-de-64hex-comments-txt.mjs";
import { WILHELM_DE_STITCHED } from "./wilhelm-de-dataset-paths.mjs";

const pass02 = parseWilhelmDe64HexCommentsTxtFile(WILHELM_DE_STITCHED.bookThreePass02);
const pass04 = parseWilhelmDe64HexCommentsTxtFile(WILHELM_DE_STITCHED.bookThreePass04);

assert.equal(pass02.headerCount, 64, "pass02 header count");
assert.equal(pass04.headerCount, 64, "pass04 header count");

const h6 = pass04.hexagrams["6"];
assert.ok(h6.fields.commentary_decision.length > 100, "pass04 hex6 tuan");
assert.ok(h6.fields.sequence.length > 20, "pass04 hex6 sequence");
assert.notEqual(h6.lineStart, 92, "pass04 hex6 must not bind front-matter false header");

const h19 = pass02.hexagrams["19"];
assert.ok(h19.fields.sequence.length > 20, "pass02 hex19 sequence (ZWSP marker)");

const g02 = validateWilhelmDe64HexCommentsStructure(pass02);
const g04 = validateWilhelmDe64HexCommentsStructure(pass04);

assert.equal(g02.ok, true, `pass02 G0: ${g02.errors.join("; ")}`);
assert.equal(g04.ok, true, `pass04 G0: ${g04.errors.join("; ")}`);

console.log("wilhelm-de-64hex-comments-txt: PASS");
