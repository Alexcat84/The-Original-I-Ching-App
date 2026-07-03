/**
 * QA code: VF-FID-W-028 wilhelm-de-blank-comments-maestro · v1.0.0
 * Area: scripts/lib/wilhelm-de-blank-comments-maestro.mjs
 * Family: FID-W
 */
import {
  buildWilhelmDeBlankCommentsMaestro,
  validateWilhelmDeBlankCommentsMaestro,
  WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS,
} from "./wilhelm-de-blank-comments-maestro.mjs";

const symbols = Object.fromEntries(
  Array.from({ length: 64 }, (_, i) => {
    const n = i + 1;
    return [String(n), { chinese: "乾", hex_font: "䷀" }];
  }),
);

const blank = buildWilhelmDeBlankCommentsMaestro(symbols);
const g0 = validateWilhelmDeBlankCommentsMaestro(blank);

if (!g0.pass) {
  console.error("wilhelm-de-blank-comments-maestro: FAIL", g0.errors.slice(0, 5));
  process.exit(1);
}

if (WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS.length !== 37) {
  console.error("expected 37 comment fields, got", WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS.length);
  process.exit(1);
}

const h1 = blank.hexagrams["1"].fields;
if (h1.commentary_decision.trim() || h1.wen_yen.trim()) {
  console.error("hex 1 Ten Wings fields must be empty in blank scaffold");
  process.exit(1);
}

console.log("wilhelm-de-blank-comments-maestro: PASS");
