#!/usr/bin/env node

/**
 * QA code: VF-FID-W-025 extract-wilhelm-de-from-zeno · v1.0.0
 * Area: scripts/extract-wilhelm-de-from-zeno.mjs
 * Family: FID-W
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_MANUAL_FIELDS, WILHELM_HEX_FIN } from "./lib/wilhelm-manual-fields.mjs";
import {
  WILHELM_DE_BOOK_ONE_DIR,
  WILHELM_DE_DATASETS_ROOT,
  WILHELM_DE_PRIMARY_SOURCE,
  WILHELM_DE_ZENO_INGEST,
  WILHELM_DE_ZENO_MATERIAL_JSON,
} from "./lib/wilhelm-de-dataset-paths.mjs";
import {
  discoverZenoHexPaths,
  parseWilhelmDeHexFromZeno,
} from "./lib/wilhelm-de-zeno-parse.mjs";
import { crawlWilhelmDeZenoMaterial } from "./lib/wilhelm-de-zeno-material.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GOLD_DIR = join(ROOT, "tools/manual-gold");
const REPORTS = join(ROOT, "reports");

function parseArgs(argv) {
  /** @type {{ hex: number[]; all: boolean; material: boolean; applyBlank: boolean; delayMs: number }} */
  const out = {
    hex: [1, 2, 8],
    all: false,
    material: true,
    applyBlank: false,
    delayMs: 120,
  };
  for (const arg of argv) {
    if (arg === "--all") out.all = true;
    if (arg === "--no-material") out.material = false;
    if (arg === "--apply-blank") out.applyBlank = true;
    if (arg.startsWith("--hex=")) {
      out.hex = arg
        .slice(6)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => n >= 1 && n <= 64);
    }
    if (arg.startsWith("--delay-ms=")) out.delayMs = Number(arg.slice(11)) || 120;
  }
  if (out.all) out.hex = Array.from({ length: 64 }, (_, i) => i + 1);
  return out;
}

/**
 * @param {string} cell
 */
function tsvEscape(cell) {
  return String(cell ?? "").replace(/\t/g, " ").replace(/\r?\n/g, "\\n");
}

/**
 * @param {number} hex
 * @param {Record<string, string>} fields
 * @param {string} source
 */
async function writeGoldTsv(hex, fields, source) {
  const lines = ["campo\tcontenido_de\tfuente_captura"];
  for (const { key } of WILHELM_MANUAL_FIELDS) {
    lines.push(`${key}\t${tsvEscape(fields[key])}\t${source}`);
  }
  lines.push(`${WILHELM_HEX_FIN}\t\t`);
  const zenoPath = join(GOLD_DIR, `wilhelm-de-zeno-hex-${hex}.tsv`);
  const legacyPath = join(GOLD_DIR, `wilhelm-de-hex-${hex}.tsv`);
  await writeFile(zenoPath, `${lines.join("\n")}\n`, "utf8");
  await writeFile(legacyPath, `${lines.join("\n")}\n`, "utf8");
  return { zenoPath, legacyPath };
}

/**
 * @param {Record<string, object>} hexagrams
 */
