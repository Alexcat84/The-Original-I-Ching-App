/**
 * Audit empty *_comentario fields in zeno extract.
 * Reports slot fill (576) and zeno-content fill (only fields with etiqueta / always-on).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const path = join(
  ROOT,
  "tools/datasets/wilhelm-de/book-one/wilhelm-de-64hex-zeno-extract-latest.json",
);

const data = JSON.parse(readFileSync(path, "utf8"));
const COMMENT_KEYS = [
  "judgment_comentario",
  "image_comentario",
  ...Array.from({ length: 6 }, (_, i) => `L${i + 1}_comentario`),
  "yong_comentario",
];

/** @type {Array<{ hex: number; field: string }>} */
const emptySlots = [];
/** @type {Array<{ hex: number; field: string }>} */
const emptyContent = [];
let totalSlots = 0;
let filledSlots = 0;
let totalContent = 0;
let filledContent = 0;

const rows = Object.values(data.hexagrams ?? {});
for (const row of rows) {
  const hex = Number(row.hex ?? row.fields?.hex);
  const fields = row.fields ?? row;
  for (const key of COMMENT_KEYS) {
    totalSlots++;
    const v = String(fields[key] ?? "").trim();
    if (v) filledSlots++;
    else emptySlots.push({ hex, field: key });

    const etiquetaKey = key.replace("_comentario", "_etiqueta");
    const hasContent =
      key === "judgment_comentario" ||
      key === "image_comentario" ||
      Boolean(String(fields[etiquetaKey] ?? "").trim());
    if (hasContent) {
      totalContent++;
      if (v) filledContent++;
      else emptyContent.push({ hex, field: key });
    }
  }
}

console.log(`slots: ${filledSlots}/${totalSlots} (${((filledSlots / totalSlots) * 100).toFixed(1)}%)`);
console.log(`zeno-content: ${filledContent}/${totalContent} (${((filledContent / totalContent) * 100).toFixed(1)}%)`);
console.log(`empty with etiqueta/judgment/image: ${emptyContent.length}`);
for (const e of emptyContent) {
  console.log(`  hex ${e.hex} ${e.field}`);
}
