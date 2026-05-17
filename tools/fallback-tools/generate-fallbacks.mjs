#!/usr/bin/env node
/**
 * Hexagram-specific fallback image generator for Cloudflare R2
 *
 * Generates 2,760 WebP images organized by hexagram/bones state → variant → tier.
 * These are uploaded to R2 and served as precomputed fallbacks, bypassing Together AI
 * at runtime for faster response and lower cost.
 *
 * Output structure (matches R2 key layout):
 *   output/iching/{1..64}/{1..10}/{width}x{height}.webp
 *   output/bones/{key}/{1..10}/{width}x{height}.webp
 *
 * Usage:
 *   cd tools/fallback-tools
 *   npm install
 *   TOGETHER_API_KEY=xxx node generate-fallbacks.mjs --test    ← 8 QA images first
 *   TOGETHER_API_KEY=xxx node generate-fallbacks.mjs           ← full 2,760 images
 *
 * The script is fully resumable: progress.json tracks completed keys.
 * Re-running after interruption skips already-generated images.
 */

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pLimit from "p-limit";
import sharp from "sharp";

// ─── Config ──────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");
const PROGRESS_FILE = path.join(__dirname, "progress.json");
const TEST_MODE = process.argv.includes("--test");

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY?.trim();
if (!TOGETHER_API_KEY) {
  console.error("❌  Missing TOGETHER_API_KEY environment variable");
  process.exit(1);
}

const MODEL = "black-forest-labs/FLUX.1-schnell";
const STEPS = 4;
const CONCURRENCY = 3;
const DELAY_MS = 800;
const MAX_RETRIES = 3;
const VARIANTS = 10;

// ─── Tiers ───────────────────────────────────────────────────────────────────

const TIERS = [
  { key: "free",         w: 1024, h: 768  },
  { key: "seeker",       w: 1024, h: 1024 },
  { key: "practitioner", w: 1184, h: 1184 },
  { key: "master",       w: 1504, h: 1504 },
];

// Cost per MP: $0.0027 (Together FLUX.1 Schnell)
const COST = {
  free:         (1024 * 768)   / 1_000_000 * 0.0027,
  seeker:       (1024 * 1024)  / 1_000_000 * 0.0027,
  practitioner: (1184 * 1184)  / 1_000_000 * 0.0027,
  master:       (1504 * 1504)  / 1_000_000 * 0.0027,
};

// ─── Style variants (1 per variant slot, cycled) ──────────────────────────────

const STYLE_MATRIX = [
  "traditional ink wash sumi-e painting, monochromatic brushwork, flowing black ink",
  "Song dynasty panoramic landscape scroll, muted earth tones, vast horizontal composition",
  "dramatic chiaroscuro light and shadow, cinematic depth, strong contrast between light and dark",
  "minimalist zen composition, vast negative space, solitary focal element, quiet restraint",
  "luminous Chinese watercolor, transparent layered washes, soft diffused light",
  "atmospheric realism, volumetric morning fog, soft diffused natural light, misty distance",
  "golden hour warm amber light, majestic scale, sweeping vistas, radiant sky",
  "full moon night scene, silver and deep indigo tones, reflective water surfaces",
  "fresh spring morning, delicate greens and whites, gentle mist, awakening nature",
  "deep autumn palette, rich reds ochres and golds, melancholy beauty, fallen leaves",
];

// ─── 64 Hexagrams ────────────────────────────────────────────────────────────

