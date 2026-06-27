#!/usr/bin/env node
/**
 * Flatten adaptive icon onto solid background for App Store (no alpha channel).
 * Source: apps/mobile/assets/icon.png → ios-app-icon-1024.png
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, "..");
const source = path.join(mobileRoot, "assets", "icon.png");
const output = path.join(mobileRoot, "assets", "ios-app-icon-1024.png");
const BG = "#0c0f14";

await sharp(source)
  .resize(1024, 1024, { fit: "contain", background: BG })
  .flatten({ background: BG })
  .png({ force: true })
  .toFile(output);

const meta = await sharp(output).metadata();
if (meta.hasAlpha) {
  console.error("Output still has alpha channel — App Store requires RGB only.");
  process.exit(1);
}

console.log(`Wrote ${output} (${meta.width}x${meta.height}, no alpha)`);
