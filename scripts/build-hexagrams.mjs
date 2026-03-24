/**
 * Builds packages/iching-data/src/generated/hexagrams.json from Wilhelm dataset.
 * Source: adamblvck/iching-wilhelm-dataset (scripts/iching_wilhelm_translation.mjs)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcModule = join(root, "scripts", "iching_wilhelm_translation.mjs");
const outDir = join(root, "packages", "iching-data", "src", "generated");
const outFile = join(outDir, "hexagrams.json");

const wilhelm = (await import(pathToFileURL(srcModule).href)).default;

function normalizeBinaryTopFirst(raw) {
  const digits = String(raw).replace(/\D/g, "");
  return digits.padStart(6, "0").slice(-6);
}

function trigramName(obj) {
  if (!obj || typeof obj !== "object") return "";
  return String(obj.symbolic ?? obj.chinese ?? "").replace(/,$/, "").trim();
}

/** @type {Record<string, unknown>[]} */
const list = [];
for (let n = 1; n <= 64; n++) {
  const key = String(n);
  const h = wilhelm[key];
  if (!h) throw new Error(`Missing hexagram ${key}`);

  const topBin = normalizeBinaryTopFirst(h.binary);
  const judgment = h.wilhelm_judgment?.text ?? "";
  const image = h.wilhelm_image?.text ?? "";
  const above = trigramName(h.wilhelm_above);
  const below = trigramName(h.wilhelm_below);

  /** @type {{ position: number; text: string; type: 'yin' | 'yang' }[]} */
  const hexLines = [];
  for (let pos = 1; pos <= 6; pos++) {
    const L = h.wilhelm_lines?.[String(pos)];
    const ch = topBin[6 - pos];
    const type = ch === "1" ? "yang" : "yin";
    hexLines.push({
      position: pos,
      text: L?.text ? String(L.text).trim() : "",
      type,
    });
  }

  const entry = {
    number: n,
    name: String(h.english ?? "").trim(),
    chineseName: String(h.trad_chinese ?? "").trim(),
    pinyin: String(h.pinyin ?? "").trim(),
    upperTrigram: above,
    lowerTrigram: below,
    judgment,
    image,
    lines: hexLines,
    binaryTopFirst: topBin,
  };

  if (n === 1) {
    entry.yongJiu =
      "There appears a flight of dragons without heads.\nGood fortune.";
  }
  if (n === 2) {
    entry.yongLiu = "Perseverance furthers.";
  }

  list.push(entry);
}

list.sort((a, b) => a.number - b.number);

await mkdir(outDir, { recursive: true });
await writeFile(outFile, JSON.stringify(list, null, 0), "utf8");
console.log("Wrote", outFile, `(${list.length} hexagrams)`);
