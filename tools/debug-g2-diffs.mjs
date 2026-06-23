import { readFileSync } from "node:fs";
import { parseWilhelmManualTsv } from "../scripts/lib/parse-wilhelm-manual-tsv.mjs";
import { normalizeWilhelmTxtText } from "../scripts/lib/wilhelm-64hex-txt.mjs";

const tsv = parseWilhelmManualTsv(
  readFileSync("tools/manual-gold/hex-1-2-3-8.tsv", "utf8"),
);
import { WILHELM_BOOK_ONE_PARSED_JSON } from "../scripts/lib/wilhelm-dataset-paths.mjs";

const parsed = JSON.parse(
  readFileSync(WILHELM_BOOK_ONE_PARSED_JSON, "utf8"),
);

/** @type {Array<[number, string]>} */
const checks = [
  [1, "yong_comentario"],
  [2, "yong_comentario"],
  [3, "L6_comentario"],
  [8, "L3_oraculo"],
  [8, "L6_comentario"],
];

for (const [h, k] of checks) {
  const u = normalizeWilhelmTxtText(tsv[h][k]);
  const v = normalizeWilhelmTxtText(parsed.hexagrams[String(h)].fields[k]);
  console.log(`\n=== HEX ${h} ${k} ===`);
  console.log("USER:", JSON.stringify(u));
  console.log("PARSED:", JSON.stringify(v));
  if (u.length !== v.length) {
    console.log("LEN", u.length, v.length);
    for (let i = 0; i < Math.max(u.length, v.length); i++) {
      if (u[i] !== v[i]) {
        console.log("FIRST DIFF AT", i);
        console.log("USER SNIP:", JSON.stringify(u.slice(i, i + 80)));
        console.log("PARSED SNIP:", JSON.stringify(v.slice(i, i + 80)));
        break;
      }
    }
  }
}
