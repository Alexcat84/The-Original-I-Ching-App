/**
 * Shared helper: render a consultation image through the same modules as
 * `/api/consult` + `finalizeReadingImages` (staging/production), not a duplicated test pipeline.
 */
import { getHexagramRecordByNumber } from "@iching-oracle/iching-data";
import type { Hexagram } from "@iching-oracle/iching-engine";
import { buildImagePrompt, type ConsultationCategory } from "@iching-oracle/image-engine";
import { buildImageAsset } from "../../image-provider";
import { finalizeReadingImages } from "../../finalize-reading-images";
import type { SumiLineInput } from "../../sumi-hexagram-art";

export type ProductionOverlaySampleInput = {
  consultationId: string;
  tier?: string;
  category?: ConsultationCategory;
  mutationRule?: string;
  translator?: "wilhelm" | "legge" | "zhouyi";
  primaryNumber: number;
  primaryName: string;
  primaryChinese: string;
  pinyin?: string;
  transformedNumber: number;
  transformedName: string;
  transformedChinese: string;
  lines: SumiLineInput[];
  changingLines: number[];
};

function recordToHexagram(
  number: number,
  translator: ProductionOverlaySampleInput["translator"],
): Hexagram {
  const r = getHexagramRecordByNumber(number, { translator: translator ?? "wilhelm" });
  return {
    number: r.number,
    name: r.name,
    chineseName: r.chineseName,
    pinyin: r.pinyin,
    upperTrigram: r.upperTrigram,
    lowerTrigram: r.lowerTrigram,
    judgment: r.judgment,
    image: r.image,
    lines: r.lines,
    ...(r.yongJiu !== undefined ? { yongJiu: r.yongJiu } : {}),
    ...(r.yongLiu !== undefined ? { yongLiu: r.yongLiu } : {}),
  };
}

function decodeImageUrlToBuffer(imageUrl: string): Buffer {
  if (imageUrl.startsWith("data:image/")) {
    const comma = imageUrl.indexOf(",");
    if (comma === -1) throw new Error("Invalid data URL");
    return Buffer.from(imageUrl.slice(comma + 1), "base64");
  }
  throw new Error(`Expected data:image URL from finalizeReadingImages, got: ${imageUrl.slice(0, 40)}`);
}

/** Full prod path: buildImageAsset → finalizeReadingImages (Together + overlay + watermark). */
export async function renderProductionOverlaySample(
  input: ProductionOverlaySampleInput,
): Promise<{ png: Buffer; overlaySvgDataUrl?: string }> {
  const tier = input.tier ?? "seeker";
  const category = input.category ?? "general";
  const translator = input.translator ?? "wilhelm";
  const primaryHex = recordToHexagram(input.primaryNumber, translator);
  const transformedHex = recordToHexagram(input.transformedNumber, translator);
  const prompt = buildImagePrompt(
    primaryHex,
    transformedHex,
    category,
    input.changingLines,
    undefined,
    input.consultationId,
  );

  const asset = await buildImageAsset({
    prompt,
    primaryHexagram: input.primaryNumber,
    primaryHexagramName: input.primaryName,
    primaryChinese: input.primaryChinese,
    pinyin: input.pinyin,
    transformedHexagram: {
      number: input.transformedNumber,
      name: input.transformedName,
      chineseName: input.transformedChinese,
    },
    category,
    mutationRule: input.mutationRule ?? "TWO_YIN_YANG",
    changingLines: input.changingLines,
    lines: input.lines,
    tier,
    providerOverride: "together",
    consultationId: input.consultationId,
  });

  const finalized = await finalizeReadingImages(asset, tier);
  return {
    png: decodeImageUrlToBuffer(finalized.imageUrl),
    overlaySvgDataUrl: finalized.overlaySvgDataUrl,
  };
}

export function extractTitlePngFromOverlaySvg(svgStr: string): Buffer {
  const match = svgStr.match(/href="data:image\/png;base64,([^"]+)"/);
  if (!match) throw new Error("Overlay SVG missing embedded title PNG");
  return Buffer.from(match[1]!, "base64");
}
