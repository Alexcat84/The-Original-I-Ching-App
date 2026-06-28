#!/usr/bin/env node
/**
 * Regenerates apps/web/fonts/noto-serif-tc-hexagram-titles.woff2 — a custom Noto Serif TC
 * (weight 700) subset containing exactly the hanzi this app ever needs to render in
 * overlay titles, derived from the real hexagram data (not a generic pre-built subset).
 *
 * WHY THIS EXISTS: @fontsource/noto-serif-tc's pre-built "chinese-traditional-700" subset
 * is missing 3 real characters used in production data (夬 #43, 姤 #44, 遯 Zhou Yi #33 —
 * verified with fontkit, see docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md
 * §10). Google's css2 API, given the exact character list via `text=`, subsets from the
 * FULL upstream Noto Serif TC font (which does have these — also fontkit-verified), so
 * fetching our own subset closes the gap instead of waiting on Fontsource to repackage.
 *
 * Run after any change to a translator's chineseName/name data:
 *   node apps/web/scripts/generate-cjk-title-font-subset.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..", "..", "..");
const OUTPUT_PATH = path.join(__dirname, "..", "fonts", "noto-serif-tc-hexagram-titles.woff2");

async function main() {
  const load = async (p) => (await import(pathToFileURL(p).href, { with: { type: "json" } })).default;
  const wilhelm = await load(
    path.join(REPO_ROOT, "packages/iching-data/src/generated/hexagrams.wilhelm.json"),
  );
  const legge = await load(
    path.join(REPO_ROOT, "packages/iching-data/src/generated/hexagrams.legge.json"),
  );
  const zhouyi = await load(
    path.join(REPO_ROOT, "packages/iching-data/src/generated/hexagrams.zhouyi.json"),
  );

  const chars = new Set();
  for (const bundle of [wilhelm, legge, zhouyi]) {
    for (const hex of bundle.hexagrams) {
      for (const ch of hex.chineseName) chars.add(ch);
    }
  }
  for (const hex of zhouyi.hexagrams) {
    for (const ch of hex.name) chars.add(ch);
  }
  const text = [...chars].join("");
  console.log(`Collected ${chars.size} unique hanzi from real hexagram data.`);

  const cssUrl =
    "https://fonts.googleapis.com/css2?" +
    new URLSearchParams({ family: "Noto Serif TC:wght@700", display: "swap", text }).toString();
  const cssRes = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!cssRes.ok) throw new Error(`Google Fonts css2 request failed: ${cssRes.status}`);
  const css = await cssRes.text();
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)\s*format\('woff2'\)/);
  if (!match) throw new Error("No woff2 url found in css2 response");

  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`Font download failed: ${fontRes.status}`);
  const buf = Buffer.from(await fontRes.arrayBuffer());
  writeFileSync(OUTPUT_PATH, buf);
  console.log(`Wrote ${OUTPUT_PATH} (${buf.length} bytes).`);

  // Verify against fontkit before declaring success — never trust the fetch alone.
  const fontkit = (await import("fontkit")).default ?? (await import("fontkit"));
  const font = fontkit.openSync(OUTPUT_PATH);
  const missing = [...chars].filter((ch) => !font.hasGlyphForCodePoint(ch.codePointAt(0)));
  if (missing.length > 0) {
    throw new Error(`Generated subset is still missing glyphs for: ${missing.join(", ")}`);
  }
  console.log(`Verified: all ${chars.size} characters covered.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
