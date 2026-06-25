#!/usr/bin/env node
/**
 * Generate local sumi-e fallback PNG samples for visual glyph QA (no Together tokens).
 *
 * Uses production paths:
 *   buildSumiHexagramSvgDataUrl → embedCjkFontInOverlaySvg → renderSvgToPng
 *
 * Output: reports/sumi-fallback-glyphs/
 *   wilhelm/                    — 64 static PNGs
 *   legge/                      — 64 static PNGs (Legge diacritics incl. Hăng, Žin…)
 *   trigrams/                   — 8 pure doubled hex × 2 translators
 *   mutations/by-hex/{wil,leg}/ — 64×2 one-changing-line titles with →
 *   mutations/fixtures/{wil,leg}/ — MUTATION_QA_FIXTURES × 2 (用九/用六, etc.)
 *
 * Usage:
 *   npm run generate:sumi-fallback-glyphs
 *   npm run generate:sumi-fallback-glyphs:quick   (smoke only, no PNG dump)
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WEB = join(ROOT, "apps", "web");
const quick = process.argv.includes("--quick");

const requireFromWeb = createRequire(join(WEB, "package.json"));
const vitestBin = requireFromWeb.resolve("vitest/vitest.mjs");
const env = { ...process.env };
if (!quick) {
  env.GENERATE_SUMI_GLYPH_SAMPLES = "1";
}

const result = spawnSync(
  process.execPath,
  [vitestBin, "run", "sumi-fallback-glyph-samples"],
  { cwd: WEB, stdio: "inherit", env },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