const HEXAGRAMS = [
  { n: 1,  name: "Qian",      theme: "vast open sky, towering cumulus clouds, golden light rays, pure yang energy, heavenly expanse" },
  { n: 2,  name: "Kun",       theme: "fertile dark earth, rolling plains at dusk, receptive yin energy, deep rich soil, endless horizon" },
  { n: 3,  name: "Zhun",      theme: "tender green shoots breaking through earth after rain, spring mud, new growth, early morning light" },
  { n: 4,  name: "Meng",      theme: "mountain spring trickling through moss and stone, gentle learning, morning mist in forest valley" },
  { n: 5,  name: "Xu",        theme: "heavy clouds gathering above ancient pine forest, patient waiting, storm approaching, still air" },
  { n: 6,  name: "Song",      theme: "two rivers colliding in narrow gorge, turbulent churning water, opposing currents meeting" },
  { n: 7,  name: "Shi",       theme: "vast disciplined army encampment at twilight, orderly rows on open earth, collective strength" },
  { n: 8,  name: "Bi",        theme: "multiple rivers converging into one great flow, union of waters, moving together toward the sea" },
  { n: 9,  name: "Xiao Xu",   theme: "gentle breeze moving through tall grass, small clouds drifting, subtle restraint, patience in wind" },
  { n: 10, name: "Lu",        theme: "narrow mountain path along cliff edge above clouds, careful steps, precision, treacherous beauty" },
  { n: 11, name: "Tai",       theme: "spring abundance, heaven and earth meeting at horizon, flowing harmony, cherry blossoms" },
  { n: 12, name: "Pi",        theme: "autumn stagnation, heaven and earth separated by dense immovable clouds, contemplative isolation" },
  { n: 13, name: "Tong Ren",  theme: "fire ascending toward open sky at night, community gathering around sacred flame, shared warmth" },
  { n: 14, name: "Da You",    theme: "midday sun at zenith over golden harvest fields, peak abundance and power, overflowing plenty" },
  { n: 15, name: "Qian",      theme: "great mountain hidden below ground level, humble valley, earth embracing depth, quiet modesty" },
  { n: 16, name: "Yu",        theme: "thunder rolling across open plains, earth vibrating with energy, enthusiasm, dynamic sky" },
  { n: 17, name: "Sui",       theme: "lake reflecting autumn moon in perfect stillness, gentle following, calm adaptation, clear water" },
  { n: 18, name: "Gu",        theme: "decayed ancient hollow tree with new green growth emerging, wind on mountain, renewal through decay" },
  { n: 19, name: "Lin",       theme: "approaching tide rolling over earth, lake expanding its reach, gentle oversight of vast plain" },
  { n: 20, name: "Guan",      theme: "ancient watchtower standing on cliff above vast plains, wind over earth, wide contemplative view" },
  { n: 21, name: "Shi He",    theme: "lightning striking through dense forest, dramatic illumination, justice breaking through, decisive force" },
  { n: 22, name: "Bi",        theme: "moonlight falling on mountain wildflowers, elegant natural adornment, soft silver illumination" },
  { n: 23, name: "Bo",        theme: "eroding cliff face slowly crumbling into dark sea, gradual dissolution, stone falling away" },
  { n: 24, name: "Fu",        theme: "first dawn light breaking under dark earth, winter solstice, return of warmth, rebirth of day" },
  { n: 25, name: "Wu Wang",   theme: "innocent deer in pristine ancient forest, unclouded sky above, spontaneous purity, natural freedom" },
  { n: 26, name: "Da Xu",     theme: "mountain containing and accumulating storm clouds within its peaks, great reservoir of potential" },
  { n: 27, name: "Yi",        theme: "ancient lotus pond with dragon turtle at rest, nourishment from still water, careful balance" },
  { n: 28, name: "Da Guo",    theme: "ancient stone bridge bending under great weight over flooded river, critical threshold moment" },
  { n: 29, name: "Kan",       theme: "rushing rapids cascading through deep mountain gorge, double danger, powerful waterfalls" },
  { n: 30, name: "Li",        theme: "twin flames clinging to each other in evening sky, double radiance, phoenix rising from embers" },
  { n: 31, name: "Xian",      theme: "serene lake resting in mountain hollow, magnetic stillness, mutual resonance of water and stone" },
  { n: 32, name: "Heng",      theme: "ancient gnarled tree enduring all seasons, thunder and wind together yet roots holding firm" },
  { n: 33, name: "Dun",       theme: "mountain peak retreating gracefully into clouds, dignified strategic withdrawal, dignified absence" },
  { n: 34, name: "Da Zhuang", theme: "great thunder rolling through heaven, sky charged with dynamic power, unleashed celestial energy" },
  { n: 35, name: "Jin",       theme: "sun rising steadily above flat earth horizon, steady progress of dawn light, advancing warmth" },
  { n: 36, name: "Ming Yi",   theme: "fire hidden beneath earth at sunset, concealed inner light, protective outer darkness" },
  { n: 37, name: "Jia Ren",   theme: "warm light glowing through paper windows of family home at dusk, shelter and fire within" },
  { n: 38, name: "Kui",       theme: "fire reflected above dark lake creating contrast of elements, opposition and complementary forces" },
  { n: 39, name: "Jian",      theme: "treacherous mountain path blocked by snow and ice, water rushing below, difficult obstruction" },
  { n: 40, name: "Jie",       theme: "spring storm passing, clearing sky after thunder, liberation, peaceful aftermath following tension" },
  { n: 41, name: "Sun",       theme: "mountain lake at low ebb, deliberate reduction to essentials, simplicity as offering, clarity" },
  { n: 42, name: "Yi",        theme: "wind over thunder, rapid natural growth in abundance, beneficial increase spreading outward" },
  { n: 43, name: "Guai",      theme: "lake overflowing past its banks toward heaven, decisive breakthrough, flooding as resolution" },
  { n: 44, name: "Gou",       theme: "wind sweeping unexpectedly under heaven, surprise encounter arriving, something coming from below" },
  { n: 45, name: "Cui",       theme: "great gathering at sacred lake, earth reflecting water perfectly, assembly of all elements" },
  { n: 46, name: "Sheng",     theme: "young sapling pushing steadily upward through rich earth, ascending, gradual natural rise" },
  { n: 47, name: "Kun",       theme: "dried ancient lake bed, cracked earth, bare winter trees, endurance in profound scarcity" },
  { n: 48, name: "Jing",      theme: "ancient stone well in deep forest, inexhaustible water source, community gathering, cool depth" },
  { n: 49, name: "Ge",        theme: "volcanic eruption transforming landscape completely, radical change, revolutionary renewal of earth" },
  { n: 50, name: "Ding",      theme: "sacred bronze cauldron on ritual mountain platform, fire below, alchemy of transformation" },
  { n: 51, name: "Zhen",      theme: "double thunderstorm, twin lightning striking earth, shocking awakening, sky fully alive" },
  { n: 52, name: "Gen",       theme: "lone mountain in absolute stillness, twin peaks in meditation, no movement, complete rest" },
  { n: 53, name: "Jian",      theme: "wild geese migrating in orderly formation over misty mountain, gradual ordered natural progress" },
  { n: 54, name: "Gui Mei",   theme: "young crescent moon reflected in still lake at night, subordinate gentle aspiration, quiet longing" },
  { n: 55, name: "Feng",      theme: "dramatic storm with lightning at peak abundance, fullness of sky, thunder at high noon" },
  { n: 56, name: "Lu",        theme: "lone traveler's small fire burning on dark mountainside, impermanence, wandering, transient shelter" },
  { n: 57, name: "Xun",       theme: "wind moving ceaselessly through endless bamboo forest, double gentle penetration, persistent breath" },
  { n: 58, name: "Dui",       theme: "twin lakes perfectly reflecting each other, joyful open exchange, mirrored water delight" },
  { n: 59, name: "Huan",      theme: "wind scattering morning mist over open water, dissolution into clarity, dispersion of fog" },
  { n: 60, name: "Jie",       theme: "bamboo segments defining measured space, river flowing within natural banks, conscious natural limit" },
  { n: 61, name: "Zhong Fu",  theme: "wind moving over perfectly calm lake, inner sincerity visible as gentle ripples, transparent depth" },
  { n: 62, name: "Xiao Guo",  theme: "lone bird flying carefully low over mountain ridge, small careful excess, close attention to detail" },
  { n: 63, name: "Ji Ji",     theme: "water and fire in perfect equilibrium, completion and stillness, all elements in balance" },
  { n: 64, name: "Wei Ji",    theme: "fire above water in active transition, fox crossing frozen river, before completion, becoming" },
];

