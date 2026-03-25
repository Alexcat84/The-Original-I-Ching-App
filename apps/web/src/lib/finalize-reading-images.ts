import type { ImageProviderDebug, ResolvedImageProvider } from "@/lib/image-provider";
import { applyReadingImageWatermark, injectSvgDataUrlWatermark } from "@/lib/watermark-image";
import sharp from "sharp";

type ImageAsset = {
  provider: ResolvedImageProvider;
  imageUrl: string;
  fallbackImageUrl: string;
  debug?: ImageProviderDebug;
  overlaySvgDataUrl?: string;
};

export async function finalizeReadingImages(asset: ImageAsset, tier: string): Promise<ImageAsset> {
  let imageUrl = asset.imageUrl;

  // If we have a deterministic overlay (hexagram bars + titles), composite it over the remote background.
  if (asset.overlaySvgDataUrl && !imageUrl.startsWith("data:image/svg+xml")) {
    try {
      const overlayPrefix = "data:image/svg+xml;charset=utf-8,";
      const overlaySvg =
        asset.overlaySvgDataUrl.startsWith(overlayPrefix)
          ? decodeURIComponent(asset.overlaySvgDataUrl.slice(overlayPrefix.length))
          : "";

      if (overlaySvg) {
        const overlayBuf = Buffer.from(overlaySvg, "utf8");

        let baseBuf: Buffer | null = null;
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          const res = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) });
          if (res.ok) baseBuf = Buffer.from(await res.arrayBuffer());
        } else if (imageUrl.startsWith("data:image/png;base64,") || imageUrl.startsWith("data:image/jpeg;base64,")) {
          const comma = imageUrl.indexOf(",");
          if (comma !== -1) {
            const b64 = imageUrl.slice(comma + 1);
            baseBuf = Buffer.from(b64, "base64");
          }
        }

        if (baseBuf) {
          const out = await sharp(baseBuf)
            .composite([{ input: overlayBuf, top: 0, left: 0 }])
            .png({ compressionLevel: 9 })
            .toBuffer();
          imageUrl = `data:image/png;base64,${out.toString("base64")}`;
        }
      }
    } catch {
      // If overlay composition fails, we still return the original imageUrl (and apply watermark).
      imageUrl = asset.imageUrl;
    }
  }

  imageUrl = await applyReadingImageWatermark(imageUrl, tier);
  let fallbackImageUrl = asset.fallbackImageUrl;
  if (fallbackImageUrl.startsWith("data:image/svg+xml")) {
    fallbackImageUrl = injectSvgDataUrlWatermark(fallbackImageUrl, tier);
  } else if (fallbackImageUrl !== asset.imageUrl) {
    fallbackImageUrl = await applyReadingImageWatermark(fallbackImageUrl, tier);
  } else {
    fallbackImageUrl = imageUrl;
  }
  return { provider: asset.provider, imageUrl, fallbackImageUrl, debug: asset.debug, overlaySvgDataUrl: asset.overlaySvgDataUrl };
}
