/**
 * Build the optional scholarly-commentary bundles consumed by
 * @iching-oracle/iching-data (library-display-only — see
 * packages/iching-data/src/commentary-schema.ts for the rationale on why this
 * is kept separate from the core HexagramRecord/HexagramsBundle schema).
 *
 * Sources (audited "TXT maestro" datasets, see
 * docs/auditorias/20260623-POL-DAT-MAESTRO-00-txt-maestro-notes-policy.md):
 *   - tools/datasets/wilhelm/book-one/wilhelm-64hex-parsed.json
 *   - tools/datasets/wilhelm/comments/wilhelm-64hex-comments-parsed.json
 *   - tools/datasets/legge/book-one/legge-64hex-parsed.json
 *   - tools/datasets/legge/appendix/legge-appendix-parsed.json
 *
 * Outputs (under packages/iching-data/src/generated/):
 *   - hexagrams.wilhelm.commentary.json
 *   - hexagrams.legge.commentary.json
 *
 * Zhou Yi has no commentary dataset and is intentionally absent here.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// NOTE: this script intentionally does not import commentary-schema.ts (a .ts
// file cannot be imported by plain `node` here, same constraint that already
// applies to build-hexagrams.mjs). Shape validation against the Zod schema
// happens at import time in packages/iching-data/src/commentary.ts, mirroring
// how index.ts validates the three core bundles via hexagramsBundleSchema.parse.

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "packages", "iching-data", "src", "generated");

const wilhelmBookOnePath = join(
  root,
  "tools",
  "datasets",
  "wilhelm-de",
  "book-one",
  "wilhelm-de-64hex-merged.json",
);
const wilhelmCommentsPath = join(
  root,
  "tools",
  "datasets",
  "wilhelm-de",
  "comments",
  "wilhelm-de-64hex-comments-merged.json",
);
const leggeBookOnePath = join(
  root,
  "tools",
  "datasets",
  "legge",
  "book-one",
  "legge-64hex-parsed.json",
);
const leggeAppendixPath = join(
  root,
  "tools",
  "datasets",
  "legge",
  "appendix",
  "legge-appendix-parsed.json",
);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function nullIfEmpty(value) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? value : null;
}

function buildWilhelmCommentary(bookOne, comments) {
  const out = [];
  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const b = bookOne.hexagrams[key]?.fields;
    const c = comments.hexagrams[key]?.fields;
    if (!b) throw new Error(`Wilhelm book-one missing hex ${n}`);
    if (!c) throw new Error(`Wilhelm comments missing hex ${n}`);

    const lines = [];
    for (let pos = 1; pos <= 6; pos++) {
      lines.push({
        position: pos,
        commentary: {
          bookOne: b[`L${pos}_comentario`] ?? "",
          tenWings: c[`L${pos}_b_comentario`] ?? "",
        },
      });
    }

    const yongBookOne = b.yong_comentario ?? "";
    const yongTenWings = c.yong_b_comentario ?? "";
    const hasYong = yongBookOne.trim().length > 0 || yongTenWings.trim().length > 0;

    const wenYenText = c.wen_yen ?? "";
    const wenYenNote = c.wen_yen_note ?? "";
    const hasWenYen = wenYenText.trim().length > 0 || wenYenNote.trim().length > 0;

    out.push({
      number: n,
      about: {
        intro: b.intro ?? "",
        miscNotes: c.misc_notes ?? "",
        rulerNote: c.ruler_note ?? "",
        sequence: c.sequence ?? "",
      },
      wenYen: hasWenYen ? { text: wenYenText, note: wenYenNote } : null,
      judgment: {
        bookOne: b.judgment_comentario ?? "",
        tenWings: c.commentary_decision ?? "",
      },
      image: {
        bookOne: b.image_comentario ?? "",
        tenWings: c.commentary_image ?? "",
      },
      lines,
      yong: hasYong ? { bookOne: yongBookOne, tenWings: yongTenWings } : null,
    });
  }
  return out;
}

function buildLeggeCommentary(bookOne, appendix) {
  const appendixII = appendix.appendices.find((a) => a.roman === "II");
  if (!appendixII) throw new Error("Legge appendix: Appendix II (Great Symbolism) not found");

  const symbolismByHex = new Map();
  for (const section of appendixII.sections ?? []) {
    for (const entry of section.symbolismHex ?? []) {
      symbolismByHex.set(entry.hex, entry);
    }
  }

  const out = [];
  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const b = bookOne.hexagrams[key]?.fields;
    if (!b) throw new Error(`Legge book-one missing hex ${n}`);
    const symbolism = symbolismByHex.get(n);
    if (!symbolism) throw new Error(`Legge appendix Great Symbolism missing hex ${n}`);

    const lineSymbolism = Object.entries(symbolism.lineNotes ?? {})
      .map(([pos, note]) => ({ position: Number(pos), note: String(note ?? "") }))
      .sort((a, b2) => a.position - b2.position);

    out.push({
      number: n,
      footnotes: b.footnotes ?? "",
      thwanIntro: nullIfEmpty(b.thwan_intro),
      linesIntro: nullIfEmpty(b.lines_intro),
      imageSymbolism: symbolism.image ?? "",
      lineSymbolism,
    });
  }
  return out;
}

async function main() {
  const [wilhelmBookOne, wilhelmComments, leggeBookOne, leggeAppendix] = await Promise.all([
    readJson(wilhelmBookOnePath),
    readJson(wilhelmCommentsPath),
    readJson(leggeBookOnePath),
    readJson(leggeAppendixPath),
  ]);

  const wilhelmCommentary = buildWilhelmCommentary(wilhelmBookOne, wilhelmComments);
  const leggeCommentary = buildLeggeCommentary(leggeBookOne, leggeAppendix);

  if (wilhelmCommentary.length !== 64) throw new Error("Wilhelm commentary: expected 64 hexagrams");
  if (leggeCommentary.length !== 64) throw new Error("Legge commentary: expected 64 hexagrams");

  await writeFile(
    join(outDir, "hexagrams.wilhelm.commentary.json"),
    JSON.stringify(wilhelmCommentary),
    "utf8",
  );
  await writeFile(
    join(outDir, "hexagrams.legge.commentary.json"),
    JSON.stringify(leggeCommentary),
    "utf8",
  );

  console.log("Wrote hexagrams.wilhelm.commentary.json (64 hexagrams)");
  console.log("Wrote hexagrams.legge.commentary.json (64 hexagrams)");
}

await main();
