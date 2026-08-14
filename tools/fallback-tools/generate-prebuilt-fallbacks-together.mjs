#!/usr/bin/env node
/**
 * Prebuilt fallback image generator (Together AI) — local WebP pool
 *
 * Purpose:
 * - Generate deterministic fallback image pools for I Ching and Oracle Bones.
 * - Uses production-quality prompts from @iching-oracle/image-engine (same rotation
 *   system as the live app) — prevents text/glyph contamination in fallback images.
 * - Outputs WebP for smaller Vercel deployment bundle (~60% smaller than PNG).
 * - Store under:
 *   apps/web/public/fallbacks/prebuilt/{iching|bones}/{tier}/{width}x{height}/01..10.webp
 *
 * Default output:
 * - I Ching: 40 images (10 per tier bucket)
 * - Bones:   40 images (10 per tier bucket)
 * - Total:   80 images
 *
 * Usage:
 * - npm run generate:fallbacks:together
 * - or:
 *   node --env-file="apps/web/.env.local" tools/fallback-tools/generate-prebuilt-fallbacks-together.mjs
 *
 * Prerequisite (build production prompt engine first):
 *   npm run build -w @iching-oracle/image-engine
 *
 * Required env:
 * - TOGETHER_API_KEY
 *
 * Optional env:
 * - TOGETHER_IMAGE_MODEL     (default: black-forest-labs/FLUX.1-schnell)
 * - TOGETHER_IMAGE_STEPS     (default: 10, clamped 1..12)
 * - TOGETHER_DELAY_MS        (default: 1000)  — 1 request per second pacing
 * - TOGETHER_MAX_RETRIES     (default: 4)     — retries on 429/5xx
 * - TOGETHER_GUIDANCE_SCALE  (optional; try 7–9 to tighten prompt adherence)
 * - TOGETHER_IMAGE_SEED      (integer; omit for varied generations)
 * - FALLBACKS_PER_BUCKET     (default: 10)
 * - WEBP_QUALITY             (default: 85, range 1-100)
 * - OVERWRITE=1              to regenerate existing images
 * - TARGET_FILES             ';'-separated absolute paths to regenerate specific assets
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

import {
  buildImagePrompt,
  buildOracleBonesImagePrompt,
  buildTogetherNegativePrompt,
  compactTogetherFluxPromptSegment,
  TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS,
  TOGETHER_FLUX_PROMPT_MAX_CHARS,
} from "../../packages/image-engine/dist/index.js";

// sharp is a CJS package in local node_modules — use createRequire for ESM compat
const _require = createRequire(import.meta.url);
const sharp = _require("./node_modules/sharp/lib/index.js");

const API_URL = "https://api.together.xyz/v1/images/generations";
const outputRoot = path.resolve(process.cwd(), "apps", "web", "public", "fallbacks", "prebuilt");
const perBucket = Number(process.env.FALLBACKS_PER_BUCKET ?? "10");
const overwrite = process.env.OVERWRITE === "1" || process.env.OVERWRITE === "true";
const model = process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
const stepsRaw = Number(process.env.TOGETHER_IMAGE_STEPS ?? "10");
const steps = Math.min(12, Math.max(1, Number.isFinite(stepsRaw) ? stepsRaw : 10));
const delayMs = Math.max(0, Number(process.env.TOGETHER_DELAY_MS ?? "1000"));
const maxRetries = Math.max(0, Number(process.env.TOGETHER_MAX_RETRIES ?? "4"));
const webpQuality = Math.min(100, Math.max(1, Number(process.env.WEBP_QUALITY ?? "85")));
const targetFilesRaw = (process.env.TARGET_FILES ?? "").trim();

const tiers = [
  { tier: "free",         width: 1024, height: 768  },
  { tier: "seeker",       width: 1024, height: 1024 },
  { tier: "practitioner", width: 1184, height: 1184 },
  { tier: "master",       width: 1504, height: 1504 },
];

const kinds = ["iching", "bones"];

// Bones: cycle through all 4 verdicts and alternate turtle/ox across the 10 slots
const BONES_PATTERN_IDS  = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2];
const BONES_MEDIUMS      = ["turtle","ox","turtle","ox","turtle","ox","turtle","ox","turtle","ox"];
const BONES_VERDICTS     = [
  "auspicious_clear","auspicious_moderate","inauspicious_moderate","inauspicious_clear",
  "auspicious_clear","auspicious_moderate","inauspicious_moderate","inauspicious_clear",
  "auspicious_clear","auspicious_moderate",
];

/**
 * Build a production-quality prompt for a given kind and slot index.
 * Uses the same rotation system as the live app — varied seeds ensure each
 * slot gets a different composition, light condition, and scene family.
 */
function promptFor(kind, index) {
  if (kind === "iching") {
    // Fake minimal Hexagram object — buildImagePrompt only reads .number for the seed
    return buildImagePrompt(
      { number: (index % 64) + 1 },
      null,
      "general",
      [],
      undefined,
      `local-fallback-iching-${index + 1}`,
    );
  }
  // Bones: landscape-only prompt (NOT a bone/shell closeup — avoids glyph contamination)
  return buildOracleBonesImagePrompt({
    category: "general",
    medium:      BONES_MEDIUMS[index % BONES_MEDIUMS.length],
    patternId:   BONES_PATTERN_IDS[index % BONES_PATTERN_IDS.length],
    verdictLabel: BONES_VERDICTS[index % BONES_VERDICTS.length],
    consultationId: `local-fallback-bones-${index + 1}`,
  });
}

