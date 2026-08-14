#!/usr/bin/env node
/**
 * Red-seal / chop contamination detector for generated landscapes.
 *
 * Why this exists: the first screen in compare-together-image-models.mjs counted
 * vivid-red pixels as a SHARE OF THE WHOLE IMAGE. That is the wrong shape for
 * this defect. A carved red seal occupies well under 1% of the frame, so it
 * scores as "clean" while a golden autumn sunset scores as "dirty". It missed a
 * real seal (with Chinese characters) in a sample that it rated 0.215%.
 *
 * A seal is instead a SMALL, COMPACT, STRONGLY SATURATED RED BLOB, usually in a
 * margin or corner, sitting on a landscape that has no other vivid red at that
 * saturation. So: threshold for vivid red, label connected components, and judge
 * each blob by area, squareness and fill, not by global percentage.
 *
 * Usage:
 *   node tools/fallback-tools/detect-seal-contamination.mjs <dir> [<dir>...]
 *   node tools/fallback-tools/detect-seal-contamination.mjs tools/output/model-decision
 *
 * Prints one line per suspicious image and a per-directory rate. Exits 0 always:
 * this is a report, not a gate (the final call is still visual).
 */
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const GRID = 384; // analysis resolution: keeps small seals several px wide

/** Vivid, carved-cinnabar red. Deliberately stricter than warm sunset tones. */
function isSealRed(r, g, b) {
  return r > 100 && r - g > 55 && r - b > 45 && g < 130 && b < 130;
}

function walkImages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkImages(p));
    else if (/\.(png|jpe?g|webp)$/i.test(name)) out.push(p);
  }
  return out;
}

async function analyzeSeals(file) {
  const { data, info } = await sharp(file)
    .resize(GRID, GRID, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;

  const mask = new Uint8Array(W * H);
  for (let i = 0, p = 0; i < data.length; i += ch, p++) {
    if (isSealRed(data[i], data[i + 1], data[i + 2])) mask[p] = 1;
  }

  // Connected components (4-neighbour flood fill over the mask).
  const seen = new Uint8Array(W * H);
  const blobs = [];
  const stack = [];
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p] || seen[p]) continue;
    stack.length = 0;
    stack.push(p);
    seen[p] = 1;
    let area = 0, minX = W, maxX = 0, minY = H, maxY = 0;
    while (stack.length) {
      const q = stack.pop();
      const x = q % W, y = (q / W) | 0;
      area++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      const neigh = [q - 1, q + 1, q - W, q + W];
      for (let k = 0; k < 4; k++) {
        const n = neigh[k];
        if (n < 0 || n >= mask.length || seen[n] || !mask[n]) continue;
        // Guard the horizontal wrap of the 1-D index.
        if (k === 0 && x === 0) continue;
        if (k === 1 && x === W - 1) continue;
        seen[n] = 1;
        stack.push(n);
      }
    }
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const boxArea = bw * bh;
    const fill = area / boxArea;              // how solid the blob is
    const aspect = Math.max(bw, bh) / Math.min(bw, bh);
    const areaPct = (area / (W * H)) * 100;
    // Distance of the blob centre from the frame centre, normalised: seals sit
    // out at the margins, foliage is spread everywhere.
    const cx = (minX + maxX) / 2 / W - 0.5;
    const cy = (minY + maxY) / 2 / H - 0.5;
    const edginess = Math.max(Math.abs(cx), Math.abs(cy)) * 2; // 0 centre .. 1 edge
    blobs.push({ areaPct, fill, aspect, edginess, bw, bh });
  }

  // A seal is a SOLID, roughly SQUARE stamp out near the frame edge. The loose
  // first pass flagged autumn foliage constantly (warm blobs are everywhere in
  // this art direction), so the thresholds are calibrated against a visually
  // confirmed seal: fill 0.81, aspect 1.00, edginess 0.92, ~0.2% of frame.
  // Foliage fails FILL: leaves are ragged, a carved stamp is a filled rectangle.
  const MIN_FILL = Number(process.env.SEAL_MIN_FILL ?? 0.65);
  const MAX_ASPECT = Number(process.env.SEAL_MAX_ASPECT ?? 1.6);
  const MIN_EDGE = Number(process.env.SEAL_MIN_EDGE ?? 0.6);
  const suspects = blobs.filter(
    (b) => b.areaPct >= 0.02 && b.areaPct <= 3 && b.fill >= MIN_FILL && b.aspect <= MAX_ASPECT && b.edginess >= MIN_EDGE,
  );
  suspects.sort((a, b) => b.areaPct - a.areaPct);
  return { suspects, totalRed: blobs.reduce((s, b) => s + b.areaPct, 0) };
}

const dirs = process.argv.slice(2);
if (!dirs.length) {
  console.error("uso: node tools/fallback-tools/detect-seal-contamination.mjs <dir> [...]");
  process.exit(1);
}

for (const dir of dirs) {
  const files = walkImages(dir);
  const byModel = new Map();
  for (const f of files) {
    const model = path.basename(path.dirname(f));
    if (!byModel.has(model)) byModel.set(model, { total: 0, hits: [] });
    const entry = byModel.get(model);
    entry.total++;
    const { suspects } = await analyzeSeals(f);
    if (suspects.length) entry.hits.push({ file: f, top: suspects[0], n: suspects.length });
  }
  console.log(`\n=== ${dir} ===`);
  for (const [model, { total, hits }] of byModel) {
    console.log(`  ${model}: ${hits.length}/${total} imagenes con posible sello`);
    for (const h of hits) {
      const t = h.top;
      console.log(
        `     - ${path.basename(h.file)}  blob ${t.areaPct.toFixed(3)}% ` +
        `fill=${t.fill.toFixed(2)} aspect=${t.aspect.toFixed(2)} borde=${t.edginess.toFixed(2)} (${t.bw}x${t.bh}px)`,
      );
    }
  }
}
