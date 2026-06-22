// Reconstrucción algorítmica del 三爻變二十卦圖 (los 20 casos de 3 líneas)
// para el chart de 乾 (Qian), a partir de la regla de Zhu Xi (Yixue Qimeng cap. IV)
// resuelta por Adler / Ed Hacker / Russell Cottrell:
//   3 líneas cambiantes -> se leen AMBOS 彖辭 (juicios). Si la línea inferior (pos 1)
//   está entre las cambiantes -> 本卦 (chen / primary) gobierna; si no -> 之卦 (hui / transformed).
// Objetivo: enumerar los 20 casos, clasificar primary/transformed y mapear el 之卦
// resultante para contrastar visualmente con Figure 4.19.1 (PDF Adler p.162).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(
  readFileSync(
    resolve(__dirname, "../packages/iching-data/src/generated/hexagrams.zhouyi.json"),
    "utf8",
  ),
);
const bundle = Array.isArray(raw) ? raw : raw.hexagrams;

// binaryTopFirst: index 0 = pos 6 (top) ... index 5 = pos 1 (bottom).
const byBinary = new Map();
for (const h of bundle) {
  byBinary.set(h.binaryTopFirst, { number: h.number, cn: h.chineseName, pinyin: h.pinyin });
}

const QIAN = "111111"; // base hexagram (all yang)

function posToIndex(pos) {
  // pos 1 (bottom) -> index 5 ; pos 6 (top) -> index 0
  return 6 - pos;
}

function flip(binary, positions) {
  const bits = binary.split("");
  for (const pos of positions) {
    const i = posToIndex(pos);
    bits[i] = bits[i] === "1" ? "0" : "1";
  }
  return bits.join("");
}

// All C(6,3) = 20 three-line-change patterns
const positions = [1, 2, 3, 4, 5, 6];
const combos = [];
for (let a = 0; a < positions.length; a++) {
  for (let b = a + 1; b < positions.length; b++) {
    for (let c = b + 1; c < positions.length; c++) {
      combos.push([positions[a], positions[b], positions[c]]);
    }
  }
}

const rows = combos.map((changing) => {
  const resultBin = flip(QIAN, changing);
  const result = byBinary.get(resultBin);
  const includesBottom = changing.includes(1);
  return {
    changing: changing.join(","),
    resultBin,
    resultNum: result?.number ?? "?",
    resultCn: result?.cn ?? "?",
    ruler: includesBottom ? "本卦 chen (primary)" : "之卦 hui (transformed)",
    group: includesBottom ? "FIRST-10" : "LATTER-10",
  };
});

const first = rows.filter((r) => r.group === "FIRST-10");
const latter = rows.filter((r) => r.group === "LATTER-10");

function table(list) {
  return list
    .map(
      (r) =>
        `  líneas {${r.changing}}  ->  之卦 ${r.resultCn} (#${r.resultNum}, ${r.resultBin})   ${r.ruler}`,
    )
    .join("\n");
}

console.log("=".repeat(78));
console.log("RECONSTRUCCIÓN 三爻變二十卦圖 — chart de 乾 (Qian, base 111111)");
console.log("Regla: pos 1 (línea inferior) entre cambiantes -> 本卦 gobierna; si no -> 之卦");
console.log("=".repeat(78));
console.log(`\nTOTAL casos 3 líneas: ${rows.length}`);
console.log(`  FIRST-10 (本卦/chen primary, incluye línea 1): ${first.length}`);
console.log(`  LATTER-10 (之卦/hui transformed, sin línea 1):  ${latter.length}`);
console.log("\n--- PRIMEROS 10 (主貞 / chen primary) — incluyen la línea inferior ---");
console.log(table(first));
console.log("\n--- ÚLTIMOS 10 (主悔 / hui transformed) — NO incluyen la línea inferior ---");
console.log(table(latter));

// Sanity: el split debe ser exactamente 10/10
if (first.length !== 10 || latter.length !== 10) {
  console.error("\n[FALLO] El split no es 10/10 — revisar regla.");
  process.exit(1);
}
console.log("\n[OK] Split 10/10 exacto, consistente con Zhu Xi (32 charts) y motor includes(1).");
