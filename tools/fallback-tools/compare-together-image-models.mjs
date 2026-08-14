#!/usr/bin/env node
/**
 * Together AI image-model comparison harness.
 *
 * Purpose: pick a replacement for black-forest-labs/FLUX.1-schnell (serverless
 * deprecation announced for 2026-08-19) on evidence rather than on the vendor's
 * recommendation. Generates the SAME production prompt across several candidate
 * models and reports, per model:
 *
 *   - capability: does it accept `negative_prompt`? `steps`? our tier sizes?
 *   - fidelity:   are the returned pixels the size we asked for (pixelaje)?
 *   - latency:    ms per image, against the app's 65s abort budget
 *   - cost:       from the live catalog pricing
 *   - cleanliness: heuristic screens for the failure mode we already fought and
 *                  fixed on FLUX (spurious red seals / chops and margin "text"),
 *                  see docs "Mitigacion de glifos" in CLAUDE.md
 *
 * The cleanliness numbers are SCREENS, not verdicts: they rank images so a human
 * looks at the suspicious ones first. Every raster is written to disk precisely
 * so the final call is made by eye.
 *
 * Usage:
 *   npm run build -w @iching-oracle/image-engine     # prompts come from production engine
 *   node --env-file=apps/web/.env tools/fallback-tools/compare-together-image-models.mjs
 *
 * Options (env):
 *   MODELS        ';'-separated model ids (default: the shortlist below)
 *   SAMPLES       images per model (default 3)
 *   SIZE          WxH (default 1024x1024, the seeker tier)
 *   OUT_DIR       default tools/output/model-comparison
 *   DELAY_MS      pacing between calls (default 1200)
 *
 * Requires TOGETHER_API_KEY. Makes real API calls and costs real money
 * (roughly a cent per model at defaults).
 */
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

/**
 * Shortlist rationale (prices from the live /v1/models catalog, 2026-08-13):
 *   FLUX.1-schnell      0.0027/MP  the incumbent, dies 2026-08-19: the BASELINE
 *   Juggernaut-Lightning-Flux 0.0017/img  FLUX fine-tune, cheapest on the list
 *   Juggernaut-pro-flux 0.0049/img  FLUX fine-tune, quality-oriented
 *   Qwen-Image          0.0058/img  Together's official recommendation
 *   FLUX.2-dev          0.0154/img  current-generation FLUX
 */
const DEFAULT_MODELS = [
  "black-forest-labs/FLUX.1-schnell",
  "Rundiffusion/Juggernaut-Lightning-Flux",
  "RunDiffusion/Juggernaut-pro-flux",
  "Qwen/Qwen-Image",
  "black-forest-labs/FLUX.2-dev",
];

const MODELS = (process.env.MODELS?.trim() ? process.env.MODELS.split(";") : DEFAULT_MODELS)
  .map((m) => m.trim())
  .filter(Boolean);
const SAMPLES = Math.max(1, Number(process.env.SAMPLES ?? 3));
const [REQ_W, REQ_H] = (process.env.SIZE ?? "1024x1024").split("x").map(Number);
const OUT_DIR = path.resolve(repoRoot, process.env.OUT_DIR ?? "tools/output/model-comparison");
const DELAY_MS = Number(process.env.DELAY_MS ?? 1200);
const API_KEY = process.env.TOGETHER_API_KEY;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

async function loadEngine() {
  const dist = path.join(repoRoot, "packages", "image-engine", "dist", "index.js");
  try {
    return await import(pathToFileURL(dist).href);
  } catch {
    throw new Error(`Cannot import image-engine from ${dist}. Run: npm run build -w @iching-oracle/image-engine`);
  }
}

/**
 * One generation attempt with explicit capability degradation: if the model
 * rejects a field we send, drop it and retry, recording what it refused. That
 * is exactly the information we need, because image-provider.ts decides whether
 * to send negative_prompt purely from whether the model name says "schnell".
 */
