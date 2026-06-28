/**
 * Random mutation overlay samples (not part of default npm test).
 * Production path: buildImageAsset → finalizeReadingImages (same as /api/consult + staging).
 *
 *   OVERLAY_RANDOM_COUNT=20 npm run gen:overlay-random-samples --prefix apps/web
 *
 * Output: reports/overlay-pango-random-samples/
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import {
  applyMutations,
  buildLine,
  castSixLines,
  getHexagram,
  type LineValue,
  type Rng,
} from "@iching-oracle/iching-engine";
import type { InterpretationMode } from "@iching-oracle/iching-engine";
import type { SumiLineInput } from "../sumi-hexagram-art";
import {
  extractTitlePngFromOverlaySvg,
  renderProductionOverlaySample,
} from "./helpers/render-production-overlay-sample";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY ?? "";
const SAMPLE_COUNT = Math.max(1, Number(process.env.OVERLAY_RANDOM_COUNT ?? "20"));
const RNG_SEED = Number(process.env.OVERLAY_RANDOM_SEED ?? "20260628");

const OUT_DIR = path.resolve(process.cwd(), "..", "..", "reports", "overlay-pango-random-samples");

const TRANSLATORS: Array<"wilhelm" | "legge" | "zhouyi"> = ["wilhelm", "legge", "zhouyi"];

function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomCast(rng: Rng, translator: InterpretationMode) {
  let lines = castSixLines(rng);
  let attempts = 0;
  while (!lines.some((l) => l.isChanging) && attempts < 32) {
    lines = castSixLines(rng);
    attempts++;
  }
  if (!lines.some((l) => l.isChanging)) {
    lines = lines.map((l) =>
      l.position === 1 ? buildLine(9, 1) : buildLine(l.value as LineValue, l.position),
    );
  }

  const primary = getHexagram(lines, translator);
  const transformed = getHexagram(applyMutations(lines), translator);
  const sumiLines: SumiLineInput[] = lines.map((l) => ({
    position: l.position,
    value: l.value,
    isChanging: l.isChanging,
  }));

  return {
    lines: sumiLines,
    changingPositions: lines.filter((l) => l.isChanging).map((l) => l.position),
    primary,
    transformed,
  };
}

function buildSamples(count: number, seed: number) {
  const rng = mulberry32(seed);
  const samples: Array<{
    id: string;
    translator: "wilhelm" | "legge" | "zhouyi";
    primaryNumber: number;
    primaryName: string;
    primaryChinese: string;
    pinyin?: string;
    transformedNumber: number;
    transformedName: string;
    transformedChinese: string;
    changingPositions: number[];
    lines: SumiLineInput[];
  }> = [];

  for (let i = 0; i < count; i++) {
    const translator = TRANSLATORS[Math.floor(rng() * TRANSLATORS.length)]!;
    const cast = randomCast(rng, translator);
    const id = `${String(i + 1).padStart(2, "0")}-${translator}-${cast.primary.number}to${cast.transformed.number}`;

    samples.push({
      id,
      translator,
      primaryNumber: cast.primary.number,
      primaryName: cast.primary.name,
      primaryChinese: cast.primary.chineseName,
      pinyin: cast.primary.pinyin,
      transformedNumber: cast.transformed.number,
      transformedName: cast.transformed.name,
      transformedChinese: cast.transformed.chineseName,
      changingPositions: cast.changingPositions,
      lines: cast.lines,
    });
  }

  return samples;
}

const SAMPLES = buildSamples(SAMPLE_COUNT, RNG_SEED);

describe(`overlay random mutation samples (${SAMPLE_COUNT} casts, seed ${RNG_SEED})`, () => {
  beforeAll(async () => {
    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(
      path.join(OUT_DIR, "manifest.json"),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          pipeline: "buildImageAsset + finalizeReadingImages (production)",
          seed: RNG_SEED,
          count: SAMPLE_COUNT,
          samples: SAMPLES.map((s) => ({
            id: s.id,
            translator: s.translator,
            primary: `#${s.primaryNumber} ${s.primaryName} (${s.primaryChinese})`,
            transformed: `#${s.transformedNumber} ${s.transformedName} (${s.transformedChinese})`,
            changingLines: s.changingPositions,
          })),
        },
        null,
        2,
      ),
    );
  });

  for (const sample of SAMPLES) {
    it(
      `[${sample.translator}] #${sample.primaryNumber} ${sample.primaryName} → #${sample.transformedNumber} ${sample.transformedName} (lines ${sample.changingPositions.join(",")})`,
      async () => {
        if (!TOGETHER_API_KEY) {
          console.log(`[SKIP] Sin TOGETHER_API_KEY — ${sample.id}`);
          return;
        }

        const { png, overlaySvgDataUrl } = await renderProductionOverlaySample({
          consultationId: `random-${RNG_SEED}-${sample.id}`,
          translator: sample.translator,
          primaryNumber: sample.primaryNumber,
          primaryName: sample.primaryName,
          primaryChinese: sample.primaryChinese,
          pinyin: sample.pinyin,
          transformedNumber: sample.transformedNumber,
          transformedName: sample.transformedName,
          transformedChinese: sample.transformedChinese,
          lines: sample.lines,
          changingLines: sample.changingPositions,
        });

        await fs.writeFile(path.join(OUT_DIR, `${sample.id}.png`), png);

        expect(overlaySvgDataUrl?.startsWith("data:image/svg+xml")).toBe(true);
        const svgStr = decodeURIComponent(
          overlaySvgDataUrl!.slice("data:image/svg+xml;charset=utf-8,".length),
        );
        const titlePng = extractTitlePngFromOverlaySvg(svgStr);
        const { data, info } = await sharp(titlePng)
          .extract({ left: 0, top: 140, width: 1344, height: 95 })
          .raw()
          .toBuffer({ resolveWithObject: true });
        let opaque = 0;
        for (let i = 3; i < data.length; i += info.channels) {
          if ((data[i] as number) > 10) opaque++;
        }
        expect(opaque / (1344 * 95)).toBeGreaterThan(0.004);
      },
      180_000,
    );
  }
});