// ─── 5 Oracle Bones states ───────────────────────────────────────────────────

const BONES_STATES = [
  {
    key: "ji_clear",
    theme: "dramatic ancient Chinese landscape at golden dawn, auspicious crane soaring above sacred mountain lake, victorious golden light breaking through clouds, spiritual triumph, serene sovereign power",
  },
  {
    key: "ji_moderate",
    theme: "peaceful Chinese valley at warm dusk, gentle river flowing through bamboo forest, amber light on still water, moderate blessing, calm prosperity, soft favorable energy",
  },
  {
    key: "xiong_moderate",
    theme: "overcast ancient Chinese mountain pass, heavy grey clouds over still lake, muted tones, contemplative caution, subdued restrained landscape, waiting atmosphere",
  },
  {
    key: "xiong_clear",
    theme: "stormy Chinese coastal cliffs at night, dark churning sea below, dramatic storm over water, deep crimson storm clouds, powerful warning forces, vast turbulent ocean",
  },
  {
    key: "silence",
    theme: "absolute stillness, empty Chinese zen garden in deep winter fog, snow-covered stones, no wind, profound silence, white void of winter, suspended timeless moment",
  },
];

// ─── Prompt builder (positive framing only — FLUX.1 Schnell ignores negative_prompt) ──

function buildPrompt(theme, styleModifier, variant) {
  return [
    "Ancient Chinese landscape art,",
    theme + ",",
    styleModifier + ",",
    "highly detailed masterwork, breathtaking traditional composition,",
    "timeless ethereal atmosphere, traditional Chinese aesthetic,",
    "pure scenic landscape painting only, pristine natural environment,",
    "clean photorealistic traditional art, text-free unmarked scene,",
    "unobstructed sky and terrain, clear natural vista,",
    `artistic composition variant ${variant}`,
  ].join(" ");
}