async function generate({ model, prompt, negativePrompt, width, height, steps }) {
  const caps = { negativePrompt: null, steps: null };
  let body = { model, prompt, width, height, n: 1, negative_prompt: negativePrompt, steps };
  let lastErr = "";

  for (let attempt = 0; attempt < 4; attempt++) {
    const started = Date.now();
    const res = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const ms = Date.now() - started;

    if (res.ok) {
      const payload = await res.json();
      const item = payload?.data?.[0];
      let buf = null;
      if (item?.b64_json) buf = Buffer.from(item.b64_json, "base64");
      else if (item?.url) {
        const img = await fetch(item.url);
        if (!img.ok) return { ok: false, error: `image fetch ${img.status}`, ms, caps };
        buf = Buffer.from(await img.arrayBuffer());
      }
      if (!buf) return { ok: false, error: "response had no image", ms, caps };
      if (caps.negativePrompt === null) caps.negativePrompt = true;
      if (caps.steps === null) caps.steps = true;
      return { ok: true, buf, ms, caps };
    }

    const text = await res.text().catch(() => "");
    lastErr = `HTTP ${res.status} ${text.slice(0, 200)}`;
    const lower = text.toLowerCase();

    // 429 is capacity, NOT a rejected field: back off and retry the SAME body,
    // otherwise a busy model looks like one that refuses negative_prompt/steps.
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 4000 * (attempt + 1);
      await sleep(waitMs);
      continue;
    }

    // Degrade one capability at a time so we learn which field was the problem.
    if ("negative_prompt" in body && lower.includes("negative")) {
      caps.negativePrompt = false;
      delete body.negative_prompt;
      continue;
    }
    if ("steps" in body && lower.includes("step")) {
      caps.steps = false;
      delete body.steps;
      continue;
    }
    // Unknown 4xx with both extras still on: strip them together and retry once.
    if (res.status >= 400 && res.status < 500 && ("negative_prompt" in body || "steps" in body)) {
      if ("negative_prompt" in body) { caps.negativePrompt = false; delete body.negative_prompt; }
      if ("steps" in body) { caps.steps = false; delete body.steps; }
      continue;
    }
    return { ok: false, error: lastErr, ms, caps };
  }
  return { ok: false, error: lastErr || "retries exhausted", ms: 0, caps };
}

/**
 * Cleanliness screens for the known FLUX failure mode (see CLAUDE.md):
 *  - sealScore:  share of strongly-red, saturated pixels. Red chops/seals are
 *                the signature contamination and nothing in an ink landscape
 *                should be vivid red.
 *  - marginInk:  share of near-black pixels sitting in the outer 12% band. Fake
 *                calligraphy and museum-style borders cluster at the margins.
 * Both are proxies for human review, not ground truth.
 */
/** 24x24 RGB thumbnail used to compare images against each other. */
async function fingerprint(buf) {
  const { data, info } = await sharp(buf).resize(24, 24, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  return { data, ch: info.channels };
}

/** Mean absolute RGB difference (0-255) between two fingerprints. */
function fpDistance(a, b) {
  let sum = 0, n = 0;
  for (let i = 0; i < a.data.length; i += a.ch) {
    sum += Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
    n += 3;
  }
  return sum / n;
}

async function analyze(buf) {
  const img = sharp(buf);
  const meta = await img.metadata();
  const W = 256;
  const { data, info } = await img.resize(W, W, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  let redPixels = 0;
  let marginDark = 0;
  let marginTotal = 0;
  const band = Math.floor(info.height * 0.12);

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // Vivid red: clearly dominant R, and not just a warm grey.
      if (r > 110 && r - g > 55 && r - b > 55) redPixels++;
      const inMargin = y < band || y >= info.height - band || x < band || x >= info.width - band;
      if (inMargin) {
        marginTotal++;
        if (r < 60 && g < 60 && b < 60) marginDark++;
      }
    }
  }
  // Border / letterbox screen: an outer ring that is both very bright and very
  // flat means the model drew a framed picture instead of filling the canvas,
  // which the prompt explicitly forbids ("seamless landscape from corner to
  // corner"). Measured on the outermost 3% ring.
  const ring = Math.max(2, Math.floor(info.height * 0.03));
  let ringSum = 0, ringN = 0;
  const ringVals = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const onRing = y < ring || y >= info.height - ring || x < ring || x >= info.width - ring;
      if (!onRing) continue;
      const i = (y * info.width + x) * ch;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      ringVals.push(lum);
      ringSum += lum;
      ringN++;
    }
  }
  const ringMean = ringSum / Math.max(1, ringN);
  const ringVar = ringVals.reduce((a, v) => a + (v - ringMean) ** 2, 0) / Math.max(1, ringN);
  const ringStd = Math.sqrt(ringVar);
  const hasBorder = ringMean > 225 && ringStd < 22;

  const total = info.width * info.height;
  return {
    actualWidth: meta.width ?? null,
    actualHeight: meta.height ?? null,
    bytes: buf.length,
    sealScore: +(redPixels / total * 100).toFixed(3),
    marginInk: +(marginDark / Math.max(1, marginTotal) * 100).toFixed(2),
    ringMean: +ringMean.toFixed(1),
    ringStd: +ringStd.toFixed(1),
    hasBorder,
  };
}

