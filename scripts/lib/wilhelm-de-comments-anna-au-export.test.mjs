/**
 * QA code: AU-FID-W-014 export-wilhelm-de-comments-anna-au-tsv · v1.0.0
 * Area: scripts/lib/wilhelm-de-comments-anna-au-export.mjs
 * Family: FID-W
 */
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import {
  buildAnnaCommentsAuDisputeRows,
  buildAnnaCommentsDisputesFlatTsv,
  tsvEscapeCell,
} from "./wilhelm-de-comments-anna-au-export.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
} from "./wilhelm-de-dataset-paths.mjs";

assert.equal(tsvEscapeCell("a\tb\nc"), "a b\\nc");

const pass02 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
const pass04 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));
const rows = buildAnnaCommentsAuDisputeRows(pass02, pass04);
assert.ok(rows.length >= 500, `expected >=500 dispute rows, got ${rows.length}`);
assert.ok(rows.every((r) => r.status !== "identical"));

const tsv = buildAnnaCommentsDisputesFlatTsv(rows.slice(0, 3));
assert.ok(tsv.startsWith("hex\tcampo\testado"));
assert.ok(tsv.includes("contenido_pdf"));
assert.ok(tsv.includes("jpg_paginas"));
assert.ok(tsv.includes("resolucion_disputa"));

console.log("wilhelm-de-comments-anna-au-export: PASS");
