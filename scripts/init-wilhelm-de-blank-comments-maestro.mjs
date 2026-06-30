#!/usr/bin/env node

/**
 * QA code: VF-FID-W-028 init-wilhelm-de-blank-comments-maestro · v1.0.0
 * Area: scripts/init-wilhelm-de-blank-comments-maestro.mjs
 * Family: FID-W
 */

import {
  writeWilhelmDeBlankCommentsMaestro,
  validateWilhelmDeBlankCommentsMaestro,
  WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS,
  WILHELM_DE_COMMENTS_BLANK,
} from "./lib/wilhelm-de-blank-comments-maestro.mjs";

async function main() {
  const payload = await writeWilhelmDeBlankCommentsMaestro();
  const g0 = validateWilhelmDeBlankCommentsMaestro(payload);

  console.log(`Wrote ${WILHELM_DE_COMMENTS_BLANK}`);
  console.log(
    `Fields per hex: ${WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS.length} · total cells: ${64 * WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS.length}`,
  );
  console.log(`G0 comments blank structure: ${g0.pass ? "PASS" : "FAIL"}`);
  if (!g0.pass) {
    for (const e of g0.errors.slice(0, 20)) console.error(`  ${e}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
