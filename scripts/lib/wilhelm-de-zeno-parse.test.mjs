/**
 * QA code: VF-FID-W-025 wilhelm-de-zeno-parse · v1.0.0
 * Area: scripts/lib/wilhelm-de-zeno-parse.mjs
 * Family: FID-W
 */

import { strict as assert } from "node:assert";
import { parseWilhelmDeHexFromZeno, discoverZenoHexPaths } from "./wilhelm-de-zeno-parse.mjs";

const paths = await discoverZenoHexPaths();
assert.equal(paths.length, 64);

const hex1Path = paths[0];
const hex2Path = paths[1];
const r = await parseWilhelmDeHexFromZeno(hex1Path);
const f = r.fields;

assert.equal(f.hex, "1");
assert.ok(f.nombre.includes("SCHÖPFERISCHE") || f.nombre.includes("SCHOPFERISCHE"));
assert.ok(f.intro.includes("Das Zeichen besteht"));
assert.ok(f.judgment_oraculo.includes("Das Schöpferische wirkt"));
assert.ok(f.judgment_comentario.includes("Dem ursprünglichen Sinne nach"));
assert.ok(f.image_oraculo.includes("Des Himmels Bewegung"));
assert.ok(f.L2_comentario.includes("Hier beginnen die Wirkungen"));
assert.ok(f.L6_comentario.length > 20);
assert.ok(f.yong_oraculo.includes("Drachen ohne Haupt"));

const r2 = await parseWilhelmDeHexFromZeno(hex2Path);
const f2 = r2.fields;
assert.ok(f2.yong_oraculo.includes("Fördernd ist dauernde Beharrlichkeit"));
assert.ok(f2.yong_comentario.includes("verwandelt sich das Zeichen"));
assert.ok(f2.L1_comentario.includes("Wie die lichte Kraft"));
assert.ok(f2.L6_oraculo.includes("Drachen kämpfen"));
assert.ok(f2.L6_comentario.includes("obersten Platz"));

const r7 = await parseWilhelmDeHexFromZeno(paths[6]);
assert.ok(r7.fields.image_oraculo.includes("Bild des Heeres"));
assert.ok(r7.fields.image_comentario.includes("Grundwasser"));

const r20 = await parseWilhelmDeHexFromZeno(paths[19]);
assert.ok(r20.fields.judgment_oraculo.includes("Waschung"));
assert.ok(r20.fields.judgment_comentario.includes("Opferhandlung"));

const r27 = await parseWilhelmDeHexFromZeno(paths[26]);
assert.ok(r27.fields.judgment_oraculo.includes("Mundwinkel"));
assert.ok(r27.fields.judgment_comentario.includes("Zuwendung"));

for (const [idx, hex] of [
  [16, "17"],
  [24, "25"],
  [46, "47"],
  [47, "48"],
  [53, "54"],
]) {
  const fN = (await parseWilhelmDeHexFromZeno(paths[idx])).fields;
  assert.ok(fN.trigrama_arriba.length < 90, `hex ${hex} trigrama_arriba too long`);
  assert.ok(fN.trigrama_abajo.length < 90, `hex ${hex} trigrama_abajo too long`);
  assert.ok(fN.trigrama_arriba.includes(","), `hex ${hex} trigrama_arriba canonical`);
}
assert.ok(
  (await parseWilhelmDeHexFromZeno(paths[16])).fields.intro.includes("jüngste Tochter"),
);

console.log("wilhelm-de-zeno-parse: PASS (64 links, hex 1+2+7+17+20+27 fields)");
