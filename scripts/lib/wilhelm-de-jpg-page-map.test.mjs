/**
 * QA code: VF-FID-W-024 wilhelm-de-jpg-page-map · v1.0.0
 * Area: scripts/lib/wilhelm-de-jpg-page-map.mjs
 * Family: FID-W
 */

import { strict as assert } from "node:assert";
import {
  segmentRefToBookPage,
  resolveJpgPath,
  buildHexPageRanges,
  loadHexStartsMap,
} from "./wilhelm-de-jpg-page-map.mjs";
import { parseWilhelmDe64HexTxtFull, WILHELM_DE_64HEX_DEFAULT_PATH } from "./wilhelm-de-64hex-txt.mjs";

assert.equal(segmentRefToBookPage({ segment: "1-100", page: 23 }), 23);

const map = loadHexStartsMap();
assert.equal(map.starts.length, 64);

const ranges = buildHexPageRanges(map);
const hex1 = ranges.find((r) => r.hex === 1);
assert.ok(hex1);
assert.equal(hex1.jpgPaths.length, 5);
assert.ok(hex1.jpgPaths[0].includes("page-023.jpg"));

const jpg23 = resolveJpgPath({ segment: "1-100", page: 23 });
assert.ok(jpg23.includes("page-023.jpg"));

const parsed = await parseWilhelmDe64HexTxtFull(WILHELM_DE_64HEX_DEFAULT_PATH, { require64: true });
assert.ok(parsed.hexagrams[1]?.fields?.judgment_oraculo.includes("Schöpferische"));
assert.ok(parsed.hexagrams[2]?.fields?.judgment_oraculo.includes("Empfangende"));

console.log("wilhelm-de-jpg-page-map: PASS");
