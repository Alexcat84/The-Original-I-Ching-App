#!/usr/bin/env node
/**
 * Runware operability probe: decides whether Runware is fit to become the
 * SECOND image fallback (after fal.ai), before a single line of it is wired
 * into the app.
 *
 * The decision is not "is it cheap" (it is: FLUX.1-schnell is advertised around
 * $0.0006/image, the lowest of the providers surveyed). The decision is whether
 * it can do what THIS product needs, which the price page cannot tell us:
 *
 *   1. Auth and reachability at all.
 *   2. Our four tier sizes, including the two that are not multiples of 64
 *      (practitioner 1184, master 1504) which Together's stack rejects outright.
 *   3. The real production prompt (~1950 chars): long prompts are where Qwen
 *      fell over.
 *   4. Latency inside the app's 65s abort budget.
 *   5. Whether the returned image is actually the size requested (pixelaje).
 *   6. Seal/glyph contamination, the defect this product has fought for months.
 *
 * Usage:
 *   RUNWARE_API_KEY=... node tools/fallback-tools/probe-runware.mjs
 *   node --env-file=.env tools/fallback-tools/probe-runware.mjs
 *
 * Writes rasters to tools/output/runware-probe/ for visual review and prints a
 * verdict table. Makes real API calls (a few cents at most).
 *
 * Runware speaks a task-array JSON protocol over POST https://api.runware.ai/v1
 * rather than one-endpoint-per-model, so this probe is also the reference for
 * how a provider adapter would have to be written.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(repoRoot, "tools", "output", "runware-probe");

const KEY = process.env.RUNWARE_API_KEY?.trim();
const MODEL = process.env.RUNWARE_MODEL?.trim() || "runware:100@1"; // FLUX.1 schnell in Runware's AIR id scheme
const ENDPOINT = "https://api.runware.ai/v1";
const TIMEOUT_MS = 65_000; // same abort budget the app gives its image provider

if (!KEY) {
  console.error("RUNWARE_API_KEY no esta definida.");
  console.error("Crea la cuenta, copia la clave y vuelve a correr:");
  console.error("  node --env-file=.env tools/fallback-tools/probe-runware.mjs");
  process.exit(2);
}

const TIERS = [
  { tier: "free", width: 1024, height: 768 },
  { tier: "seeker", width: 1024, height: 1024 },
  { tier: "practitioner", width: 1184, height: 1184 }, // not a multiple of 64
  { tier: "master", width: 1504, height: 1504 },       // not a multiple of 64
];

function uuid() {
  return crypto.randomUUID();
}

async function loadProductionPrompt() {
  const dist = path.join(repoRoot, "packages", "image-engine", "dist", "index.js");
  try {
    const { buildImagePrompt } = await import(pathToFileURL(dist).href);
    return buildImagePrompt({ number: 31 }, null, "general", [], undefined, "runware-probe");
  } catch {
    console.warn("[aviso] image-engine sin construir; uso un prompt corto de reserva.");
    console.warn("        npm run build -w @iching-oracle/image-engine");
    return "Serene East Asian mountain landscape, mist over a lake, ink-wash mood, no text, no seals";
  }
}

async function generate({ prompt, width, height }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify([
        {
          taskType: "imageInference",
          taskUUID: uuid(),
          positivePrompt: prompt,
          model: MODEL,
          width,
          height,
          numberResults: 1,
          outputType: "URL",
          outputFormat: "PNG",
        },
      ]),
      signal: controller.signal,
    });
    const ms = Date.now() - started;
    const text = await res.text();
    if (!res.ok) return { ok: false, ms, error: `HTTP ${res.status} ${text.slice(0, 220)}` };

    let payload;
    try { payload = JSON.parse(text); } catch { return { ok: false, ms, error: `respuesta no-JSON: ${text.slice(0, 160)}` }; }
    if (payload?.errors?.length) {
      return { ok: false, ms, error: `API error: ${JSON.stringify(payload.errors[0]).slice(0, 220)}` };
    }
    const url = payload?.data?.[0]?.imageURL ?? payload?.data?.[0]?.imageUrl;
    if (!url) return { ok: false, ms, error: `sin imageURL: ${text.slice(0, 160)}` };

    const img = await fetch(url);
    if (!img.ok) return { ok: false, ms, error: `descarga fallida ${img.status}` };
    return { ok: true, ms, buf: Buffer.from(await img.arrayBuffer()) };
  } catch (err) {
    const ms = Date.now() - started;
    const aborted = err instanceof Error && err.name === "AbortError";
    return { ok: false, ms, error: aborted ? `timeout >${TIMEOUT_MS / 1000}s` : String(err).slice(0, 160) };
  } finally {
    clearTimeout(timer);
  }
}

/** Solid, squarish, saturated-red blob near an edge: the seal signature. */
async function sealCheck(buf) {
  const N = 384;
  const { data, info } = await sharp(buf).resize(N, N, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  const mask = new Uint8Array(W * H);
  for (let i = 0, p = 0; i < data.length; i += ch, p++) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 100 && r - g > 55 && r - b > 45 && g < 130 && b < 130) mask[p] = 1;
  }
  const seen = new Uint8Array(W * H);
  let worst = null;
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p] || seen[p]) continue;
    const stack = [p]; seen[p] = 1;
    let area = 0, minX = W, maxX = 0, minY = H, maxY = 0;
    while (stack.length) {
      const q = stack.pop();
      const x = q % W, y = (q / W) | 0;
      area++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      for (const [n, guard] of [[q - 1, x > 0], [q + 1, x < W - 1], [q - W, true], [q + W, true]]) {
        if (!guard || n < 0 || n >= mask.length || seen[n] || !mask[n]) continue;
        seen[n] = 1; stack.push(n);
      }
    }
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const fill = area / (bw * bh);
    const aspect = Math.max(bw, bh) / Math.min(bw, bh);
    const areaPct = (area / (W * H)) * 100;
    const edginess = Math.max(Math.abs((minX + maxX) / 2 / W - 0.5), Math.abs((minY + maxY) / 2 / H - 0.5)) * 2;
    if (areaPct >= 0.02 && areaPct <= 3 && fill >= 0.65 && aspect <= 1.6 && edginess >= 0.6) {
      if (!worst || areaPct > worst.areaPct) worst = { areaPct, fill, aspect, edginess };
    }
  }
  return worst;
}

