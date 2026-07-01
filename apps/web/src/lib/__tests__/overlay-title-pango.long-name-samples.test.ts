/**
 * QA code: TS-WEB-OVR-007 overlay-title-long-name-samples · v1.0.0
 * Area: apps/web/src/lib/overlay-title-pango
 * Family: WEB-OVR
 * Long Wilhelm mutation titles that wrap to two subtitle lines (buildOverlayEnglishTitleLayout).
 * Uses renderProductionOverlaySample → buildImageAsset + finalizeReadingImages (prod path).
 *
 *   npm run gen:overlay-long-name-samples --prefix apps/web
 *
 * Output: reports/overlay-pango-long-name-samples/
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import {
  buildOverlayEnglishTitleLayout,
  SUMI_OVERLAY_HEX_TOP_Y,
} from "../overlay-title-layout";
import type { SumiLineInput } from "../sumi-hexagram-art";
import {
  extractTitlePngFromOverlaySvg,
  renderProductionOverlaySample,
} from "./helpers/render-production-overlay-sample";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY ?? "";
const OUT_DIR = path.resolve(process.cwd(), "..", "..", "reports", "overlay-pango-long-name-samples");

const CHANGING_LINES: SumiLineInput[] = [
  { position: 1, value: 7, isChanging: false },
  { position: 2, value: 8, isChanging: false },
  { position: 3, value: 9, isChanging: true },
  { position: 4, value: 7, isChanging: false },
  { position: 5, value: 8, isChanging: false },
  { position: 6, value: 9, isChanging: true },
];

/** Curated worst-case two-line Wilhelm pairs (layout.lines.length === 2). */
const LONG_NAME_SAMPLES = [
  { id: "wilhelm-53to18", p: 53, pn: "Development (Gradual Progress)", pc: "漸", t: 18, tn: "Work on What Has Been Spoiled [Decay]", tc: "蠱" },
  { id: "wilhelm-26to18", p: 26, pn: "The Taming Power of the Great", pc: "大畜", t: 18, tn: "Work on What Has Been Spoiled [Decay]", tc: "蠱" },
  { id: "wilhelm-28to18", p: 28, pn: "Preponderance of the Great", pc: "大過", t: 18, tn: "Work on What Has Been Spoiled [Decay]", tc: "蠱" },
  { id: "wilhelm-18to53", p: 18, pn: "Work on What Has Been Spoiled [Decay]", pc: "蠱", t: 53, tn: "Development (Gradual Progress)", tc: "漸" },
  { id: "wilhelm-26to53", p: 26, pn: "The Taming Power of the Great", pc: "大畜", t: 53, tn: "Development (Gradual Progress)", tc: "漸" },
  { id: "wilhelm-45to53", p: 45, pn: "Gathering Together [Massing]", pc: "萃", t: 53, tn: "Development (Gradual Progress)", tc: "漸" },
  { id: "wilhelm-62to53", p: 62, pn: "Preponderance of the Small", pc: "小過", t: 53, tn: "Development (Gradual Progress)", tc: "漸" },
  { id: "wilhelm-9to57", p: 9, pn: "The Taming Power of the Small", pc: "小畜", t: 57, tn: "The Gentle (Penetrating, Wind)", tc: "巽" },
  { id: "wilhelm-3to18", p: 3, pn: "Difficulty at the Beginning", pc: "屯", t: 18, tn: "Work on What Has Been Spoiled [Decay]", tc: "蠱" },
  { id: "wilhelm-14to53", p: 14, pn: "Posession in Great Measure", pc: "大有", t: 53, tn: "Development (Gradual Progress)", tc: "漸" },
] as const;

describe("overlay long-name two-line samples — production pipeline", () => {
  beforeAll(async () => {
    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(
      path.join(OUT_DIR, "manifest.json"),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          note: "Wilhelm only — Legge mutation titles fit on one line at current OVERLAY_EN_MAX_WIDTH.",
          samples: LONG_NAME_SAMPLES.map((s) => {
            const layout = buildOverlayEnglishTitleLayout(
              { primaryNumber: s.p, primaryName: s.pn, transformedNumber: s.t, transformedName: s.tn },
              { hexTopY: SUMI_OVERLAY_HEX_TOP_Y },
            );
            return {
              id: s.id,
              lines: layout.lines,
              fontSize: layout.fontSize,
              ys: layout.ys,
            };
          }),
        },
        null,
        2,
      ),
    );
  });

  for (const sample of LONG_NAME_SAMPLES) {
    it(`${sample.id}: two-line EN subtitle`, async () => {
      const layout = buildOverlayEnglishTitleLayout(
        { primaryNumber: sample.p, primaryName: sample.pn, transformedNumber: sample.t, transformedName: sample.tn },
        { hexTopY: SUMI_OVERLAY_HEX_TOP_Y },
      );
      expect(layout.lines, "fixture must use two-line layout").toHaveLength(2);

      if (!TOGETHER_API_KEY) {
        console.log(`[SKIP] Sin TOGETHER_API_KEY — ${sample.id}`);
        return;
      }

      const { png, overlaySvgDataUrl } = await renderProductionOverlaySample({
        consultationId: `long-name-${sample.id}`,
        translator: "wilhelm",
        primaryNumber: sample.p,
        primaryName: sample.pn,
        primaryChinese: sample.pc,
        transformedNumber: sample.t,
        transformedName: sample.tn,
        transformedChinese: sample.tc,
        lines: CHANGING_LINES,
        changingLines: [3, 6],
      });

      await fs.writeFile(path.join(OUT_DIR, `${sample.id}.png`), png);

      expect(overlaySvgDataUrl?.startsWith("data:image/svg+xml")).toBe(true);
      const svgStr = decodeURIComponent(
        overlaySvgDataUrl!.slice("data:image/svg+xml;charset=utf-8,".length),
      );
      const titlePng = extractTitlePngFromOverlaySvg(svgStr);

      for (let i = 0; i < layout.lines.length; i++) {
        const y = layout.ys[i]!;
        const top = Math.max(0, Math.round(y - layout.fontSize * 0.85));
        const height = Math.round(layout.fontSize * 1.1);
        const { data, info } = await sharp(titlePng)
          .extract({ left: 0, top, width: 1344, height })
          .raw()
          .toBuffer({ resolveWithObject: true });
        let opaque = 0;
        for (let j = 3; j < data.length; j += info.channels) {
          if ((data[j] as number) > 10) opaque++;
        }
        expect(opaque / (1344 * height), `line ${i + 1}: ${layout.lines[i]}`).toBeGreaterThan(0.004);
      }
    }, 180_000);
  }
});
