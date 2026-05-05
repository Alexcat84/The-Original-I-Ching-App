#!/usr/bin/env node
/**
 * Generate raster samples using production iching prompts (Together FLUX).
 * Use this to compare hallucinations (corner seals, fake dates, etc.). Product watermark is unchanged.
 *
 * Prerequisite:
 *   npm run build -w @iching-oracle/image-engine
 *
 * Usage:
 *   node --env-file=apps/web/.env.local tools/fallback-tools/generate-together-iching-samples.mjs
 *
 * Env:
 *   TOGETHER_API_KEY (required)
 *   SAMPLE_COUNT (default 3)
 *   SAMPLE_OUT_DIR (default tools/output/together-iching-samples)
 *   SAMPLE_CATEGORY love_relationship | career_work | general | ... (default general)
 *   SAMPLE_WIDTH, SAMPLE_HEIGHT (default 1024x768 — multiples of 32)
 *   TOGETHER_IMAGE_MODEL, TOGETHER_IMAGE_STEPS (same as prod)
 *   TOGETHER_GUIDANCE_SCALE, TOGETHER_IMAGE_SEED, TOGETHER_OUTPUT_FORMAT (same optional knobs as prod)
 *
 * QA matrix (manual visual inspection — raster only, ignore intentional watermark after finalize):
 *   Same seed + sweep TOGETHER_GUIDANCE_SCALE e.g. unset vs 7 vs 9 for hallucination rate.
 *   Same seed + steps 4 vs 10 via TOGETHER_IMAGE_STEPS.
 *
 * Variación de encuadre (hash interno buildImagePrompt):
 * - Por defecto: consultationId único por muestra (UUID) + número de hexagrama rotado → composición/luz distinta.
 * - SAMPLE_FIXED_PROMPT=1: modo reproducible (hexagrama 21 + SAMPLE_CONSULTATION_ID o "repro-fixed-sample").
 * - Quita TOGETHER_IMAGE_SEED del .env si quieres imágenes distintas entre ejecuciones (si está fijo, FLUX repite).
 *
 * Opcional: SAMPLE_DELAY_MS (ms entre muestras, default 0).
 *
 * Si el terminal falla:
 * - node --env-file requiere Node 20.6+ (comprueba: node -v). Si es viejo, usa: npm i -g dotenv-cli
 *   y luego: dotenv -e .env -- node tools/fallback-tools/generate-together-iching-samples.mjs
 * - Cannot find module ... image-engine/dist: ejecuta npm run build -w @iching-oracle/image-engine
 * - 429 / rate limit: usa SAMPLE_DELAY_MS aquí o SAMPLE_COUNT=1 entre intentos.
 */
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const pkgDist = path.join(repoRoot, "packages", "image-engine", "dist", "index.js");

const API_URL = "https://api.together.xyz/v1/images/generations";

function compactTogetherFluxPromptSegment(prompt, maxLen) {
  return prompt
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, "")
    .slice(0, maxLen);
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
  const fmt = process.env.TOGETHER_OUTPUT_FORMAT?.trim().toLowerCase();
  if (fmt === "jpeg" || fmt === "png") fields.output_format = fmt;
  return fields;
}

async function loadEngine() {
  try {
    return await import(pathToFileURL(pkgDist).href);
  } catch (e) {
    console.error(
      `[samples] Failed to import image-engine from ${pkgDist}. Run: npm run build -w @iching-oracle/image-engine`,
    );
    throw e;
  }
}

async function generateTogetherRaster(engine, { prompt, negativePrompt, width, height }) {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) throw new Error("Missing TOGETHER_API_KEY");

  const model = process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
  const stepsRaw = Number(process.env.TOGETHER_IMAGE_STEPS ?? "10");
  const steps = Math.min(12, Math.max(1, Number.isFinite(stepsRaw) ? stepsRaw : 10));

  const { TOGETHER_FLUX_PROMPT_MAX_CHARS, TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS } = engine;

  const promptForApi = compactTogetherFluxPromptSegment(prompt, TOGETHER_FLUX_PROMPT_MAX_CHARS);
  const negativeForApi = compactTogetherFluxPromptSegment(negativePrompt, TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS);

  console.info("[samples] lens", {
    promptChars: prompt.length,
    promptApiChars: promptForApi.length,
    negativeChars: negativePrompt.length,
    negativeApiChars: negativeForApi.length,
    primarySetting: promptForApi.includes("PRIMARY SETTING"),
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: promptForApi,
      negative_prompt: negativeForApi,
      width,
      height,
      n: 1,
      steps,
      response_format: "url",
      ...togetherOptionalFields(),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Together ${res.status}: ${detail.slice(0, 400)}`);
  }
  const payload = await res.json();
  const url = payload?.data?.[0]?.url;
  if (!url) throw new Error("Together response without url");

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status}`);
  return Buffer.from(await imgRes.arrayBuffer());
}

async function main() {
  const engine = await loadEngine();
  const { buildImagePrompt, buildTogetherNegativePrompt } = engine;

  const count = Math.max(1, Number(process.env.SAMPLE_COUNT ?? "3"));
  const outDir = path.resolve(repoRoot, process.env.SAMPLE_OUT_DIR ?? "tools/output/together-iching-samples");
  const category = process.env.SAMPLE_CATEGORY ?? "general";
  const width = Math.max(32, Number(process.env.SAMPLE_WIDTH ?? "1024"));
  const height = Math.max(32, Number(process.env.SAMPLE_HEIGHT ?? "768"));

  const fixedPrompt =
    process.env.SAMPLE_FIXED_PROMPT === "1" || process.env.SAMPLE_FIXED_PROMPT === "true";

  if (process.env.TOGETHER_IMAGE_SEED?.trim() && !fixedPrompt) {
    console.warn(
      "[samples] TOGETHER_IMAGE_SEED is set — Together FLUX will tend to produce the same image each run. Remove it from .env for varied landscapes.",
    );
  }

  await mkdir(outDir, { recursive: true });

  console.info(`[samples] writing ${count} file(s) to ${outDir} (${width}x${height}, category=${category})`);

  const delayMs = Math.max(0, Number(process.env.SAMPLE_DELAY_MS ?? "0"));

  for (let i = 0; i < count; i += 1) {
    const consultationId = fixedPrompt
      ? (process.env.SAMPLE_CONSULTATION_ID ?? "repro-fixed-sample")
      : process.env.SAMPLE_CONSULTATION_ID
        ? `${process.env.SAMPLE_CONSULTATION_ID}-${randomUUID()}`
        : randomUUID();

    const stubHexagram = { number: fixedPrompt ? 21 : ((i * 23 + 7) % 64) + 1 };

    console.info("[samples] variant", { hexagram: stubHexagram.number, fixedPrompt });

    const prompt = buildImagePrompt(stubHexagram, null, category, [], undefined, consultationId);
    const negativePrompt = buildTogetherNegativePrompt();

    const buf = await generateTogetherRaster(engine, {
      prompt,
      negativePrompt,
      width,
      height,
    });

    const ext = process.env.TOGETHER_OUTPUT_FORMAT?.trim().toLowerCase() === "jpeg" ? "jpg" : "png";
    const filePath = path.join(outDir, `iching-${category}-${width}x${height}-${String(i + 1).padStart(2, "0")}.${ext}`);
    await writeFile(filePath, buf);
    console.info("[samples] wrote", path.relative(repoRoot, filePath));

    if (delayMs > 0 && i < count - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.info("[samples] done — inspect rasters for model hallucinations (not product watermark).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
