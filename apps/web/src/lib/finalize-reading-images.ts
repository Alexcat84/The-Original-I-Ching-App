import type { ImageProviderDebug, ResolvedImageProvider } from "@/lib/image-provider";
import { embedCjkFontInOverlaySvg } from "@/lib/embed-svg-overlay-font";
import { applyReadingImageWatermark, injectSvgDataUrlWatermark } from "@/lib/watermark-image";
import sharp from "sharp";

type ImageAsset = {
  provider: ResolvedImageProvider;
  imageUrl: string;
  fallbackImageUrl: string;
  overlaySvgDataUrl?: string;
  debug?: ImageProviderDebug;
};

async function tryComposeOverlay(baseUrl: string, overlayDataUrl: string | undefined): Promise<string> {
  if (!overlayDataUrl?.startsWith("data:image/svg+xml")) return baseUrl;
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) return baseUrl;
  try {
    const baseRes = await fetch(baseUrl, { signal: AbortSignal.timeout(30_000) });
    if (!baseRes.ok) return baseUrl;
    const baseBuf = Buffer.from(await baseRes.arrayBuffer());
    const meta = await sharp(baseBuf).metadata();
    const width = meta.width ?? 1024;
    const height = meta.height ?? 1024;
    const overlaySvg = decodeURIComponent(overlayDataUrl.slice("data:image/svg+xml;charset=utf-8,".length));
    const overlaySized = overlaySvg
      .replace(/width="\d+"/, `width="${width}"`)
      .replace(/height="\d+"/, `height="${height}"`)
      .replace(/viewBox="0 0 \d+ \d+"/, `viewBox="0 0 ${width} ${height}"`);
    const overlayWithFont = await embedCjkFontInOverlaySvg(overlaySized);
    const out = await sharp(baseBuf)
      .composite([{ input: Buffer.from(overlayWithFont), top: 0, left: 0 }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return baseUrl;
  }
}

export async function finalizeReadingImages(asset: ImageAsset, tier: string): Promise<ImageAsset> {
  const composedOrOriginal = await tryComposeOverlay(asset.imageUrl, asset.overlaySvgDataUrl);
  let imageUrl = await applyReadingImageWatermark(composedOrOriginal, tier);
  let fallbackImageUrl = asset.fallbackImageUrl;
  if (fallbackImageUrl.startsWith("data:image/svg+xml")) {
    fallbackImageUrl = injectSvgDataUrlWatermark(fallbackImageUrl, tier);
  } else if (fallbackImageUrl !== asset.imageUrl) {
    fallbackImageUrl = await applyReadingImageWatermark(fallbackImageUrl, tier);
  } else {
    fallbackImageUrl = imageUrl;
  }
  if ((imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) && fallbackImageUrl.startsWith("data:image/")) {
    // Prefer a durable inlined URL over expiring third-party links.
    imageUrl = fallbackImageUrl;
  }
  return { provider: asset.provider, imageUrl, fallbackImageUrl, overlaySvgDataUrl: asset.overlaySvgDataUrl, debug: asset.debug };
}
