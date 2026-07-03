/**
 * QA code: VF-FID-W-034 reconcile-wilhelm-de-comments-from-anna · v1.0.0
 * Area: scripts/lib/wilhelm-de-comments-anna-reconcile.mjs
 * Family: FID-W
 */
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import {
  buildWilhelmDeCommentsAnnaCompareRows,
  classifyAnnaFieldPair,
  reconcileWilhelmDeCommentsAnnaPasses,
  validateWilhelmDeCommentsAnnaReconciled,
} from "./wilhelm-de-comments-anna-reconcile.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
} from "./wilhelm-de-dataset-paths.mjs";

const pass02 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
const pass04 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));

assert.equal(classifyAnnaFieldPair("a", "a"), "identical");
assert.equal(classifyAnnaFieldPair("a", ""), "pass02_only");
assert.equal(classifyAnnaFieldPair("", "b"), "pass04_only");
assert.equal(classifyAnnaFieldPair("a", "b"), "disputed");

const result = reconcileWilhelmDeCommentsAnnaPasses(pass02, pass04);
assert.equal(Object.keys(result.payload.hexagrams).length, 64);
assert.ok(result.g0.ok, `reconciled G0: ${result.g0.errors.join("; ")}`);
assert.ok(result.coverage.filled >= 1527, "reconciled coverage >= best single pass");

const validation = validateWilhelmDeCommentsAnnaReconciled(result.payload);
assert.ok(validation.ok, validation.errors.join("; "));

const rows = buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04);
assert.ok(rows.length > 1500, "compare rows populated");

console.log("wilhelm-de-comments-anna-reconcile: PASS");