// ─── Together AI ──────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateImage({ prompt, width, height }) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        width,
        height,
        n: 1,
        steps: STEPS,
        response_format: "url",
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const retriable = res.status === 429 || res.status >= 500;
      if (retriable && attempt < MAX_RETRIES) {
        const wait = 3000 * (attempt + 1);
        console.warn(`  ↻ Together ${res.status} — retrying in ${wait / 1000}s`);
        await sleep(wait);
        continue;
      }
      throw new Error(`Together ${res.status}: ${detail.slice(0, 200)}`);
    }

    const payload = await res.json();
    const url = payload?.data?.[0]?.url;
    if (!url) {
      if (attempt < MAX_RETRIES) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      throw new Error("Together response had no image URL");
    }

    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      if (attempt < MAX_RETRIES) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      throw new Error(`Image fetch failed: ${imgRes.status}`);
    }

    const png = Buffer.from(await imgRes.arrayBuffer());
    const webp = await sharp(png).webp({ quality: 85 }).toBuffer();
    return webp;
  }
  throw new Error("Max retries exceeded");
}

// ─── Progress tracking ────────────────────────────────────────────────────────

async function loadProgress() {
  try {
    const raw = await readFile(PROGRESS_FILE, "utf8");
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

async function saveProgress(done) {
  await writeFile(PROGRESS_FILE, JSON.stringify([...done]), "utf8");
}

// ─── Job builders ─────────────────────────────────────────────────────────────

function buildAllJobs() {
  const jobs = [];

  for (const hex of HEXAGRAMS) {
    for (let v = 1; v <= VARIANTS; v++) {
      for (const tier of TIERS) {
        jobs.push({
          key: `iching/${hex.n}/${v}/${tier.key}`,
          outPath: path.join(OUTPUT_DIR, "iching", String(hex.n), String(v), `${tier.w}x${tier.h}.webp`),
          prompt: buildPrompt(hex.theme, STYLE_MATRIX[(v - 1) % STYLE_MATRIX.length], v),
          w: tier.w,
          h: tier.h,
          cost: COST[tier.key],
        });
      }
    }
  }

  for (const bone of BONES_STATES) {
    for (let v = 1; v <= VARIANTS; v++) {
      for (const tier of TIERS) {
        jobs.push({
          key: `bones/${bone.key}/${v}/${tier.key}`,
          outPath: path.join(OUTPUT_DIR, "bones", bone.key, String(v), `${tier.w}x${tier.h}.webp`),
          prompt: buildPrompt(bone.theme, STYLE_MATRIX[(v - 1) % STYLE_MATRIX.length], v),
          w: tier.w,
          h: tier.h,
          cost: COST[tier.key],
        });
      }
    }
  }

  return jobs;
}

function buildTestJobs() {
  return [
    { key: "TEST/iching_1_master",       subject: HEXAGRAMS[0],  v: 1, tier: TIERS[3], filename: "iching_1_master.webp" },
    { key: "TEST/iching_31_master",      subject: HEXAGRAMS[30], v: 1, tier: TIERS[3], filename: "iching_31_master.webp" },
    { key: "TEST/iching_64_master",      subject: HEXAGRAMS[63], v: 1, tier: TIERS[3], filename: "iching_64_master.webp" },
    { key: "TEST/bones_ji_clear_master", subject: BONES_STATES[0], v: 1, tier: TIERS[3], filename: "bones_ji_clear_master.webp" },
    { key: "TEST/bones_silence_master",  subject: BONES_STATES[4], v: 1, tier: TIERS[3], filename: "bones_silence_master.webp" },
    { key: "TEST/iching_1_free",         subject: HEXAGRAMS[0],  v: 1, tier: TIERS[0], filename: "iching_1_free.webp" },
    { key: "TEST/iching_31_seeker",      subject: HEXAGRAMS[30], v: 1, tier: TIERS[1], filename: "iching_31_seeker.webp" },
    { key: "TEST/iching_64_practitioner",subject: HEXAGRAMS[63], v: 1, tier: TIERS[2], filename: "iching_64_practitioner.webp" },
  ].map((j) => ({
    key: j.key,
    outPath: path.join(OUTPUT_DIR, "TEST", j.filename),
    prompt: buildPrompt(j.subject.theme, STYLE_MATRIX[0], j.v),
    w: j.tier.w,
    h: j.tier.h,
    cost: COST[j.tier.key],
  }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (TEST_MODE) {
    console.log("🧪 TEST MODE — generating 8 QA images into output/TEST/\n");
    const testJobs = buildTestJobs();
    await mkdir(path.join(OUTPUT_DIR, "TEST"), { recursive: true });

    for (const job of testJobs) {
      process.stdout.write(`  ${job.key} (${job.w}×${job.h}) … `);
      try {
        const webp = await generateImage({ prompt: job.prompt, width: job.w, height: job.h });
        await writeFile(job.outPath, webp);
        console.log(`✅  ${(webp.length / 1024).toFixed(0)} KB`);
      } catch (err) {
        console.log(`❌  ${err.message}`);
      }
      await sleep(DELAY_MS);
    }

    console.log(`
✅ TEST COMPLETO — revisa las 8 imágenes en output/TEST/
Si la calidad es correcta, ejecuta sin --test para la generación completa.
`);
    return;
  }

  // Full generation
  const allJobs = buildAllJobs();
  const done = await loadProgress();
  const pending = allJobs.filter((j) => !done.has(j.key));
  const totalCost = allJobs.reduce((s, j) => s + j.cost, 0);
  const pendingCost = pending.reduce((s, j) => s + j.cost, 0);
  const estMinutes = Math.ceil((pending.length / CONCURRENCY) * (3 / 60));

  console.log(`
📦 Total imágenes : ${allJobs.length}
✅ Ya completadas : ${done.size}
🔄 Pendientes     : ${pending.length}
💰 Costo estimado : $${pendingCost.toFixed(2)} (total proyecto: $${totalCost.toFixed(2)})
⏱  Tiempo est.    : ~${estMinutes} min (concurrencia ${CONCURRENCY})
`);

  if (pending.length === 0) {
    console.log("✅ Nada pendiente. Todo generado.");
    return;
  }

  const limit = pLimit(CONCURRENCY);
  let completed = 0;
  let spentSoFar = 0;

  const tasks = pending.map((job) =>
    limit(async () => {
      await mkdir(path.dirname(job.outPath), { recursive: true });
      const webp = await generateImage({ prompt: job.prompt, width: job.w, height: job.h });
      await writeFile(job.outPath, webp);
      done.add(job.key);
      await saveProgress(done);
      completed++;
      spentSoFar += job.cost;

      if (completed % 50 === 0 || completed === pending.length) {
        const pct = ((completed / pending.length) * 100).toFixed(1);
        console.log(`[${completed}/${pending.length}] ${pct}% — ${job.key} — $${spentSoFar.toFixed(2)} gastados`);
      } else {
        console.log(`  ✅ ${job.key} — ${(webp.length / 1024).toFixed(0)} KB`);
      }
    })
  );

  try {
    await Promise.all(tasks);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    console.log("Progress guardado. Vuelve a ejecutar para continuar.");
    process.exitCode = 1;
    return;
  }

  console.log(`\n✅ Generación completa. ${allJobs.length} imágenes en output/`);
  console.log(`💰 Gasto total: $${spentSoFar.toFixed(2)}`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exitCode = 1;
});
