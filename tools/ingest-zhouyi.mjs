/**
 * Ingest the original Zhou Yi (周易) Classical Chinese hexagram texts.
 *
 * Source repository: github.com/freizl/yijing
 *  - zh-TW/64gua.json — all 64 hexagrams in traditional Chinese with the
 *    structured fields we need (gua_ci, da_xiang, yao_ci).
 *  - License (per upstream): the source itself is the Zhou Yi, which is firmly
 *    public domain. The repository carries no restrictive license; we treat the
 *    JSON layout as a thin transcription of the public-domain canonical text.
 *
 * What we keep:
 *  - gua_ci      → judgment (we strip the leading "<name>：" label so it is
 *                  parallel to Wilhelm/Legge "judgment" text)
 *  - da_xiang    → image (Great Symbolism / 大象傳; classical Chinese, kept
 *                  verbatim except surrounding whitespace). This gives Zhou Yi
 *                  visual parity with Wilhelm/Legge in the library UI.
 *  - yao_ci[i]   → line.text (we strip the position label, e.g. "初九：",
 *                  "六二：", so "position" is the schema field, not the prose).
 *  - For hex 1 (乾) we expose 用九 as yongJiu; for hex 2 (坤) we expose
 *    用六 as yongLiu — same shape as Wilhelm.
 *
 * What we skip in PR1:
 *  - tuan_ci  (彖傳 — Commentary on the Decision)
 *  - xiao_xiang (小象傳 — Commentary on the Lines)
 *  These add a lot of length without contributing to the cross-translator
 *  visual parity (Wilhelm/Legge bundles do not carry per-line commentary
 *  either). We can add them in a later PR if/when the library UI grows a
 *  "commentaries" tab.
 *
 * Pipeline:
 *  1. Fetch zh-TW/64gua.json (cache in tools/output/zhouyi-raw/64gua.json).
 *  2. Map each entry to our internal shape, keyed by hex number 1..64 using
 *     the Wilhelm dataset's top-first binary as the canonical id (the upstream
 *     id is bottom-first, so we reverse it before matching).
 *  3. Write scripts/iching_zhouyi_translation.mjs as the canonical
 *     intermediate consumed by scripts/build-hexagrams.mjs.
 *
 * Run: node tools/ingest-zhouyi.mjs
 */

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cacheDir = join(root, "tools", "output", "zhouyi-raw");
const cacheFile = join(cacheDir, "64gua.json");
const finalOut = join(root, "scripts", "iching_zhouyi_translation.mjs");

const SOURCE_URLS = [
  "https://raw.githubusercontent.com/freizl/yijing/master/zh-TW/64gua.json",
  "https://unpkg.com/@freizl/yijing/zh-TW/64gua.json",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchSource() {
  if (await fileExists(cacheFile)) {
    const cached = await readFile(cacheFile, "utf8");
    if (cached.length > 1000) return JSON.parse(cached);
  }
  let lastError;
  for (const url of SOURCE_URLS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      JSON.parse(text);
      await writeFile(cacheFile, text, "utf8");
      console.log(`Fetched ${url}`);
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
      console.warn(`  ${url} → ${err.message}`);
    }
  }
  throw lastError ?? new Error("All Zhou Yi sources failed");
}

const wilhelmModule = await import(
  pathToFileURL(join(root, "scripts", "iching_wilhelm_translation.mjs")).href
);
const wilhelm = wilhelmModule.default;

function topFirstFromWilhelm(n) {
  const w = wilhelm[String(n)];
  if (!w) throw new Error(`Wilhelm missing hex ${n}`);
  return String(w.binary).padStart(6, "0").slice(-6);
}

function bottomFirstToTopFirst(s) {
  return String(s).padStart(6, "0").slice(-6).split("").reverse().join("");
}

const POSITION_LABELS = [
  "初九",
  "初六",
  "九二",
  "六二",
  "九三",
  "六三",
  "九四",
  "六四",
  "九五",
  "六五",
  "上九",
  "上六",
];

const YONG_LABELS = ["用九", "用六"];

function stripPositionLabel(s, labels) {
  let out = String(s).trim();
  for (const lbl of labels) {
    if (out.startsWith(lbl)) {
      out = out.slice(lbl.length).trim();
      // Eat any of the common Chinese colon/punctuation that follow the label.
      out = out.replace(/^[\u3000\s]*[：:][\u3000\s]*/, "");
      break;
    }
  }
  return out.trim();
}