async function applyToBlank(hexagrams) {
  const blankPath = join(WILHELM_DE_BOOK_ONE_DIR, "wilhelm-de-64hex-blank.json");
  const blank = JSON.parse(await readFile(blankPath, "utf8"));
  const PASTE_KEYS = WILHELM_MANUAL_FIELDS.filter((f) => f.paste).map((f) => f.key);
  const META_KEYS = ["nombre", "chinese_roman", "trigrama_arriba", "trigrama_abajo"];
  let applied = 0;

  for (const [n, entry] of Object.entries(hexagrams)) {
    const fields = entry.fields ?? {};
    const hexEntry = blank.hexagrams[n];
    if (!hexEntry?.fields) continue;
    for (const key of PASTE_KEYS) {
      if (fields[key]) {
        hexEntry.fields[key] = fields[key];
        applied++;
      }
    }
    for (const key of META_KEYS) {
      if (fields[key]) hexEntry.fields[key] = fields[key];
    }
    if (fields.nombre) hexEntry.bookTitle = fields.nombre;
    if (fields.chinese) hexEntry.bookHanzi = fields.chinese;
    if (fields.hex_font) hexEntry.bookHexFont = fields.hex_font;
  }

  blank.zenoGoldAppliedAt = new Date().toISOString();
  blank.status = "zeno-gold";
  await writeFile(blankPath, `${JSON.stringify(blank, null, 2)}\n`, "utf8");
  return applied;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await mkdir(WILHELM_DE_BOOK_ONE_DIR, { recursive: true });
  await mkdir(GOLD_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });
  await mkdir(dirname(WILHELM_DE_ZENO_MATERIAL_JSON), { recursive: true });

  const hexPaths = await discoverZenoHexPaths();
  const pathByHex = new Map(
    hexPaths.map((p) => [Number(p.match(/\/(\d{1,2})\./)?.[1] ?? 0), p]),
  );

  /** @type {Record<string, object>} */
  const hexagrams = {};
  /** @type {string[]} */
  const errors = [];
  let commentaryFilled = 0;
  let commentaryTotal = 0;
  let commentaryContentFilled = 0;
  let commentaryContentTotal = 0;

  for (const hex of args.hex) {
    const hexPath = pathByHex.get(hex);
    if (!hexPath) {
      errors.push(`hex ${hex}: missing zeno path`);
      continue;
    }
    try {
      const parsed = await parseWilhelmDeHexFromZeno(hexPath);
      hexagrams[String(hex)] = {
        zenoPath: hexPath,
        zenoPermalink: parsed.zenoPermalink,
        bookTitle: parsed.fields.nombre,
        bookHanzi: parsed.fields.chinese,
        fields: parsed.fields,
      };
      const paths = await writeGoldTsv(hex, parsed.fields, parsed.source);
      for (const key of Object.keys(parsed.fields)) {
        if (!/_comentario$/.test(key)) continue;
        commentaryTotal++;
        const filled = Boolean(String(parsed.fields[key] ?? "").trim());
        if (filled) commentaryFilled++;
        const etiquetaKey = key.replace("_comentario", "_etiqueta");
        const hasContent =
          key === "judgment_comentario" ||
          key === "image_comentario" ||
          Boolean(String(parsed.fields[etiquetaKey] ?? "").trim());
        if (hasContent) {
          commentaryContentTotal++;
          if (filled) commentaryContentFilled++;
        }
      }
      console.log(`hex ${hex}: PASS → ${paths.zenoPath}`);
      await sleep(args.delayMs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`hex ${hex}: ${msg}`);
      console.error(`hex ${hex}: FAIL — ${msg}`);
    }
  }

  const payload = {
    schemaVersion: "1.0.0",
    extractedAt: new Date().toISOString(),
    primarySource: WILHELM_DE_PRIMARY_SOURCE,
    ingestMirror: WILHELM_DE_ZENO_INGEST,
    method: "zeno.org-html",
    license: WILHELM_DE_ZENO_INGEST.zenoLicenseClaim,
    hexCount: Object.keys(hexagrams).length,
    commentaryFill: `${commentaryFilled}/${commentaryTotal}`,
    commentaryContentFill: `${commentaryContentFilled}/${commentaryContentTotal}`,
    errors,
    hexagrams,
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outJson = join(WILHELM_DE_BOOK_ONE_DIR, `wilhelm-de-64hex-zeno-extract-${stamp}.json`);
  const latestJson = join(WILHELM_DE_BOOK_ONE_DIR, "wilhelm-de-64hex-zeno-extract-latest.json");
  await writeFile(outJson, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(latestJson, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${latestJson}`);

  if (args.material) {
    console.log("Crawling Zweites Buch: Das Material…");
    const material = await crawlWilhelmDeZenoMaterial();
    await writeFile(
      WILHELM_DE_ZENO_MATERIAL_JSON,
      `${JSON.stringify(material, null, 2)}\n`,
      "utf8",
    );
    console.log(
      `Material: ${material.pageCount} pages → ${WILHELM_DE_ZENO_MATERIAL_JSON}`,
    );
  }

  if (args.applyBlank && Object.keys(hexagrams).length) {
    const applied = await applyToBlank(hexagrams);
    console.log(`Applied ${applied} fields to blank maestro`);
  }

  const report = {
    extractedAt: payload.extractedAt,
    hexOk: Object.keys(hexagrams).length,
    errors,
    commentaryFill: payload.commentaryFill,
  };
  await writeFile(
    join(REPORTS, `wilhelm-de-zeno-extract-${stamp}.json`),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  if (errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
