#!/usr/bin/env node

/**
 * QA code: VF-FID-W-023 init-wilhelm-de-blank-maestro · v1.0.0
 * Area: scripts/init-wilhelm-de-blank-maestro.mjs
 * Family: FID-W
 */

import { readFile } from "node:fs/promises";
import {
  writeWilhelmDeBlankMaestro,
  validateWilhelmDeBlankMaestro,
  WILHELM_DE_BLANK_FIELD_KEYS,
} from "./lib/wilhelm-de-blank-maestro.mjs";
import {
  WILHELM_DE_BOOK_ONE_BLANK,
  WILHELM_BAYNES_BOOK_ONE_PARSED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

async function main() {
  const baynes = JSON.parse(await readFile(WILHELM_BAYNES_BOOK_ONE_PARSED, "utf8"));
  const payload = await writeWilhelmDeBlankMaestro();
  const g0 = validateWilhelmDeBlankMaestro(payload, baynes);

  console.log(`Wrote ${WILHELM_DE_BOOK_ONE_BLANK}`);
  console.log(`Fields per hex: ${WILHELM_DE_BLANK_FIELD_KEYS.length} · total cells: ${64 * WILHELM_DE_BLANK_FIELD_KEYS.length}`);
  console.log(`G0 blank structure: ${g0.pass ? "PASS" : "FAIL"}`);
  if (!g0.pass) {
    for (const e of g0.errors.slice(0, 20)) console.error(`  ${e}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
