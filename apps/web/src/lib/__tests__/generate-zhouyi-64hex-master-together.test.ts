/**
 * QA code: TS-WEB-OVR-009 zhouyi-64hex-master-together · v1.1.0
 * Area: scripts/generate-zhouyi-64hex-master-together
 * Family: WEB-OVR
 */

import { access, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { getAllHexagramRecords, type HexagramRecord } from "@iching-oracle/iching-data";
import {
  buildImagePrompt,
  buildTogetherNegativePrompt,
  compactTogetherFluxPromptSegment,
  TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS,
  TOGETHER_FLUX_PROMPT_MAX_CHARS,
} from "@iching-oracle/image-engine";
import { describe, expect, it } from "vitest";
import { embedCjkFontInOverlaySvg } from "@/lib/embed-svg-overlay-font";
import { renderSvgToPng } from "@/lib/svg-to-png";
import {
  buildSumiHexagramOverlaySvgDataUrl,
  fnv1a32,
  type SumiLineInput,
} from "@/lib/sumi-hexagram-art";
import { applyRasterWatermarkBuffer } from "@/lib/watermark-image";
import sharp from "sharp";

const GENERATE = process.env.GENERATE_ZHOUYI_64HEX === "1";
const QUICK = process.env.ZHOUYI_64HEX_QUICK === "1";
const ROOT = join(process.cwd(), "..", "..");
const OUT_DIR = process.env.ZHOUYI_64HEX_OUT_DIR
  ? resolve(process.env.ZHOUYI_64HEX_OUT_DIR)
  : join(ROOT, "tools", "output", "zhouyi-64hex-master");

const MASTER_WIDTH = 1504;
const MASTER_HEIGHT = 1504;
const API_URL = "https://api.together.xyz/v1/images/generations";
const delayMs = Math.max(0, Number(process.env.TOGETHER_DELAY_MS ?? "1000"));
const maxRetries = Math.max(0, Number(process.env.TOGETHER_MAX_RETRIES ?? "4"));
const overwrite = process.env.OVERWRITE === "1" || process.env.OVERWRITE === "true";
const hexStart = Math.min(64, Math.max(1, Number(process.env.HEX_START ?? "1")));
const hexEnd = Math.min(64, Math.max(hexStart, Number(process.env.HEX_END ?? "64")));
/** Append to consultationId/seed when re-rolling contaminated landscapes (same hex → new FLUX output). */
const seedSalt = process.env.ZHOUYI_SEED_SALT?.trim() ?? "";

/** Promo batch only — full-opacity corner mark for advertising (app consults stay tier-subtle). */
const PROMO_WATERMARK = {
  opacity: 0.98,
  fontSize: 20,
  highContrast: true,
} as const;

function linesFromBinaryTopFirst(binaryTopFirst: string): SumiLineInput[] {
  const bits = binaryTopFirst.padStart(6, "0").slice(-6);
  return [...bits].map((bit, index) => ({
    position: (6 - index) as SumiLineInput["position"],
    value: bit === "1" ? 7 : 8,
    isChanging: false,
  }));
}

function decodeOverlaySvgDataUrl(dataUrl: string): string {
  const prefix = "data:image/svg+xml;charset=utf-8,";
  if (!dataUrl.startsWith(prefix)) {
    throw new Error("Expected overlay SVG data URL");
  }
  return decodeURIComponent(dataUrl.slice(prefix.length));
}

function togetherModelConfig(): { model: string; isSchnell: boolean; steps: number } {
  const model = process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
  const isSchnell = model.toLowerCase().includes("schnell");
  const defaultSteps = isSchnell ? 12 : 20;
  const maxSteps = isSchnell ? 12 : 50;
  const stepsRaw = Number(process.env.TOGETHER_IMAGE_STEPS ?? String(defaultSteps));
  const steps = Math.min(maxSteps, Math.max(1, Number.isFinite(stepsRaw) ? stepsRaw : defaultSteps));
  return { model, isSchnell, steps };
}

/** Mirrors image-provider.ts togetherImageGenerationOptionalFields + generateWithTogether body. */
function togetherOptionalFields(seedBase: string): Record<string, number | string> {
  const fields: Record<string, number | string> = {};
  const gs = process.env.TOGETHER_GUIDANCE_SCALE?.trim();
  if (gs) {
    const n = Number(gs);
    if (Number.isFinite(n) && n > 0) fields.guidance_scale = n;
  }
  const seedRaw = process.env.TOGETHER_IMAGE_SEED?.trim();
  if (seedRaw) {
    const s = Number(seedRaw);
    if (Number.isFinite(s)) {
      fields.seed = seedBase
        ? fnv1a32(`${Math.trunc(s)}:${seedBase}`) % 2_147_483_647
        : Math.trunc(s);
    }
  } else if (seedBase) {
    fields.seed = fnv1a32(seedBase) % 2_147_483_647;
  }
  const fmt = process.env.TOGETHER_OUTPUT_FORMAT?.trim().toLowerCase();
  fields.output_format = fmt === "png" ? "png" : "jpeg";
  return fields;
}

async function generateTogetherLandscape(prompt: string, seedBase: string): Promise<Buffer> {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) {
    throw new Error(
      "Missing TOGETHER_API_KEY. Set it in apps/web/.env.local or export before npm run.",
    );
  }

  const { model, isSchnell, steps } = togetherModelConfig();
  const promptForApi = compactTogetherFluxPromptSegment(prompt, TOGETHER_FLUX_PROMPT_MAX_CHARS);
  const negativeForApi = compactTogetherFluxPromptSegment(
    buildTogetherNegativePrompt(),
    TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS,
  );

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: promptForApi,
        // FLUX Schnell: anti-text lives in the positive prompt (buildImagePrompt), not negative_prompt.
        ...(isSchnell ? {} : { negative_prompt: negativeForApi }),
        width: MASTER_WIDTH,
        height: MASTER_HEIGHT,
        n: 1,
        steps,
        ...togetherOptionalFields(seedBase),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const retriable = res.status === 429 || res.status >= 500;
      if (retriable && attempt < maxRetries) {
        const waitMs = 1000 * (attempt + 1);
        console.warn(`[zhouyi-64hex] Together ${res.status}, retry in ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }
      throw new Error(`Together ${res.status}: ${detail.slice(0, 400)}`);
    }

    const payload = (await res.json()) as {
      data?: Array<{ url?: string; b64_json?: string }>;
    };
    const first = payload?.data?.[0];
    if (first?.b64_json) {
      return Buffer.from(first.b64_json, "base64");
    }
    const url = first?.url;
    if (!url) {
      if (attempt < maxRetries) {
        const waitMs = 1000 * (attempt + 1);
        console.warn(`[zhouyi-64hex] Together missing url, retry in ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }
      throw new Error("Together response without url or b64_json");
    }

    const imgRes = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!imgRes.ok) {
      if (attempt < maxRetries) {
        const waitMs = 1000 * (attempt + 1);
        console.warn(`[zhouyi-64hex] image fetch ${imgRes.status}, retry in ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }
      throw new Error(`Image fetch ${imgRes.status}`);
    }
    return Buffer.from(await imgRes.arrayBuffer());
  }

  throw new Error("Together generation exhausted retries");
}

async function compositeWithProductionOverlay(
  baseBuf: Buffer,
  overlaySvgDataUrl: string,
): Promise<Buffer> {
  const meta = await sharp(baseBuf).metadata();
  const width = meta.width ?? MASTER_WIDTH;
  const height = meta.height ?? MASTER_HEIGHT;
  const overlaySvg = decodeOverlaySvgDataUrl(overlaySvgDataUrl);
  const overlaySized = overlaySvg
    .replace(/width="\d+"/, `width="${width}"`)
    .replace(/height="\d+"/, `height="${height}"`);
  const overlayWithFont = await embedCjkFontInOverlaySvg(overlaySized);
  const overlayPng = await renderSvgToPng(overlayWithFont, width);
  return sharp(baseBuf)
    .composite([{ input: overlayPng, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function outputFileName(hex: Pick<HexagramRecord, "number" | "chineseName">): string {
  const num = String(hex.number).padStart(2, "0");
  return `hex-${num}-${hex.chineseName}.png`;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("generate-zhouyi-64hex-master-together", () => {
  it.skipIf(!GENERATE)("writes Master-tier Zhou Yi stamp images via Together", async () => {
    const rows = [...getAllHexagramRecords({ translator: "zhouyi" })];
    expect(rows).toHaveLength(64);

    await mkdir(OUT_DIR, { recursive: true });

    const rangeStart = QUICK ? 1 : hexStart;
    const rangeEnd = QUICK ? 1 : hexEnd;
    const selected = rows.filter((row) => row.number >= rangeStart && row.number <= rangeEnd);
    expect(selected.length).toBeGreaterThan(0);

    /** @type {Array<{ number: number; chineseName: string; file: string; skipped?: boolean }>} */
    const manifestEntries = [];

    for (let i = 0; i < selected.length; i += 1) {
      const hex = selected[i]!;
      const fileName = outputFileName(hex);
      const outPath = join(OUT_DIR, fileName);

      if (!overwrite && (await fileExists(outPath))) {
        console.info(`[zhouyi-64hex] skip existing ${fileName}`);
        manifestEntries.push({
          number: hex.number,
          chineseName: hex.chineseName,
          file: fileName,
          skipped: true,
        });
        continue;
      }

      const consultationId = seedSalt
        ? `zhouyi-64hex-master-${hex.number}-${seedSalt}`
        : `zhouyi-64hex-master-${hex.number}`;
      const prompt = buildImagePrompt(
        hex,
        null,
        "general",
        [],
        undefined,
        consultationId,
      );

      console.info(
        `[zhouyi-64hex] ${hex.number}/64 ${hex.chineseName} → Together ${MASTER_WIDTH}×${MASTER_HEIGHT}`,
      );

      const landscape = await generateTogetherLandscape(prompt, consultationId);
      const overlaySvgDataUrl = await buildSumiHexagramOverlaySvgDataUrl({
        lines: linesFromBinaryTopFirst(hex.binaryTopFirst),
        primaryNumber: hex.number,
        primaryName: hex.name,
        primaryChinese: hex.chineseName,
        transformedNumber: null,
        transformedName: null,
        transformedChinese: null,
        outputWidth: MASTER_WIDTH,
        outputHeight: MASTER_HEIGHT,
      });

      expect(overlaySvgDataUrl).toContain("data:image/svg+xml");
      const composited = await compositeWithProductionOverlay(landscape, overlaySvgDataUrl);
      const png = await applyRasterWatermarkBuffer(composited, "master", PROMO_WATERMARK);
      await writeFile(outPath, png);

      manifestEntries.push({
        number: hex.number,
        chineseName: hex.chineseName,
        file: fileName,
      });
      console.info(`[zhouyi-64hex] wrote ${outPath}`);

      if (delayMs > 0 && i < selected.length - 1) {
        await sleep(delayMs);
      }
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      translator: "zhouyi",
      tier: "master",
      width: MASTER_WIDTH,
      height: MASTER_HEIGHT,
      togetherSteps: togetherModelConfig().steps,
      togetherNegativePrompt: togetherModelConfig().isSchnell ? "omitted (schnell)" : "sent",
      watermark: { mode: "promotional", ...PROMO_WATERMARK },
      seedSalt: seedSalt || null,
      range: { start: rangeStart, end: rangeEnd },
      outputDir: OUT_DIR,
      entries: manifestEntries,
    };
    await writeFile(join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    expect(manifestEntries.length).toBe(selected.length);
  }, 3_600_000);
});
