#!/usr/bin/env node

/**
 * QA code: GEN-WEB-OVR-002 zhouyi-64hex-master-together · v1.1.0
 * Area: scripts/generate-zhouyi-64hex-master-together
 * Family: WEB-OVR
 */

/**
 * Generate 64 Zhou Yi (classical Chinese) consultation-style images via Together AI
 * at Master tier resolution (1504×1504), with production hexagram stamp overlay.
 *
 * Uses the same modules as live consults:
 *   buildImagePrompt (positive anti-text constraints) → Together FLUX → overlay → promo watermark
 *
 * Together parity with apps/web image-provider.ts:
 *   - FLUX Schnell: 12 steps, NO negative_prompt (anti-glyphs in positive prompt)
 *   - Deterministic seed from consultationId (fnv1a32)
 *   - Default output_format jpeg from API
 *
 * Watermark: promotional high-contrast corner mark (98% opacity) — batch only, not in-app tier subtlety.
 *
 * Output (default): tools/output/zhouyi-64hex-master/
 *   hex-01-乾.png … hex-64-未濟.png
 *   manifest.json
 *
 * Prerequisites:
 *   npm run build -w @iching-oracle/image-engine
 *   npm run build -w @iching-oracle/iching-data   (if bundles stale)
 *
 * Env (merged from apps/web/.env.local → apps/web/.env → .env.local → .env):
 *   TOGETHER_API_KEY          (required)
 *   ZHOUYI_64HEX_OUT_DIR      (optional; default tools/output/zhouyi-64hex-master)
 *   HEX_START, HEX_END        (optional; inclusive range 1–64, default 1–64)
 *   ZHOUYI_SEED_SALT          (optional; e.g. retry-1 — new FLUX landscape for same hex number)
 *   TOGETHER_DELAY_MS         (default 1000 — pacing between API calls)
 *   TOGETHER_MAX_RETRIES      (default 4 — retries on 429/5xx)
 *   TOGETHER_IMAGE_MODEL      (default black-forest-labs/FLUX.1-schnell)
 *   TOGETHER_IMAGE_STEPS      (default 10, clamped 1–12)
 *   TOGETHER_GUIDANCE_SCALE   (optional)
 *   TOGETHER_IMAGE_SEED       (optional; omit for varied landscapes per hex)
 *
 * Usage:
 *   npm run generate:zhouyi-64hex:master
 *   npm run generate:zhouyi-64hex:master:quick   (hex #1 smoke only)
 *   HEX_START=10 HEX_END=15 npm run generate:zhouyi-64hex:master
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WEB = join(ROOT, "apps", "web");
const quick = process.argv.includes("--quick");

/** Non-empty shell env wins over file merge. */
function snapshotNonEmptyEnvKeys() {
  /** @type {Record<string, string>} */
  const out = {};
  for (const key of Object.keys(process.env)) {
    const v = process.env[key];
    if (typeof v === "string" && v.length > 0) out[key] = v;
  }
  return out;
}

function mergeEnvFile(filePath, lockedKeys) {
  if (!existsSync(filePath)) return;
  let raw = readFileSync(filePath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);

  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    if (!key || key.startsWith("#")) continue;
    if (Object.prototype.hasOwnProperty.call(lockedKeys, key)) continue;

    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val.trim();
  }
}

function loadRepoEnvFiles() {
  const lockedKeys = snapshotNonEmptyEnvKeys();
  for (const filePath of [
    join(ROOT, "apps", "web", ".env.local"),
    join(ROOT, "apps", "web", ".env"),
    join(ROOT, ".env.local"),
    join(ROOT, ".env"),
  ]) {
    mergeEnvFile(filePath, lockedKeys);
  }
}

loadRepoEnvFiles();

const requireFromWeb = createRequire(join(WEB, "package.json"));
const vitestBin = requireFromWeb.resolve("vitest/vitest.mjs");
const env = { ...process.env, GENERATE_ZHOUYI_64HEX: "1" };
if (quick) {
  env.ZHOUYI_64HEX_QUICK = "1";
}

const result = spawnSync(
  process.execPath,
  [vitestBin, "run", "generate-zhouyi-64hex-master-together"],
  { cwd: WEB, stdio: "inherit", env },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
