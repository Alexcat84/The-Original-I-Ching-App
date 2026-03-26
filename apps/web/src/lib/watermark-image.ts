import type { TierKey } from "@iching-oracle/context-engine";
import { WATERMARK_CONFIG } from "@iching-oracle/image-engine";
import sharp from "sharp";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function tierOrFree(tier: string): TierKey {
  const k = tier as TierKey;
  return k in WATERMARK_CONFIG ? k : "free";
}

/**
 * Burn-in watermark for SVG data URLs (sumi-e fallback, no Sharp decode of raster).
 */
export function injectSvgDataUrlWatermark(dataUrl: string, tier: string): string {
  const prefix = "data:image/svg+xml;charset=utf-8,";
  if (!dataUrl.startsWith(prefix)) return dataUrl;
  const key = tierOrFree(tier);
  const cfg = WATERMARK_CONFIG[key];
  let svg: string;
  try {
    svg = decodeURIComponent(dataUrl.slice(prefix.length));
  } catch {
    return dataUrl;
  }
  const wMatch = svg.match(/viewBox="0\s+0\s+(\d+)\s+(\d+)"/);
  const width = wMatch ? Number(wMatch[1]) : 1344;
  const height = wMatch ? Number(wMatch[2]) : 768;
  const insert = `<text x="${width - 24}" y="${height - 24}" text-anchor="end" fill="rgba(255,255,255,${cfg.opacity})" font-size="${cfg.fontSize}" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="600">${escapeXml(cfg.text)}</text>`;
  const idx = svg.lastIndexOf("</svg>");
  if (idx === -1) return dataUrl;
  const newSvg = `${svg.slice(0, idx)}${insert}${svg.slice(idx)}`;
  return prefix + encodeURIComponent(newSvg);
}

async function watermarkRasterBuffer(buf: Buffer, tier: string): Promise<string> {
  const key = tierOrFree(tier);
  const cfg = WATERMARK_CONFIG[key];
  const meta = await sharp(buf).metadata();
  const width = meta.width ?? 1344;
  const height = meta.height ?? 768;
  const svg = `<svg width="${width}" height="${height}"><style>.wm{fill:rgba(255,255,255,${cfg.opacity});font-size:${cfg.fontSize}px;font-family:DejaVu Sans, Liberation Sans, Arial, sans-serif;font-weight:600}</style><text x="${width - 24}" y="${height - 24}" text-anchor="end" class="wm">${escapeXml(cfg.text)}</text></svg>`;
  const out = await sharp(buf)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  return `data:image/png;base64,${out.toString("base64")}`;
}

async function watermarkRemoteUrl(imageUrl: string, tier: string): Promise<string> {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`image fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return watermarkRasterBuffer(buf, tier);
}

/**
 * Applies tier watermark to consultation image URLs (SVG data URL, raster data URL, or http(s)).
 * On failure, returns the original URL.
 */
export async function applyReadingImageWatermark(imageUrl: string, tier: string): Promise<string> {
  try {
    if (imageUrl.startsWith("data:image/svg+xml")) {
      return injectSvgDataUrlWatermark(imageUrl, tier);
    }
    if (imageUrl.startsWith("data:image/png;base64,") || imageUrl.startsWith("data:image/jpeg;base64,")) {
      const comma = imageUrl.indexOf(",");
      if (comma === -1) return imageUrl;
      const b64 = imageUrl.slice(comma + 1);
      const buf = Buffer.from(b64, "base64");
      return await watermarkRasterBuffer(buf, tier);
    }
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return await watermarkRemoteUrl(imageUrl, tier);
    }
  } catch {
    return imageUrl;
  }
  return imageUrl;
}
