import type { ImageProviderDebug, ResolvedImageProvider } from "@/lib/image-provider";
import { applyReadingImageWatermark, injectSvgDataUrlWatermark } from "@/lib/watermark-image";

type ImageAsset = {
  provider: ResolvedImageProvider;
  imageUrl: string;
  fallbackImageUrl: string;
  debug?: ImageProviderDebug;
};

export async function finalizeReadingImages(asset: ImageAsset, tier: string): Promise<ImageAsset> {
  const imageUrl = await applyReadingImageWatermark(asset.imageUrl, tier);
  let fallbackImageUrl = asset.fallbackImageUrl;
  if (fallbackImageUrl.startsWith("data:image/svg+xml")) {
    fallbackImageUrl = injectSvgDataUrlWatermark(fallbackImageUrl, tier);
  } else if (fallbackImageUrl !== asset.imageUrl) {
    fallbackImageUrl = await applyReadingImageWatermark(fallbackImageUrl, tier);
  } else {
    fallbackImageUrl = imageUrl;
  }
  return { provider: asset.provider, imageUrl, fallbackImageUrl, debug: asset.debug };
}