/** Convert raw PNG/JPEG buffer from Together into WebP. */
async function toWebp(buffer) {
  return sharp(buffer).webp({ quality: webpQuality }).toBuffer();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function togetherOptionalFields() {
  const fields = {};
  const gs = process.env.TOGETHER_GUIDANCE_SCALE?.trim();
  if (gs) {
    const n = Number(gs);
    if (Number.isFinite(n) && n > 0) fields.guidance_scale = n;
  }
  const seedRaw = process.env.TOGETHER_IMAGE_SEED?.trim();
  if (seedRaw) {
    const s = Number(seedRaw);
    if (Number.isFinite(s)) fields.seed = Math.trunc(s);
  }
  return fields;
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateTogetherImage({ prompt, width, height }) {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) throw new Error("Missing TOGETHER_API_KEY");

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: compactTogetherFluxPromptSegment(prompt, TOGETHER_FLUX_PROMPT_MAX_CHARS),
        negative_prompt: compactTogetherFluxPromptSegment(
          buildTogetherNegativePrompt(),
          TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS,
        ),
        width,
        height,
        n: 1,
        steps,
        response_format: "url",
        ...togetherOptionalFields(),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const retriable = response.status === 429 || response.status >= 500;
      if (retriable && attempt < maxRetries) {
        const waitMs = 1000 * (attempt + 1);
        console.warn(`[retry] Together ${response.status}, waiting ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }
      throw new Error(`Together failed ${response.status}: ${detail.slice(0, 300)}`);
    }

    const payload = await response.json();
    const url = payload?.data?.[0]?.url;
    if (!url) {
      if (attempt < maxRetries) {
        const waitMs = 1000 * (attempt + 1);
        console.warn(`[retry] Together missing url, waiting ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }
      throw new Error("Together response without image URL");
    }

    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      if (attempt < maxRetries) {
        const waitMs = 1000 * (attempt + 1);
        console.warn(`[retry] Image fetch ${imgRes.status}, waiting ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }
      throw new Error(`Image fetch failed ${imgRes.status}`);
    }

    const rawBuffer = Buffer.from(await imgRes.arrayBuffer());
    return toWebp(rawBuffer);
  }
  throw new Error("Unreachable");
}

function parseTargetFiles() {
  if (!targetFilesRaw) return [];
  return targetFilesRaw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((filePath) => path.resolve(filePath));
}

function inferKindFromPath(absPath) {
  const normalized = absPath.replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("/fallbacks/prebuilt/iching/")) return "iching";
  if (normalized.includes("/fallbacks/prebuilt/bones/")) return "bones";
  return null;
}

async function main() {
  console.log(`[fallback-gen] outputRoot: ${outputRoot}`);
  console.log(`[fallback-gen] model: ${model}, steps: ${steps}, perBucket: ${perBucket}, delayMs: ${delayMs}, maxRetries: ${maxRetries}, webpQuality: ${webpQuality}`);

  const targetFiles = parseTargetFiles();
  if (targetFiles.length > 0) {
    console.log(`[fallback-gen] target mode: ${targetFiles.length} files`);
    for (let i = 0; i < targetFiles.length; i += 1) {
      const absPath = targetFiles[i];
      const kind = inferKindFromPath(absPath);
      if (!kind) {
        console.warn(`[skip-target] cannot infer kind for: ${absPath}`);
        continue;
      }
      const parent = path.dirname(absPath);
      await ensureDir(parent);
      const rel = absPath.replace(outputRoot, "").replace(/\\/g, "/");
      console.log(`[regen] ${rel}`);
      const prompt = promptFor(kind, i + 1);
      const sizeMatch = absPath.match(/(\d+)x(\d+)/);
      const width  = sizeMatch ? Number(sizeMatch[1]) : 1024;
      const height = sizeMatch ? Number(sizeMatch[2]) : 1024;
      const buffer = await generateTogetherImage({ prompt, width, height });
      await writeFile(absPath, buffer);
      if (delayMs > 0) await sleep(delayMs);
    }
    console.log("[fallback-gen] done (target mode)");
    return;
  }

  for (const kind of kinds) {
    for (const tier of tiers) {
      const dir = path.join(outputRoot, kind, tier.tier, `${tier.width}x${tier.height}`);
      await ensureDir(dir);
      for (let i = 0; i < perBucket; i += 1) {
        const fileName = `${String(i + 1).padStart(2, "0")}.webp`;
        const filePath = path.join(dir, fileName);
        if (!overwrite && (await exists(filePath))) {
          console.log(`[skip] ${kind}/${tier.tier}/${tier.width}x${tier.height}/${fileName}`);
          continue;
        }
        const prompt = promptFor(kind, i);
        console.log(`[gen] ${kind}/${tier.tier}/${tier.width}x${tier.height}/${fileName}`);
        const buffer = await generateTogetherImage({ prompt, width: tier.width, height: tier.height });
        await writeFile(filePath, buffer);
        if (delayMs > 0) await sleep(delayMs);
      }
    }
  }

  console.log("[fallback-gen] done");
}

main().catch((error) => {
  console.error("[fallback-gen] failed:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
