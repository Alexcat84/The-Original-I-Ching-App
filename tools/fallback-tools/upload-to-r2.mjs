#!/usr/bin/env node
/**
 * Upload fallback images to Cloudflare R2
 *
 * Reads output/iching/ and output/bones/, uploads each .webp file to R2
 * using the relative path as the key (e.g. "iching/1/1/1024x768.webp").
 * Fully resumable: skips keys that already exist in R2 (HEAD check).
 *
 * Required env vars (add to .env):
 *   R2_ACCOUNT_ID         — Cloudflare account ID (number string)
 *   R2_BUCKET             — R2 bucket name
 *   R2_ACCESS_KEY_ID      — R2 API token Access Key ID
 *   R2_SECRET_ACCESS_KEY  — R2 API token Secret Access Key
 *
 * Usage:
 *   node --env-file="../../.env" upload-to-r2.mjs              ← upload all
 *   node --env-file="../../.env" upload-to-r2.mjs --dry-run    ← list keys only
 *   node --env-file="../../.env" upload-to-r2.mjs --force      ← overwrite existing
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pLimit from "p-limit";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");
const DRY_RUN    = process.argv.includes("--dry-run");
const FORCE      = process.argv.includes("--force");
const CONCURRENCY = 10;

// ─── Validate env ─────────────────────────────────────────────────────────────

const REQUIRED = ["R2_ACCOUNT_ID", "R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
const missing  = REQUIRED.filter((k) => !process.env[k]?.trim());
if (missing.length) {
  console.error("❌ Missing env vars:", missing.join(", "));
  console.error("   Add them to your .env file and rerun.");
  process.exit(1);
}

const R2_ACCOUNT_ID       = process.env.R2_ACCOUNT_ID.trim();
const R2_BUCKET           = process.env.R2_BUCKET.trim();
const R2_ACCESS_KEY_ID    = process.env.R2_ACCESS_KEY_ID.trim();
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY.trim();

// ─── S3 client (R2 is S3-compatible) ─────────────────────────────────────────

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function walkWebp(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...await walkWebp(full));
    } else if (e.name.endsWith(".webp")) {
      files.push(full);
    }
  }
  return files;
}

async function existsInR2(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🚀 R2 bucket : ${R2_BUCKET}`);
  console.log(`   Endpoint  : https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
  console.log(`   Mode      : ${DRY_RUN ? "DRY RUN (no upload)" : FORCE ? "FORCE (overwrite)" : "RESUMABLE (skip existing)"}\n`);

  // Collect from iching/ and bones/ only — skip TEST/, VARIETY/
  let allFiles = [];
  for (const subdir of ["iching", "bones"]) {
    const dir = path.join(OUTPUT_DIR, subdir);
    try {
      allFiles.push(...await walkWebp(dir));
    } catch {
      console.warn(`⚠️  output/${subdir}/ not found — skipping`);
    }
  }

  if (allFiles.length === 0) {
    console.error("❌ No images found in output/iching/ or output/bones/");
    console.error("   Run generate-fallbacks.mjs first.");
    process.exit(1);
  }

  const items = allFiles.map((f) => ({
    file: f,
    key:  path.relative(OUTPUT_DIR, f).replace(/\\/g, "/"),
  }));

  console.log(`📦 ${items.length} imágenes encontradas\n`);

  if (DRY_RUN) {
    const preview = items.slice(0, 15);
    preview.forEach((i) => console.log("  ", i.key));
    if (items.length > 15) console.log(`  ... y ${items.length - 15} más`);
    return;
  }

  const limit = pLimit(CONCURRENCY);
  let uploaded = 0, skipped = 0, failed = 0;
  const startTime = Date.now();

  const tasks = items.map((item) =>
    limit(async () => {
      if (!FORCE) {
        const exists = await existsInR2(item.key);
        if (exists) { skipped++; return; }
      }

      const body = await readFile(item.file);
      await client.send(new PutObjectCommand({
        Bucket:       R2_BUCKET,
        Key:          item.key,
        Body:         body,
        ContentType:  "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }));
      uploaded++;

      const done = uploaded + skipped + failed;
      if (done % 100 === 0 || done === items.length) {
        const pct = ((done / items.length) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
        console.log(`[${done}/${items.length}] ${pct}% — ↑${uploaded} skip${skipped} ✗${failed} — ${elapsed}min`);
      }
    }).catch((err) => {
      failed++;
      console.error(`  ❌ ${item.key}: ${err.message}`);
    })
  );

  await Promise.all(tasks);

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n✅ Upload completo en ${elapsed} min`);
  console.log(`   Subidas       : ${uploaded}`);
  console.log(`   Ya existían   : ${skipped}`);
  console.log(`   Errores       : ${failed}`);

  if (uploaded > 0) {
    console.log(`\n📡 Las imágenes son accesibles en:`);
    console.log(`   https://${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/iching/1/1/1024x768.webp`);
    console.log(`   (o via tu dominio/worker público si tienes uno configurado)`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exitCode = 1;
});
