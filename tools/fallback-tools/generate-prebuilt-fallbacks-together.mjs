#!/usr/bin/env node
/**
 * Prebuilt fallback image generator (Together AI)
 *
 * Purpose:
 * - Generate deterministic fallback image pools for I Ching and Oracle Bones.
 * - Store them under:
 *   apps/web/public/fallbacks/prebuilt/{iching|bones}/{tier}/{width}x{height}/01..10.png
 * - These assets are used when Together fails at runtime, selected by type+tier+resolution.
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
 * Required env:
 * - TOGETHER_API_KEY
 *
 * Optional env:
 * - TOGETHER_IMAGE_MODEL (default: black-forest-labs/FLUX.1-schnell)
 * - TOGETHER_IMAGE_STEPS (default: 10, clamped 1..12)
 * - TOGETHER_DELAY_MS (default: 1000)  // 1 request per second pacing
 * - TOGETHER_MAX_RETRIES (default: 4)  // retries on 429/5xx / transient failures
 * - FALLBACKS_PER_BUCKET (default: 10)
 * - OVERWRITE=1 to regenerate existing images
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const API_URL = "https://api.together.xyz/v1/images/generations";
const outputRoot = path.resolve(process.cwd(), "apps", "web", "public", "fallbacks", "prebuilt");
const perBucket = Number(process.env.FALLBACKS_PER_BUCKET ?? "10");
const overwrite = process.env.OVERWRITE === "1" || process.env.OVERWRITE === "true";
const model = process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
const stepsRaw = Number(process.env.TOGETHER_IMAGE_STEPS ?? "10");
const steps = Math.min(12, Math.max(1, Number.isFinite(stepsRaw) ? stepsRaw : 10));
const delayMs = Math.max(0, Number(process.env.TOGETHER_DELAY_MS ?? "1000"));
const maxRetries = Math.max(0, Number(process.env.TOGETHER_MAX_RETRIES ?? "4"));

const tiers = [
  { tier: "free", width: 1024, height: 768 },
  { tier: "seeker", width: 1024, height: 1024 },
  { tier: "practitioner", width: 1184, height: 1184 },
  { tier: "master", width: 1504, height: 1504 },
];

const kinds = ["iching", "bones"];

const ICHING_PROMPTS = [
  "Ancient Chinese ink painting, mountain temple at dusk, elegant hexagram bars, subtle moon glow, premium spiritual aesthetic, no text watermark",
  "Sumi-e oracle landscape with pavilion and mist, contemplative atmosphere, vertical brush textures, high contrast focal composition",
  "I Ching inspired scene, moonlit bridge, soft clouds, balanced composition for chat card fallback, no logos, no letters",
  "Zen courtyard with pines and stone path, cinematic ink wash style, symbolic oracle mood, clean center framing",
  "Classical East Asian painting style, layered mountains and lake reflection, poetic yet minimal, rich tonal range",
];

const BONES_PROMPTS = [
  "Oracle bone divination plate close-up, cracked turtle plastron, warm cinematic light, ritual altar mood, no readable text",
  "Ancient divination shell on wooden altar, natural crack lines, dramatic side lighting, realistic but stylized, no logos",
  "Chinese oracle bones aesthetic, circular carved shell with fissures, premium 3D render look, clean framing",
  "Sacred divination object, cracked bone texture, fire-lit atmosphere, high detail materials, no labels or symbols",
  "Ritual shell macro composition, historical spiritual mood, subtle depth of field, elegant neutral palette",
];

function promptFor(kind, index) {
  const list = kind === "iching" ? ICHING_PROMPTS : BONES_PROMPTS;
  const base = list[index % list.length];
  return `${base}. Variation ${index + 1}.`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  if (!key) {
    throw new Error("Missing TOGETHER_API_KEY");
  }
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: prompt.slice(0, 1500),
        width,
        height,
        n: 1,
        steps,
        response_format: "url",
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
    return Buffer.from(await imgRes.arrayBuffer());
  }
  throw new Error("Unreachable");
}

async function main() {
  console.log(`[fallback-gen] outputRoot: ${outputRoot}`);
  console.log(`[fallback-gen] model: ${model}, steps: ${steps}, perBucket: ${perBucket}, delayMs: ${delayMs}, maxRetries: ${maxRetries}`);

  for (const kind of kinds) {
    for (const tier of tiers) {
      const dir = path.join(outputRoot, kind, tier.tier, `${tier.width}x${tier.height}`);
      await ensureDir(dir);
      for (let i = 0; i < perBucket; i += 1) {
        const fileName = `${String(i + 1).padStart(2, "0")}.png`;
        const filePath = path.join(dir, fileName);
        if (!overwrite && (await exists(filePath))) {
          console.log(`[skip] ${kind}/${tier.tier}/${tier.width}x${tier.height}/${fileName}`);
          continue;
        }
        const prompt = promptFor(kind, i);
        console.log(`[gen] ${kind}/${tier.tier}/${tier.width}x${tier.height}/${fileName}`);
        const buffer = await generateTogetherImage({
          prompt,
          width: tier.width,
          height: tier.height,
        });
        await writeFile(filePath, buffer);
        if (delayMs > 0) {
          await sleep(delayMs);
        }
      }
    }
  }

  console.log("[fallback-gen] done");
}

main().catch((error) => {
  console.error("[fallback-gen] failed:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