async function main() {
  if (!API_KEY) throw new Error("TOGETHER_API_KEY missing. Run with --env-file=apps/web/.env");
  const { buildImagePrompt, buildTogetherNegativePrompt } = await loadEngine();
  const negativePrompt = buildTogetherNegativePrompt();

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Comparing ${MODELS.length} models, ${SAMPLES} sample(s) each at ${REQ_W}x${REQ_H}`);
  console.log(`Output: ${path.relative(repoRoot, OUT_DIR)}\n`);

  // Same prompts for every model: identical hexagrams, categories and
  // consultation ids, so differences in the output are the model, not the
  // prompt. Categories rotate because production does: the category drives the
  // environment and palette, and pinning it to "general" understates how varied
  // the real prompt stream is.
  const CATEGORIES = [
    "love_relationship", "career_work", "health_wellbeing", "spiritual_inner",
    "family_home", "decision_path", "conflict_challenge", "travel_change", "general",
  ];
  const cases = Array.from({ length: SAMPLES }, (_, i) => ({
    hexagram: ((i * 23 + 7) % 64) + 1,
    category: CATEGORIES[i % CATEGORIES.length],
    consultationId: `model-compare-${i + 1}-${randomUUID()}`,
  }));

  const rows = [];
  /** Per-model thumbnails, used at the end to score how varied its output is. */
  const fingerprints = new Map(MODELS.map((m) => [m, []]));
  for (const model of MODELS) {
    const dir = path.join(OUT_DIR, slug(model));
    await mkdir(dir, { recursive: true });
    console.log(`\n=== ${model} ===`);

    for (const [idx, c] of cases.entries()) {
      const prompt = buildImagePrompt({ number: c.hexagram }, null, c.category, [], undefined, c.consultationId);
      // Ask for the same step budget the app uses for non-schnell models.
      const steps = model.toLowerCase().includes("schnell") ? 12 : 20;
      const res = await generate({ model, prompt, negativePrompt, width: REQ_W, height: REQ_H, steps });

      if (!res.ok) {
        console.log(`  [${idx + 1}/${SAMPLES}] hex ${c.hexagram}: FAILED ${res.error}`);
        rows.push({ model, hexagram: c.hexagram, ok: false, error: res.error, ms: res.ms, ...res.caps });
        await sleep(DELAY_MS);
        continue;
      }

      const a = await analyze(res.buf);
      const file = path.join(dir, `hex-${String(c.hexagram).padStart(2, "0")}-${idx + 1}.png`);
      await writeFile(file, res.buf);
      fingerprints.get(model).push(await fingerprint(res.buf));

      const sizeOk = a.actualWidth === REQ_W && a.actualHeight === REQ_H;
      console.log(
        `  [${idx + 1}/${SAMPLES}] hex ${c.hexagram}: ${res.ms}ms  ${a.actualWidth}x${a.actualHeight}` +
        `${sizeOk ? "" : "  <-- SIZE MISMATCH"}  seal=${a.sealScore}%  margin=${a.marginInk}%` +
        `${a.hasBorder ? "  <-- BORDE/MARCO" : ""}  ${(a.bytes / 1024).toFixed(0)}KB`,
      );
      rows.push({ model, hexagram: c.hexagram, ok: true, ms: res.ms, sizeOk, ...a, ...res.caps });
      await sleep(DELAY_MS);
    }
  }

  // Aggregate per model.
  console.log(`\n\n${"=".repeat(70)}\nRESUMEN\n${"=".repeat(70)}`);
  const summary = [];
  for (const model of MODELS) {
    const mine = rows.filter((r) => r.model === model);
    const ok = mine.filter((r) => r.ok);
    const avg = (k) => (ok.length ? +(ok.reduce((s, r) => s + (r[k] ?? 0), 0) / ok.length).toFixed(2) : null);

    // Diversity: mean pairwise distance between this model's own images. The
    // prompts differ by construction, so a low number means the model collapses
    // different prompts into the same picture (what "all the images look alike"
    // actually is, measured).
    const fps = fingerprints.get(model) ?? [];
    let diversity = null;
    if (fps.length >= 2) {
      let sum = 0, c = 0;
      for (let i = 0; i < fps.length; i++) for (let j = i + 1; j < fps.length; j++) { sum += fpDistance(fps[i], fps[j]); c++; }
      diversity = +(sum / c).toFixed(1);
    }
    const borders = ok.filter((r) => r.hasBorder).length;

    summary.push({
      modelo: model,
      ok: `${ok.length}/${mine.length}`,
      diversidad: diversity,
      "bordes/marco": ok.length ? `${borders}/${ok.length}` : "-",
      "ms medio": avg("ms"),
      "tamano correcto": ok.length ? (ok.every((r) => r.sizeOk) ? "si" : "NO") : "-",
      "seal% medio": avg("sealScore"),
      negative_prompt: mine.find((r) => r.negativePrompt !== null)?.negativePrompt ?? "?",
      error: mine.find((r) => !r.ok)?.error?.slice(0, 50) ?? "",
    });
  }
  console.table(summary);

  const reportPath = path.join(OUT_DIR, "report.json");
  await writeFile(reportPath, JSON.stringify({ requested: { width: REQ_W, height: REQ_H }, samples: SAMPLES, rows, summary }, null, 2));
  console.log(`\nDetalle: ${path.relative(repoRoot, reportPath)}`);
  console.log("Revisa las imagenes a ojo: los scores son solo un filtro para priorizar.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
