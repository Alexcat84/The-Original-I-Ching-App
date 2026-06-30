/**
 * QA code: VF-FID-W-021 wilhelm-de-field-split-g2 · v1.0.0
 * Area: scripts/lib/validate-wilhelm-de-field-split-g2.mjs
 * Family: FID-W
 */

import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { runWilhelmDeFieldSplitG2 } from "./validate-wilhelm-de-field-split-g2.mjs";
import { WILHELM_DE_BOOK_ONE_PARSED_V2 } from "./wilhelm-de-dataset-paths.mjs";

await readFile(WILHELM_DE_BOOK_ONE_PARSED_V2, "utf8");
const g2 = await runWilhelmDeFieldSplitG2();
assert.equal(g2.pass, true, g2.errors.slice(0, 5).join("; "));
assert.ok(g2.checked >= 20, `expected ≥20 split checks, got ${g2.checked}`);
console.log(`wilhelm-de-field-split-g2: PASS (${g2.matched}/${g2.checked})`);