function stripJudgmentLabel(s, name) {
  // Some entries start with "<name>：…" (e.g. "蒙：亨。…"). Some omit it
  // (e.g. hex 3 starts directly with "元亨，利貞，…"). Be lenient.
  const out = String(s).trim();
  const re = new RegExp(`^${escapeRegex(name)}\\s*[：:]\\s*`);
  return out.replace(re, "").trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dropMatch(arr, predicate) {
  const idx = arr.findIndex(predicate);
  if (idx < 0) return [arr, undefined];
  const item = arr[idx];
  const next = [...arr.slice(0, idx), ...arr.slice(idx + 1)];
  return [next, item];
}

async function main() {
  await mkdir(cacheDir, { recursive: true });
  const raw = await fetchSource();
  if (!Array.isArray(raw) || raw.length !== 64) {
    throw new Error(
      `Expected 64-entry array from upstream, got ${Array.isArray(raw) ? raw.length : typeof raw}`,
    );
  }

  const byTopFirst = new Map();
  for (const entry of raw) {
    const top = bottomFirstToTopFirst(entry.id);
    byTopFirst.set(top, entry);
  }
  if (byTopFirst.size !== 64) {
    throw new Error(`Upstream had ${byTopFirst.size} unique ids, expected 64`);
  }

  const dataset = {};
  const issues = [];

  for (let n = 1; n <= 64; n++) {
    const top = topFirstFromWilhelm(n);
    const z = byTopFirst.get(top);
    if (!z) {
      issues.push({ n, why: `no upstream entry for top-first ${top}` });
      continue;
    }

    let yao = Array.isArray(z.yao_ci) ? [...z.yao_ci] : [];
    let yongJiu;
    let yongLiu;
    [yao, yongJiu] = dropMatch(yao, (s) => String(s).startsWith("用九"));
    [yao, yongLiu] = dropMatch(yao, (s) => String(s).startsWith("用六"));
    if (yongJiu) yongJiu = stripPositionLabel(yongJiu, YONG_LABELS);
    if (yongLiu) yongLiu = stripPositionLabel(yongLiu, YONG_LABELS);

    if (yao.length !== 6) {
      issues.push({ n, why: `expected 6 line statements, got ${yao.length}` });
    }

    const lines = {};
    for (let pos = 1; pos <= 6; pos++) {
      const cell = yao[pos - 1] ?? "";
      lines[String(pos)] = { text: stripPositionLabel(cell, POSITION_LABELS) };
    }

    const judgment = stripJudgmentLabel(z.gua_ci ?? "", z.name ?? "");
    const image = String(z.da_xiang ?? "").trim();

    dataset[String(n)] = {
      hex: n,
      hex_font: String(z.symbol ?? "").trim(),
      name: String(z.name ?? "").trim(),
      zhouyi_judgment: { text: judgment },
      zhouyi_image: { text: image },
      zhouyi_lines: lines,
      yong_jiu: yongJiu || undefined,
      yong_liu: yongLiu || undefined,
    };

    console.log(
      `  Hex ${String(n).padStart(2, "0")} (${top}): ${dataset[String(n)].name} J=${judgment.length}ch I=${image.length}ch lines=${Object.values(lines).filter((l) => l.text.length > 0).length}/6 yong=${yongJiu ? "九" : yongLiu ? "六" : "—"}`,
    );
  }

  const body =
    "// Generated by tools/ingest-zhouyi.mjs from freizl/yijing zh-TW/64gua.json.\n" +
    "// Source: https://github.com/freizl/yijing/blob/master/zh-TW/64gua.json\n" +
    "// Translator: Original Zhou Yi (周易) — Classical Chinese, public domain.\n" +
    "// We strip position labels from yao_ci so each line.text is the prose only.\n\n" +
    "export default " +
    JSON.stringify(dataset, null, 2) +
    ";\n";
  await writeFile(finalOut, body, "utf8");
  console.log("\nWrote", finalOut);

  if (issues.length > 0) {
    console.warn(`\nFinished with ${issues.length} issues:`);
    for (const it of issues) console.warn("  ", it);
    process.exitCode = 1;
  } else {
    console.log("\nAll 64 hexagrams ingested cleanly.");
  }
}

await main();
