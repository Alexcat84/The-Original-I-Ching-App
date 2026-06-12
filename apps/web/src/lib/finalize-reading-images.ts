import type { ImageProviderDebug, ResolvedImageProvider } from "@/lib/image-provider";
import { toContextTierKey } from "@/lib/credits";
import { embedCjkFontInOverlaySvg } from "@/lib/embed-svg-overlay-font";
import { renderSvgToPng } from "@/lib/svg-to-png";
import { applyReadingImageWatermark, injectSvgDataUrlWatermark } from "@/lib/watermark-image";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type ImageAsset = {
  provider: ResolvedImageProvider;
  imageUrl: string;
  fallbackImageUrl: string;
  overlaySvgDataUrl?: string;
  debug?: ImageProviderDebug;
};

function targetSizeForTier(lastPack: string): { width: number; height: number } {
  const key = toContextTierKey(lastPack);
  const hi = new Set(["practitioner", "master"]);
  if (hi.has(key)) {
    return { width: 2688, height: 1536 };
  }
  return { width: 1344, height: 768 };
}

async function readLocalPublicFile(relativePath: string): Promise<Buffer | null> {
  const noSlash = relativePath.replace(/^\//, "");
  const candidates = [
    join(process.cwd(), "public", noSlash),
    join(process.cwd(), "apps", "web", "public", noSlash),
  ];
  for (const candidate of candidates) {
    try {
      return await readFile(candidate);
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function tryComposeOverlay(baseUrl: string, overlayDataUrl: string | undefined, tier: string): Promise<string> {
  if (!overlayDataUrl?.startsWith("data:image/svg+xml")) return baseUrl;
  try {
    let baseBuf: Buffer;
    if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
      const baseRes = await fetch(baseUrl, { signal: AbortSignal.timeout(30_000) });
      if (!baseRes.ok) return baseUrl;
      baseBuf = Buffer.from(await baseRes.arrayBuffer());
    } else if (baseUrl.startsWith("/")) {
      const fileBuf = await readLocalPublicFile(baseUrl);
      if (!fileBuf) return baseUrl;
      baseBuf = fileBuf;
    } else if (baseUrl.startsWith("data:image/")) {
      const comma = baseUrl.indexOf(",");
      if (comma === -1) return baseUrl;
      baseBuf = Buffer.from(baseUrl.slice(comma + 1), "base64");
    } else {
      return baseUrl;
    }
    const meta = await sharp(baseBuf).metadata();
    const width = meta.width ?? 1024;
    const height = meta.height ?? 1024;
    const overlaySvg = decodeURIComponent(overlayDataUrl.slice("data:image/svg+xml;charset=utf-8,".length));
    const overlaySized = overlaySvg
      .replace(/width="\d+"/, `width="${width}"`)
      .replace(/height="\d+"/, `height="${height}"`);
    const overlayWithFont = await embedCjkFontInOverlaySvg(overlaySized);
    // Render overlay SVG → PNG via resvg (supports @font-face / custom fonts)
    // so CJK glyphs render correctly on Vercel where librsvg has no CJK fonts.
    const overlayPng = await renderSvgToPng(overlayWithFont, width);
    let out = await sharp(baseBuf)
      .composite([{ input: overlayPng, top: 0, left: 0 }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    const { width: targetWidth, height: targetHeight } = targetSizeForTier(tier);
    const ratio = width / Math.max(1, height);
    const targetRatio = targetWidth / targetHeight;
    const closeAspect = Math.abs(ratio - targetRatio) < 0.04;
    if (closeAspect && (width < targetWidth || height < targetHeight)) {
      out = await sharp(out)
        .resize(targetWidth, targetHeight, {
          fit: "fill",
          kernel: "lanczos3",
        })
        .png({ compressionLevel: 9 })
        .toBuffer();
    }
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch (err) {
    console.warn("[tryComposeOverlay] failed, returning original URL", { baseUrl, error: String(err) });
    return baseUrl;
  }
}

export async function finalizeReadingImages(asset: ImageAsset, tier: string): Promise<ImageAsset> {
  let composed = await tryComposeOverlay(asset.imageUrl, asset.overlaySvgDataUrl, tier);

  // If compositing silently failed (URL unchanged + was a remote or data URL), retry on local fallback.
  const remoteComposeFailed =
    composed === asset.imageUrl &&
    (asset.imageUrl.startsWith("http://") ||
      asset.imageUrl.startsWith("https://") ||
      asset.imageUrl.startsWith("data:image/")) &&
    !!asset.fallbackImageUrl &&
    asset.fallbackImageUrl !== asset.imageUrl;
  if (remoteComposeFailed) {
    const fallbackComposed = await tryComposeOverlay(asset.fallbackImageUrl, asset.overlaySvgDataUrl, tier);
    if (fallbackComposed !== asset.fallbackImageUrl) {
      composed = fallbackComposed;
    }
  }

  let imageUrl = await applyReadingImageWatermark(composed, tier);
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
