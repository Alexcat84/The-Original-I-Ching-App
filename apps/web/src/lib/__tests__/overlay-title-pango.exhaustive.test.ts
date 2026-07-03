/**
 * QA code: TS-WEB-OVR-005 overlay-title-pango-exhaustive · v1.1.0
 * Area: apps/web/src/lib/overlay-title-pango
 * Family: WEB-OVR
 */

import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { getAllHexagramRecords } from "@iching-oracle/iching-data";
import { buildSumiHexagramOverlaySvgDataUrl, type SumiLineInput } from "../sumi-hexagram-art";

const FIXTURE_LINES: SumiLineInput[] = [
  { position: 1, value: 7, isChanging: false },
  { position: 2, value: 7, isChanging: false },
  { position: 3, value: 7, isChanging: false },
  { position: 4, value: 7, isChanging: false },
  { position: 5, value: 7, isChanging: false },
  { position: 6, value: 7, isChanging: false },
];

async function inkRatio(
  png: Buffer,
  region: { left: number; top: number; width: number; height: number },
): Promise<number> {
  const { data, info } = await sharp(png).extract(region).raw().toBuffer({ resolveWithObject: true });
  let opaque = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i]! > 10) opaque++;
  }
  return opaque / (region.width * region.height);
}

const ZH_TITLE_REGION = { left: 0, top: 10, width: 1344, height: 170 };
const EN_TITLE_REGION = { left: 0, top: 140, width: 1344, height: 95 };
const MIN_INK_RATIO = 0.004;

async function renderAndCheck(
  params: {
    primaryNumber: number;
    primaryName: string;
    primaryChinese: string;
    transformedNumber: number;
    transformedName: string;
    transformedChinese: string;
  },
): Promise<void> {
  const dataUrl = await buildSumiHexagramOverlaySvgDataUrl({ lines: FIXTURE_LINES, ...params });
  const svg = decodeURIComponent(dataUrl.slice("data:image/svg+xml;charset=utf-8,".length));
  const match = svg.match(/href="data:image\/png;base64,([^"]+)"/);
  if (!match) {
    throw new Error(
      `#${params.primaryNumber} ${params.primaryName} -> #${params.transformedNumber} ${params.transformedName}: no embedded title image`,
    );
  }
  const png = Buffer.from(match[1]!, "base64");
  const label = `#${params.primaryNumber} ${params.primaryName} -> #${params.transformedNumber} ${params.transformedName}`;
  const zh = await inkRatio(png, ZH_TITLE_REGION);
  const en = await inkRatio(png, EN_TITLE_REGION);
  expect(zh, `${label} ZH`).toBeGreaterThan(MIN_INK_RATIO);
  expect(en, `${label} EN`).toBeGreaterThan(MIN_INK_RATIO);
}

describe.each(["wilhelm", "legge", "zhouyi"] as const)("overlay title — full pair grid (%s)", (translator) => {
  const hexagrams = getAllHexagramRecords({ translator });

  it(`renders all ${hexagrams.length * (hexagrams.length - 1)} primary/transformed pairs without a dropped or tofu'd title`, async () => {
    for (const primary of hexagrams) {
      for (const transformed of hexagrams) {
        if (primary.number === transformed.number) continue;
        await renderAndCheck({
          primaryNumber: primary.number,
          primaryName: primary.name,
          primaryChinese: primary.chineseName,
          transformedNumber: transformed.number,
          transformedName: transformed.name,
          transformedChinese: transformed.chineseName,
        });
      }
    }
  }, 600_000);
});
