import type { TierKey } from "@iching-oracle/context-engine";
import { WATERMARK_CONFIG } from "@iching-oracle/image-engine";
import { embedCjkFontInOverlaySvg } from "@/lib/embed-svg-overlay-font";
import sharp from "sharp";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function tierOrFree(tier: string): TierKey {
  const k = tier as TierKey;
  return k in WATERMARK_CONFIG ? k : "free";
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

function buildWatermarkBackdropSvg(x: number, y: number, width: number, height: number, radius: number): string {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="rgba(18,14,10,0.42)"/>`;
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
  const hasSymbol = cfg.text.includes("☯");
  const watermarkText = cfg.text.replace("☯", "").trim();
  const text = watermarkText || cfg.text;
  const textX = hasSymbol ? width - 52 : width - 22;
  const baselineY = height - 24;
  const textApproxW = Math.max(74, Math.round(text.length * cfg.fontSize * 0.58));
  const boxW = textApproxW + (hasSymbol ? 42 : 20);
  const boxH = Math.max(26, Math.round(cfg.fontSize * 1.45));
  const boxX = Math.max(8, width - boxW - 10);
  const boxY = Math.max(8, baselineY - boxH + 8);
  const backdrop = buildWatermarkBackdropSvg(boxX, boxY, boxW, boxH, Math.max(8, Math.round(boxH * 0.32)));
  const insertText = `<text x="${textX}" y="${baselineY}" text-anchor="end" fill="rgba(255,255,255,${Math.min(1, cfg.opacity + 0.12)})" stroke="rgba(0,0,0,0.45)" stroke-width="0.9" paint-order="stroke fill" font-size="${cfg.fontSize}" font-family="Noto Serif SC, SimSun, STSong, serif" font-weight="700">${escapeXml(text)}</text>`;
  const insertSymbol = hasSymbol ? buildYinYangMarkSvg(width - 22, baselineY - 6, Math.max(7, cfg.fontSize * 0.52), Math.min(1, cfg.opacity + 0.12)) : "";
  const insert = `${backdrop}${insertText}${insertSymbol}`;
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
  const hasSymbol = cfg.text.includes("☯");
  const watermarkText = cfg.text.replace("☯", "").trim();
  const text = watermarkText || cfg.text;
  const textX = hasSymbol ? width - 52 : width - 22;
  const baselineY = height - 24;
  const textApproxW = Math.max(74, Math.round(text.length * cfg.fontSize * 0.58));
  const boxW = textApproxW + (hasSymbol ? 42 : 20);
  const boxH = Math.max(26, Math.round(cfg.fontSize * 1.45));
  const boxX = Math.max(8, width - boxW - 10);
  const boxY = Math.max(8, baselineY - boxH + 8);
  const backdrop = buildWatermarkBackdropSvg(boxX, boxY, boxW, boxH, Math.max(8, Math.round(boxH * 0.32)));
  const symbol = hasSymbol
    ? buildYinYangMarkSvg(width - 22, baselineY - 6, Math.max(7, cfg.fontSize * 0.52), Math.min(1, cfg.opacity + 0.12))
    : "";
  let svg = `<svg width="${width}" height="${height}"><style>.wm{fill:rgba(255,255,255,${Math.min(1, cfg.opacity + 0.12)});stroke:rgba(0,0,0,0.45);stroke-width:0.9px;paint-order:stroke fill;font-size:${cfg.fontSize}px;font-family:"Noto Serif SC",SimSun,STSong,serif;font-weight:700}</style>${backdrop}<text x="${textX}" y="${baselineY}" text-anchor="end" class="wm">${escapeXml(text)}</text>${symbol}</svg>`;
  svg = await embedCjkFontInOverlaySvg(svg);
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
