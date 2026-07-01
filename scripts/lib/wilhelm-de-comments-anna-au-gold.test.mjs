/**
 * QA code: AU-FID-W-017 wilhelm-de-comments-anna-au-gold · v1.0.0
 * Area: scripts/lib/wilhelm-de-comments-anna-au-gold.mjs
 * Family: FID-W
 */
import { strict as assert } from "node:assert";
import {
  auTextsEqual,
  classifyAuDisputeResolution,
  normalizeWilhelmDeAuBookText,
  parseAnnaCommentsAuVerticalTsv,
  resolveCommentsFieldForPromote,
} from "./wilhelm-de-comments-anna-au-gold.mjs";
import { buildAnnaCommentsHexFullVerticalAuTsv } from "./wilhelm-de-comments-anna-au-export.mjs";

assert.equal(normalizeWilhelmDeAuBookText("be-\\nHimmels"), "beHimmels");
assert.ok(auTextsEqual("foo\\nbar", "foo\nbar"));

assert.equal(
  classifyAuDisputeResolution("alpha", "beta", "alpha", "disputed"),
  "coincide_pass02",
);
assert.equal(
  classifyAuDisputeResolution("same", "same", "same", "disputed"),
  "coincide_ambos",
);

const pilotTsv = buildAnnaCommentsHexFullVerticalAuTsv(1, {
  hex: "1",
  nombre: "TEST",
  ruler_note: "draft",
});
const parsed = parseAnnaCommentsAuVerticalTsv(pilotTsv);
assert.equal(parsed.hex, 1);
assert.equal(parsed.fields.nombre.contenido_reconciliado, "TEST");
assert.equal(parsed.fields.ruler_note.au_estado, "pendiente");

const blocked = resolveCommentsFieldForPromote({
  field: "commentary_decision",
  pass02: "A",
  pass04: "B",
  reconciled: "A",
  auField: { contenido_pdf: "", au_estado: "pendiente" },
  disputeStatus: "disputed",
  hexAuClosed: false,
});
assert.equal(blocked.value, null);
assert.equal(blocked.source, "blocked_pending_au");

const ok = resolveCommentsFieldForPromote({
  field: "commentary_decision",
  pass02: "A",
  pass04: "B",
  reconciled: "A",
  auField: { contenido_pdf: "Libro X", au_estado: "cerrado" },
  disputeStatus: "disputed",
  hexAuClosed: true,
});
assert.equal(ok.value, "Libro X");
assert.equal(ok.source, "au_jpg");

console.log("wilhelm-de-comments-anna-au-gold: PASS");
