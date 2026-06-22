/**
 * Build the three translator bundles consumed by @iching-oracle/iching-data.
 *
 * Outputs (under packages/iching-data/src/generated/):
 *   - hexagrams.wilhelm.json   (Richard Wilhelm / Cary F. Baynes)
 *   - hexagrams.legge.json     (James Legge, 1882/1899)
 *   - hexagrams.zhouyi.json    (周易 — Classical Chinese, Zhou Yi)
 *
 * Every bundle conforms to `hexagramsBundleSchema` in
 * packages/iching-data/src/schema.ts (translator + edition + sourceUrl +
 * licenseNote + generatedAt + 64-entry hexagrams array). The structural
 * metadata that does not depend on translator (chineseName, pinyin, trigrams,
 * binaryTopFirst, English `name`) is sourced from the canonical Wilhelm
 * transcription so all three bundles line up perfectly in the library UI.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const wilhelmModulePath = join(root, "scripts", "iching_wilhelm_translation.mjs");
const leggeModulePath = join(root, "scripts", "iching_legge_translation.mjs");
const zhouyiModulePath = join(root, "scripts", "iching_zhouyi_translation.mjs");
const outDir = join(root, "packages", "iching-data", "src", "generated");

const wilhelm = (await import(pathToFileURL(wilhelmModulePath).href)).default;
const legge = (await import(pathToFileURL(leggeModulePath).href)).default;
const zhouyi = (await import(pathToFileURL(zhouyiModulePath).href)).default;

function normalizeBinaryTopFirst(raw) {
  return String(raw ?? "").replace(/\D/g, "").padStart(6, "0").slice(-6);
}

function trigramName(obj) {
  if (!obj || typeof obj !== "object") return "";
  return String(obj.symbolic ?? obj.chinese ?? "").replace(/,$/, "").trim();
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
  const judgment = String(w.wilhelm_judgment?.text ?? "").trim();
  const image = String(w.wilhelm_image?.text ?? "").trim();
  const lines = buildLines(base.binaryTopFirst, w.wilhelm_lines);
  const entry = {
    number: base.number,
    name: base.englishName,
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
  const judgment = String(l.legge_judgment?.text ?? "").trim();
  const image = String(l.legge_image?.text ?? "").trim();
  const lines = buildLines(base.binaryTopFirst, l.legge_lines);
  const entry = {
    number: base.number,
    name: String(l.name ?? "").trim() || base.englishName,
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
const FIDELITY_AUDIT_DATE = "2026-06-21";
const FIDELITY_REPORT_ID = "hexagram-fidelity-2026-06-21T20-26-09-152Z";

const bundles = [
  {
    file: "hexagrams.wilhelm.json",
    bundle: {
      translator: "wilhelm",
      edition:
        "The I Ching or Book of Changes, Richard Wilhelm / Cary F. Baynes (1950, public domain since 2020).",
      sourceUrl: "http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html",
      licenseNote:
        `Public domain (Wilhelm 1950, Baynes English rendering). Oracle judgment, image, and line texts cross-verified 1:1 against the University of Parma mirror on ${FIDELITY_AUDIT_DATE} (report ${FIDELITY_REPORT_ID}). 6 fields where Parma's HTML omits the passage are sourced from the printed Wilhelm/Baynes edition (Princeton University Press, 1950), page-verified in the physical book: hex 56 judgment (p. 231), hex 20 line 5 (pp. 88-89), hex 21 lines 2 and 3 (pp. 92-93), hex 26 line 3 (p. 112), hex 52 line 2 (p. 215).`,
      generatedAt,
      build: buildWilhelmRecord,
    },
  },
  {
    file: "hexagrams.legge.json",
    bundle: {
      translator: "legge",
      edition:
        "Sacred Books of the East, Volume 16: The Yi King, James Legge (1882, revised 1899).",
      sourceUrl: "https://sacred-texts.com/ich/index.htm",
      licenseNote:
        `James Legge (1882) translation in the public domain. Oracle fields cross-verified 1:1 against sacred-texts.com on ${FIDELITY_AUDIT_DATE} (report ${FIDELITY_REPORT_ID}). 513/513 oracle fields match.`,
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
        `Zhou Yi (周易) is in the public domain. Oracle fields cross-verified 1:1 against ctext.org on ${FIDELITY_AUDIT_DATE} (report ${FIDELITY_REPORT_ID}). 514/514 oracle fields match.`,
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