const prompt = await loadProductionPrompt();
await mkdir(OUT_DIR, { recursive: true });
console.log(`Runware probe: modelo ${MODEL}`);
console.log(`Prompt de produccion: ${prompt.length} chars`);
console.log(`Presupuesto de tiempo: ${TIMEOUT_MS / 1000}s (el mismo de la app)\n`);

const rows = [];
for (const t of TIERS) {
  process.stdout.write(`  ${t.tier.padEnd(13)} ${t.width}x${t.height} ... `);
  const res = await generate({ prompt, width: t.width, height: t.height });
  if (!res.ok) {
    console.log(`FALLO (${(res.ms / 1000).toFixed(1)}s) ${res.error}`);
    rows.push({ tier: t.tier, pedido: `${t.width}x${t.height}`, ok: "NO", real: "-", ms: res.ms, sello: "-", error: res.error.slice(0, 60) });
    continue;
  }
  const meta = await sharp(res.buf).metadata();
  const exact = meta.width === t.width && meta.height === t.height;
  const seal = await sealCheck(res.buf);
  const file = path.join(OUT_DIR, `${t.tier}-${t.width}x${t.height}.png`);
  await writeFile(file, res.buf);
  console.log(
    `OK ${(res.ms / 1000).toFixed(1)}s  ${meta.width}x${meta.height}${exact ? "" : "  <-- NO COINCIDE"}${seal ? "  <-- POSIBLE SELLO" : ""}`,
  );
  rows.push({
    tier: t.tier,
    pedido: `${t.width}x${t.height}`,
    ok: "si",
    real: `${meta.width}x${meta.height}`,
    ms: res.ms,
    sello: seal ? `si (${seal.areaPct.toFixed(2)}%)` : "no",
    error: "",
  });
}

console.log("\n" + "=".repeat(70));
console.table(rows);

const okAll = rows.every((r) => r.ok === "si");
const sizesExact = rows.every((r) => r.ok !== "si" || r.pedido === r.real);
const withinBudget = rows.every((r) => r.ms < TIMEOUT_MS);
console.log("\nVEREDICTO");
console.log(`  responde en los 4 tiers: ${okAll ? "SI" : "NO"}`);
console.log(`  devuelve el tamano exacto: ${sizesExact ? "SI" : "NO (habria que reescalar)"}`);
console.log(`  dentro del presupuesto de ${TIMEOUT_MS / 1000}s: ${withinBudget ? "SI" : "NO"}`);
console.log(`  imagenes en ${path.relative(repoRoot, OUT_DIR)}: revisalas a ojo antes de decidir.`);
console.log(
  okAll && sizesExact && withinBudget
    ? "\n  Apto tecnicamente para fallback 2, sujeto a revision visual."
    : "\n  NO apto tal cual: revisa los fallos antes de cablearlo.",
);
