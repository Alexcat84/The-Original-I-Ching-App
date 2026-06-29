/**
 * Build the three translator bundles consumed by @iching-oracle/iching-data.
 *
 * Outputs (under packages/iching-data/src/generated/):
 *   - hexagrams.wilhelm.json   (Richard Wilhelm, German 1924 / Diederichs)
 *   - hexagrams.legge.json     (James Legge, 1882/1899)
 *   - hexagrams.zhouyi.json    (周易 — Classical Chinese, Zhou Yi)
 *
 * Every bundle conforms to `hexagramsBundleSchema` in
 * packages/iching-data/src/schema.ts (translator + edition + sourceUrl +
 * licenseNote + generatedAt + 64-entry hexagrams array). The structural
 * metadata that does not depend on translator (chineseName, pinyin, trigrams,
 * binaryTopFirst) is sourced from the canonical Wilhelm transcription so all
 * three bundles line up perfectly in the library UI. `name` is the exception —
 * it is built per translator (see buildWilhelmRecord/buildLeggeRecord/
 * buildZhouyiRecord below), each from its own TXT-maestro/ctext source, not
 * from Wilhelm's transcription. `chineseName`/`pinyin` are verified against
 * ctext.org and a dictionary derivation respectively — see
 * scripts/sync-wilhelm-hex-chinese-gold.mjs and scripts/verify-pinyin-gold.mjs.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { canonicalWilhelmTrigramLabel } from "./lib/wilhelm-trigram-labels.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const wilhelmModulePath = join(root, "scripts", "iching_wilhelm_de_translation.mjs");
const leggeModulePath = join(root, "scripts", "iching_legge_translation.mjs");
const zhouyiModulePath = join(root, "scripts", "iching_zhouyi_translation.mjs");
const outDir = join(root, "packages", "iching-data", "src", "generated");

const wilhelm = (await import(pathToFileURL(wilhelmModulePath).href)).default;
const legge = (await import(pathToFileURL(leggeModulePath).href)).default;
const zhouyi = (await import(pathToFileURL(zhouyiModulePath).href)).default;

// Book-one TXT-maestro datasets — AU-verified 1:1 against the Princeton EPUB
// sources (docs/auditorias/20260623-AUD-DAT-MAESTRO-W-01-wilhelm-txt-maestro.md,
// 20260623-AUD-DAT-MAESTRO-L-01-legge-txt-maestro.md). Title/name metadata was never part of
// the 2026-06-21/23 oracle-field fidelity audits (judgment/image/lines), so
// it is sourced from here instead of the legacy translation scripts above.
const wilhelmMaestro = JSON.parse(
  await readFile(join(root, "tools", "datasets", "wilhelm-de", "book-one", "wilhelm-de-64hex-merged.json"), "utf8"),
).hexagrams;
const leggeMaestro = JSON.parse(
  await readFile(join(root, "tools", "datasets", "legge", "book-one", "legge-64hex-parsed.json"), "utf8"),
).hexagrams;

function normalizeBinaryTopFirst(raw) {
  return String(raw ?? "").replace(/\D/g, "").padStart(6, "0").slice(-6);
}

function trigramName(obj) {
  if (!obj || typeof obj !== "object") return "";
  const raw = String(obj.symbolic ?? obj.chinese ?? "").replace(/,$/, "").trim();
  return canonicalWilhelmTrigramLabel(raw);
}

// Per-hexagram chineseName overrides for font-subset compatibility.
// 遯 (U+9073/U+906F) is absent from noto-serif-tc-700-subset.ttf; 遁 (U+9041)
// is the standard alternative form (same pronunciation: dùn, same meaning).
const CHINESE_NAME_OVERRIDES = { 33: "\u9041" };

function lineType(topBin, position) {
  return topBin[6 - position] === "1" ? "yang" : "yin";
}

function buildBaseStructure(n) {
  const key = String(n);
  const w = wilhelm[key];
  if (!w) throw new Error(`Wilhelm dataset missing hex ${n}`);
  const binaryTopFirst = normalizeBinaryTopFirst(w.binary);
  return {
    number: n,
    binaryTopFirst,
    chineseName: CHINESE_NAME_OVERRIDES[n] ?? String(w.trad_chinese ?? "").trim(),
    pinyin: String(w.pinyin ?? "").trim(),
    upperTrigram: trigramName(w.wilhelm_above),
    lowerTrigram: trigramName(w.wilhelm_below),
    englishName: String(w.english ?? "").trim(),
  };
}

function buildLines(topBin, perPosition) {
  const out = [];
  for (let pos = 1; pos <= 6; pos++) {
    const text = String(perPosition?.[String(pos)]?.text ?? "").trim();
    out.push({ position: pos, text, type: lineType(topBin, pos) });
  }
  return out;
}

function buildWilhelmRecord(base, n) {
  const w = wilhelm[String(n)];
  const wMaestro = wilhelmMaestro[String(n)].fields;
  const judgment = String(w.wilhelm_judgment?.text ?? "").trim();
  const image = String(w.wilhelm_image?.text ?? "").trim();
  const lines = buildLines(base.binaryTopFirst, w.wilhelm_lines);
  const entry = {
    number: base.number,
    name: String(wMaestro.nombre ?? "").trim() || base.englishName,
    chineseName: base.chineseName,
    pinyin: base.pinyin,
    upperTrigram: base.upperTrigram,
    lowerTrigram: base.lowerTrigram,
    judgment,
    image,
    lines,
    binaryTopFirst: base.binaryTopFirst,
  };
  if (n === 1) {
    const yong =
      String(wMaestro.yong_oraculo ?? "").trim() ||
      String(w.yong_jiu ?? w.yongJiu ?? "").trim() ||
      "There appears a flight of dragons without heads.\nGood fortune.";
    entry.yongJiu = yong;
  }
  if (n === 2) {
    const yong = String(w.yong_liu ?? w.yongLiu ?? "").trim() || "Perseverance furthers.";
    entry.yongLiu = yong;
  }
  return entry;
}

function buildLeggeRecord(base, n) {
  const l = legge[String(n)];
  if (!l) throw new Error(`Legge dataset missing hex ${n}`);
  const lMaestro = leggeMaestro[String(n)].fields;
  const judgment = String(l.legge_judgment?.text ?? "").trim();
  const image = String(l.legge_image?.text ?? "").trim();
  const lines = buildLines(base.binaryTopFirst, l.legge_lines);
  const entry = {
    number: base.number,
    name: String(lMaestro.chinese_roman ?? "").trim() || String(l.name ?? "").trim() || base.englishName,
    chineseName: base.chineseName,
    pinyin: base.pinyin,
    upperTrigram: base.upperTrigram,
    lowerTrigram: base.lowerTrigram,
    judgment,
    image,
    lines,
    binaryTopFirst: base.binaryTopFirst,
  };
  if (n === 1 && l.yong_supernumerary) {
    entry.yongJiu = String(l.yong_supernumerary).trim();
  }
  if (n === 2 && l.yong_supernumerary) {
    entry.yongLiu = String(l.yong_supernumerary).trim();
  }
  return entry;
}

function buildZhouyiRecord(base, n) {
  const z = zhouyi[String(n)];
  if (!z) throw new Error(`Zhou Yi dataset missing hex ${n}`);
  const judgment = String(z.zhouyi_judgment?.text ?? "").trim();
  const image = String(z.zhouyi_image?.text ?? "").trim();
  const lines = buildLines(base.binaryTopFirst, z.zhouyi_lines);
  const entry = {
    number: base.number,
    name: String(z.name ?? "").trim() || base.chineseName,
    chineseName: base.chineseName,
    pinyin: base.pinyin,
    upperTrigram: base.upperTrigram,
    lowerTrigram: base.lowerTrigram,
    judgment,
    image,
    lines,
    binaryTopFirst: base.binaryTopFirst,
  };
  if (n === 1 && z.yong_jiu) {
    entry.yongJiu = String(z.yong_jiu).trim();
  }
  if (n === 2 && z.yong_liu) {
    entry.yongLiu = String(z.yong_liu).trim();
  }
  return entry;
}

const generatedAt = new Date().toISOString();
// Zhou Yi fidelity metadata (Wilhelm + Legge reverted to pre-book-primary mirror gold).
const FIDELITY_AUDIT_DATE = "2026-06-22";

const bundles = [
  {
    file: "hexagrams.wilhelm.json",
    bundle: {
      translator: "wilhelm",
      edition:
        "I Ging — Das Buch der Wandlungen, Richard Wilhelm (Diederichs, 1924; German original, public domain USA).",
      sourceUrl: "https://archive.org/details/ichingdasbuchder0000rich",
      licenseNote:
        "Public domain in the United States (1924 German edition). Oracle judgment, image (Das Bild), line, and yong texts verified against merged dual-pass OCR of the Diederichs scan (pass01+pass03) with PDF arbiter workflow; Baynes English (1950) archived for triangulation only.",
      generatedAt,
      build: buildWilhelmRecord,
    },
  },
  {
    file: "hexagrams.legge.json",
    bundle: {
      translator: "legge",
      edition:
        "Sacred Books of the East, Volume 16: The Yi King, James Legge (1882, revised 1899; digital EPUB).",
      sourceUrl: "https://sacred-texts.com/ich/index.htm",
      licenseNote:
        `James Legge (1882) translation in the public domain. Oracle fields (Thwan, Great Symbolism, lines, yongJiu/yongLiu) verified 1:1 against the James Legge digital EPUB (Sacred Books of the East XVI) on 2026-06-23 (report hexagram-fidelity-2026-06-23T02-10-32-509Z; gate 514/514). EPUB-primary gold: structured digital text replaces the OCR scan.`,
      generatedAt,
      build: buildLeggeRecord,
    },
  },
  {
    file: "hexagrams.zhouyi.json",
    bundle: {
      translator: "zhouyi",
      edition: "周易 (Zhou Yi), Classical Chinese canonical text.",
      sourceUrl: "https://ctext.org/book-of-changes",
      licenseNote:
        `Zhou Yi (周易) is in the public domain. Oracle fields cross-verified 1:1 against ctext.org on ${FIDELITY_AUDIT_DATE} (report hexagram-fidelity-2026-06-22T14-55-29-522Z; gate 514/514). Stored punctuation uses canonical full-width Chinese commas (，).`,
      generatedAt,
      build: buildZhouyiRecord,
    },
  },
];

await mkdir(outDir, { recursive: true });

for (const { file, bundle } of bundles) {
  const records = [];
  for (let n = 1; n <= 64; n++) {
    const base = buildBaseStructure(n);
    records.push(bundle.build(base, n));
  }
  records.sort((a, b) => a.number - b.number);
  const out = {
    translator: bundle.translator,
    edition: bundle.edition,
    sourceUrl: bundle.sourceUrl,
    licenseNote: bundle.licenseNote,
    generatedAt: bundle.generatedAt,
    hexagrams: records,
  };
  await writeFile(join(outDir, file), JSON.stringify(out, null, 0), "utf8");
  console.log(`Wrote ${file} (${records.length} hexagrams, ${bundle.translator})`);
}
