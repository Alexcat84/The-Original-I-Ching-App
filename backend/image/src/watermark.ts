import type { TierKey } from "@iching-oracle/context-engine";
import { WATERMARK_CONFIG } from "@iching-oracle/image-engine";
import sharp from "sharp";

export async function applyTierWatermark(
  imageBuffer: Buffer,
  tier: TierKey,
): Promise<Buffer> {
  const cfg = WATERMARK_CONFIG[tier];
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width ?? 1344;
  const height = meta.height ?? 768;
  const svg = `
  <svg width="${width}" height="${height}">
    <style>
      .wm { fill: rgba(255,255,255,${cfg.opacity}); font-size: ${cfg.fontSize}px; font-family: system-ui, sans-serif; font-weight: 600; }
    </style>
    <text x="${width - 24}" y="${height - 24}" text-anchor="end" class="wm">${escapeXml(cfg.text)}</text>
  </svg>`;
  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
