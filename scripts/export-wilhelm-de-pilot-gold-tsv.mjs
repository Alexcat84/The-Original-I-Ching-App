#!/usr/bin/env node
/**
 * QA code: VF-FID-W-021 export-wilhelm-de-pilot-gold-tsv · v1.0.0
 * Area: scripts/export-wilhelm-de-pilot-gold-tsv.mjs
 * Family: FID-W
 *
 * Bootstrap pilot gold TSV from parser v2 output (marker-calibrated).
 * Replace with capture-verified AU when user provides book photos.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_MANUAL_FIELDS, WILHELM_HEX_FIN } from "./lib/wilhelm-manual-fields.mjs";
import { parseWilhelmDe64HexTxtFull, WILHELM_DE_64HEX_DEFAULT_PATH } from "./lib/wilhelm-de-64hex-txt.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GOLD_DIR = join(ROOT, "tools/manual-gold");
const PILOT = [1, 2, 8];

/**
 * @param {string} cell
 */
function tsvEscape(cell) {
  return String(cell ?? "").replace(/\t/g, " ").replace(/\r?\n/g, "\\n");
}

async function main() {
  const parsed = await parseWilhelmDe64HexTxtFull(WILHELM_DE_64HEX_DEFAULT_PATH, {
    require64: true,
  });
  await mkdir(GOLD_DIR, { recursive: true });

  for (const n of PILOT) {
    const fields = parsed.hexagrams[String(n)]?.fields;
    if (!fields) throw new Error(`missing hex ${n}`);
    const lines = ["campo\tcontenido_de\tfuente_captura"];
    for (const { key } of WILHELM_MANUAL_FIELDS) {
      lines.push(`${key}\t${tsvEscape(fields[key])}\tparser-v2-marker-bootstrap`);
    }
    lines.push(`${WILHELM_HEX_FIN}\t\t`);
    const out = join(GOLD_DIR, `wilhelm-de-hex-${n}.tsv`);
    await writeFile(out, `${lines.join("\n")}\n`, "utf8");
    console.log(`Wrote ${out}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
