#!/usr/bin/env node
/**
 * QA code: VF-IMG-001 r2-fallback-coverage · v1.0.0
 * Area: scripts/verify-r2-fallback-coverage
 * Family: IMG
 *
 * Verifies the Cloudflare R2 contingency pool is COMPLETE: the precomputed
 * landscape images the app falls back to when the live image provider fails.
 *
 * Why this matters: when Together AI (or whatever provider is configured)
 * cannot generate, `pickR2FallbackImageUrl` in apps/web/src/lib/image-provider.ts
 * builds an R2 URL and hands it to the client WITHOUT checking that the object
 * exists. A hole in the pool becomes a broken image for a paying user, and it
 * only shows up exactly when the provider is already failing. This script
 * checks every address that function can produce.
 *
 * Address space mirrored from pickR2FallbackImageUrl:
 *   iching: {base}/iching/{1..64}/{1..10}/{w}x{h}.webp
 *   bones:  {base}/bones/{ji_clear|ji_moderate|xiong_moderate|xiong_clear}/{1..10}/{w}x{h}.webp
 * with the four tier sizes from resolveTogetherImageSize.
 *
 * Usage:
 *   node --env-file=apps/web/.env scripts/verify-r2-fallback-coverage.mjs
 *   node --env-file=apps/web/.env scripts/verify-r2-fallback-coverage.mjs --quick
 *
 * --quick samples one variant per hexagram instead of all ten (256 vs 2560
 * requests) for a fast smoke; the full run is the real gate.
 *
 * Requires: R2_PUBLIC_URL (the PUBLIC bucket URL, e.g. pub-xxxx.r2.dev, NOT the
 * S3 API endpoint at <account>.r2.cloudflarestorage.com, which needs SigV4 and
 * answers 400 to plain GETs).
 *
 * Exits 0 only when every expected object answers 200.
 */

const BASE = (process.env.R2_PUBLIC_URL ?? "").trim().replace(/\/$/, "");
const QUICK = process.argv.includes("--quick");
// The public r2.dev endpoint rate-limits aggressively; 6 parallel requests with
// backoff on 429 completes the full sweep without false "missing" reports.
const CONCURRENCY = Number(process.env.R2_CHECK_CONCURRENCY ?? 6);
const MAX_RETRIES = Number(process.env.R2_CHECK_RETRIES ?? 5);

// Tier sizes: keep in sync with resolveTogetherImageSize in image-provider.ts.
const SIZES = ["1024x768", "1024x1024", "1184x1184", "1504x1504"];
// Same source of truth as R2_VARIANTS_PER_KEY in image-provider.ts: this gate
// must check exactly the address space the picker can produce, so growing the
// pool means bumping the env var and re-running this.
const VARIANTS_PER_KEY = (() => {
  const raw = Number(process.env.R2_VARIANTS_PER_KEY);
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 10;
})();
const VARIANTS = QUICK ? [1] : Array.from({ length: VARIANTS_PER_KEY }, (_, i) => i + 1);
const HEXAGRAMS = Array.from({ length: 64 }, (_, i) => i + 1);
// Bucket folder names (the engine's verdict names are mapped in image-provider.ts).
const BONES_FOLDERS = ["ji_clear", "ji_moderate", "xiong_moderate", "xiong_clear"];

if (!BASE) {
  console.error("verify:r2-fallback-coverage FAILED\n  - R2_PUBLIC_URL is not set.");
  console.error("    Run with: node --env-file=apps/web/.env scripts/verify-r2-fallback-coverage.mjs");
  process.exit(1);
}
if (BASE.includes("r2.cloudflarestorage.com")) {
  console.error("verify:r2-fallback-coverage FAILED");
  console.error(`  - R2_PUBLIC_URL points at the S3 API endpoint (${BASE}).`);
  console.error("    That endpoint requires SigV4 and returns 400 to plain GETs.");
  console.error("    Use the public bucket URL (pub-*.r2.dev or your custom domain).");
  process.exit(1);
}

/** Every URL pickR2FallbackImageUrl can produce, for the sampled variants. */
function buildTargets() {
  const out = [];
  for (const hex of HEXAGRAMS) {
    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        out.push({ kind: "iching", label: `iching/${hex}/${variant}/${size}`, url: `${BASE}/iching/${hex}/${variant}/${size}.webp` });
      }
    }
  }
  for (const folder of BONES_FOLDERS) {
    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        out.push({ kind: "bones", label: `bones/${folder}/${variant}/${size}`, url: `${BASE}/bones/${folder}/${variant}/${size}.webp` });
      }
    }
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Existence probe. A 429 means the public endpoint throttled us, NOT that the
 * object is missing: retry with backoff so throttling never masquerades as a
 * hole in the pool (the whole point of this gate).
 */
async function probe(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // R2 answers HEAD, but some edge configs only cache GET; Range keeps it cheap.
      const res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
      if (res.status !== 429) return res.status;
      if (attempt === MAX_RETRIES) return 429;
      const retryAfter = Number(res.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 500 * 2 ** attempt + Math.floor(Math.random() * 250);
      await sleep(waitMs);
    } catch (err) {
      if (attempt === MAX_RETRIES) return `ERR ${String(err).slice(0, 60)}`;
      await sleep(500 * 2 ** attempt);
    }
  }
  return "ERR retries_exhausted";
}

async function run() {
  const targets = buildTargets();
  console.log(`Checking ${targets.length} R2 objects${QUICK ? " (quick: 1 variant per key)" : ""}`);
  console.log(`Base: ${BASE}\n`);

  const missing = [];
  const throttled = [];
  let done = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < targets.length) {
      const target = targets[cursor++];
      const status = await probe(target.url);
      // 206 = partial content, expected for the Range request; 200 if ignored.
      if (status === 200 || status === 206) {
        // present
      } else if (status === 429) {
        // Still throttled after all retries: inconclusive, not proof of absence.
        throttled.push({ ...target, status });
      } else {
        missing.push({ ...target, status });
      }
      done++;
      if (done % 200 === 0) process.stdout.write(`  ...${done}/${targets.length}\n`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker));

  const ok = targets.length - missing.length - throttled.length;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${ok}/${targets.length} present, ${missing.length} missing, ${throttled.length} inconclusive (throttled)`);
  console.log("=".repeat(60));

  if (missing.length) {
    console.error("\nverify:r2-fallback-coverage FAILED. Missing objects:");
    for (const m of missing.slice(0, 40)) console.error(`  - ${m.label} (${m.status})`);
    if (missing.length > 40) console.error(`  ... and ${missing.length - 40} more`);
    console.error("\nRegenerate/upload the gaps before relying on the fallback pool.");
    return 1;
  }
  if (throttled.length) {
    console.error(`\nverify:r2-fallback-coverage INCONCLUSIVE: ${throttled.length} objects still rate-limited.`);
    console.error("  Re-run with lower concurrency, e.g. R2_CHECK_CONCURRENCY=3");
    return 2;
  }
  console.log("\nverify:r2-fallback-coverage OK: the contingency pool is complete.");
  return 0;
}

process.exit(await run());
