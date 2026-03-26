import type { TierKey } from "@iching-oracle/context-engine";
import { WATERMARK_CONFIG } from "@iching-oracle/image-engine";
import { renderSvgToPng } from "@/lib/svg-to-png";
import sharp from "sharp";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function tierOrFree(tier: string): TierKey {
  const k = tier as TierKey;
  return k in WATERMARK_CONFIG ? k : "free";
}

function watermarkVisibility(tier: string): { fontSize: number; opacity: number; text: string } {
  const cfg = WATERMARK_CONFIG[tierOrFree(tier)];
  return {
    // Keep watermark legible on compressed/generated images in all tiers.
    fontSize: Math.max(cfg.fontSize, 13),
    opacity: Math.max(cfg.opacity, 0.58),
    text: cfg.text,
  };
}

function buildYinYangMarkSvg(x: number, y: number, radius: number, opacity: number): string {
  const r = Math.max(5, radius);
  const half = r / 2;
  const dot = Math.max(1.5, r / 6);
  return `
<g opacity="${opacity}">
  <circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,0.92)"/>
  <path d="M ${x} ${y - r} A ${half} ${half} 0 1 1 ${x} ${y} A ${half} ${half} 0 1 0 ${x} ${y + r} A ${r} ${r} 0 1 1 ${x} ${y - r} Z" fill="rgba(20,20,20,0.92)"/>
  <circle cx="${x}" cy="${y - half}" r="${dot}" fill="rgba(255,255,255,0.95)"/>
  <circle cx="${x}" cy="${y + half}" r="${dot}" fill="rgba(20,20,20,0.95)"/>
</g>`.trim();
}

/**
 * Burn-in watermark for SVG data URLs (sumi-e fallback, no Sharp decode of raster).
 */
export function injectSvgDataUrlWatermark(dataUrl: string, tier: string): string {
  const prefix = "data:image/svg+xml;charset=utf-8,";
  if (!dataUrl.startsWith(prefix)) return dataUrl;
  const wm = watermarkVisibility(tier);
  let svg: string;
  try {
    svg = decodeURIComponent(dataUrl.slice(prefix.length));
  } catch {
    return dataUrl;
  }
  const wMatch = svg.match(/viewBox="0\s+0\s+(\d+)\s+(\d+)"/);
  const width = wMatch ? Number(wMatch[1]) : 1344;
  const height = wMatch ? Number(wMatch[2]) : 768;
  const hasSymbol = wm.text.includes("☯");
  const watermarkText = wm.text.replace("☯", "").trim();
  const textX = hasSymbol ? width - 56 : width - 24;
  const insertText = `<text x="${textX}" y="${height - 24}" text-anchor="end" fill="rgba(255,255,255,${wm.opacity})" font-size="${wm.fontSize}" font-family="system-ui,sans-serif" font-weight="600">${escapeXml(watermarkText || wm.text)}</text>`;
  const insertSymbol = hasSymbol
    ? buildYinYangMarkSvg(width - 24, height - 30, Math.max(7, wm.fontSize * 0.5), wm.opacity)
    : "";
  const insert = `${insertText}${insertSymbol}`;
  const idx = svg.lastIndexOf("</svg>");
  if (idx === -1) return dataUrl;
  const newSvg = `${svg.slice(0, idx)}${insert}${svg.slice(idx)}`;
  return prefix + encodeURIComponent(newSvg);
}

async function watermarkRasterBuffer(buf: Buffer, tier: string): Promise<string> {
  const wm = watermarkVisibility(tier);
  const meta = await sharp(buf).metadata();
  const width = meta.width ?? 1344;
  const height = meta.height ?? 768;
  const hasSymbol = wm.text.includes("☯");
  const watermarkText = wm.text.replace("☯", "").trim();
  const textX = hasSymbol ? width - 56 : width - 24;
  const symbol = hasSymbol
    ? buildYinYangMarkSvg(width - 24, height - 30, Math.max(7, wm.fontSize * 0.5), wm.opacity)
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>.wm{fill:rgba(255,255,255,${wm.opacity});font-size:${wm.fontSize}px;font-family:system-ui,sans-serif;font-weight:600}</style><text x="${textX}" y="${height - 24}" text-anchor="end" class="wm">${escapeXml(watermarkText || wm.text)}</text>${symbol}</svg>`;
  // Render watermark SVG → PNG via resvg so text renders on Vercel (librsvg misses fonts).
  const wmPng = await renderSvgToPng(svg, width);
  const out = await sharp(buf)
    .composite([{ input: wmPng, top: 0, left: 0 }])
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
