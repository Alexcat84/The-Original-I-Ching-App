#!/usr/bin/env node
/**
 * test-image-pipe.mjs
 *
 * Verifica el pipeline completo de imágenes usando la lógica EXACTA de producción:
 *   1. Llama a Together AI con el prompt del hexagrama
 *   2. Genera el overlay SVG idéntico al que usa buildSumiHexagramOverlaySvgDataUrl
 *   3. Renderiza el SVG a PNG con resvg y lo composita con sharp
 *   4. Guarda la imagen final y la abre automáticamente
 *
 * Carga .env desde la raíz del monorepo automáticamente.
 *
 * Uso:
 *   node scripts/test-image-pipe.mjs [hexNumber]
 *
 * Ejemplos:
 *   node scripts/test-image-pipe.mjs 8    → Hexagrama #8 Bi / Union
 *   node scripts/test-image-pipe.mjs 44   → Hexagrama #44 Gou / Coming to Meet
 *   node scripts/test-image-pipe.mjs 1    → Hexagrama #1 Qian / The Creative
 */

import { writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Cargar .env ─────────────────────────────────────────────────────────────
const rootEnvPath = resolve(__dirname, "../.env");
try {
  const envContent = readFileSync(rootEnvPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
  console.log(`📄 .env cargado desde ${rootEnvPath}`);
} catch {
  console.log("ℹ️  No hay .env raíz — usando variables del sistema.");
}

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL = process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";

// ── Datos de hexagramas para la prueba ─────────────────────────────────────
// value: 7=yang fijo, 8=yin fijo, 9=yang cambiante, 6=yin cambiante
// position 1=abajo, 6=arriba
const HEX_DATA = {
  1:  { name: "The Creative",       chinese: "乾", pinyin: "Qián",  lines: [{p:1,v:7},{p:2,v:7},{p:3,v:7},{p:4,v:7},{p:5,v:7},{p:6,v:7}] },
  2:  { name: "The Receptive",      chinese: "坤", pinyin: "Kūn",   lines: [{p:1,v:8},{p:2,v:8},{p:3,v:8},{p:4,v:8},{p:5,v:8},{p:6,v:8}] },
  8:  { name: "Union",              chinese: "比", pinyin: "Bǐ",    lines: [{p:1,v:8},{p:2,v:8},{p:3,v:8},{p:4,v:8},{p:5,v:7},{p:6,v:8}], transformed: { number: 3, name: "Beginning", chinese: "屯" } },
  44: { name: "Coming to Meet",     chinese: "姤", pinyin: "Gòu",   lines: [{p:1,v:6},{p:2,v:7},{p:3,v:7},{p:4,v:7},{p:5,v:7},{p:6,v:7}], transformed: { number: 1, name: "The Creative", chinese: "乾" } },
  58: { name: "The Joyous, Lake",   chinese: "兑", pinyin: "Duì",   lines: [{p:1,v:7},{p:2,v:7},{p:3,v:8},{p:4,v:7},{p:5,v:7},{p:6,v:8}] },
  63: { name: "After Completion",   chinese: "既济",pinyin: "Jì Jì", lines: [{p:1,v:7},{p:2,v:8},{p:3,v:7},{p:4,v:8},{p:5,v:7},{p:6,v:8}] },
};

const hexNumber = parseInt(process.argv[2] ?? "8", 10);
const hexData = HEX_DATA[hexNumber] ?? HEX_DATA[8];

// ── Overlay SVG — lógica IDÉNTICA a buildSumiHexagramOverlaySvgDataUrl ──────
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function isYang(value) { return value === 7 || value === 9; }

function buildOverlaySvg(hex, outputWidth, outputHeight) {
  const W = 1344, H = 768, cx = W / 2;
  const lineGap = 58, baseY = 528, barH = 28, halfW = 244, yinGap = 60;

  const sorted = [...hex.lines].sort((a, b) => a.p - b.p);
  const lineEls = [];

  for (let i = 0; i < sorted.length; i++) {
    const line = sorted[i];
    const y = baseY - i * lineGap;
    const changing = line.v === 6 || line.v === 9;
    const gOpen = changing ? `<g filter="url(#goldGlow)">` : `<g>`;
    const fill   = changing ? "#c9a010" : "#4a2c18";
    const stroke = changing ? "#fffef8" : "#faf4eb";
    const sw     = changing ? 4.2 : 3.5;

    if (isYang(line.v)) {
      lineEls.push(`${gOpen}<rect x="${cx - halfW}" y="${y}" width="${halfW * 2}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`);
    } else {
      const segW = halfW - yinGap / 2;
      lineEls.push(
        `${gOpen}<rect x="${cx - halfW}" y="${y}" width="${segW}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>` +
        `<rect x="${cx + yinGap / 2}" y="${y}" width="${segW}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`
      );
    }
  }

  const subZh = escapeXml(
    `${hex.chinese}${hex.transformed ? ` → ${hex.transformed.chinese}` : ""}`
  );
  const subEn = escapeXml(
    `#${hexNumber} ${hex.name}${hex.transformed ? ` → #${hex.transformed.number} ${hex.transformed.name}` : ""}`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${W} ${H}">
<defs>
  <filter id="goldGlow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="7" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<g>${lineEls.join("\n")}</g>
<text x="${cx}" y="125" text-anchor="middle" fill="#1c1a16" stroke="rgba(255,248,242,0.94)" stroke-width="5" paint-order="stroke fill" font-size="92" font-family='Noto Serif TC, Noto Serif SC, SimSun, STSong, serif' font-weight="700">${subZh}</text>
<text x="${cx}" y="178" text-anchor="middle" fill="#2e2a22" stroke="rgba(255,248,242,0.9)" stroke-width="3" paint-order="stroke fill" font-size="34" font-family="Georgia, 'Noto Serif', serif" font-weight="600">${subEn}</text>
</svg>`;
}

// ── Together AI ──────────────────────────────────────────────────────────────
async function callTogether(prompt, width, height) {
  if (!TOGETHER_API_KEY) {
    console.log("⚠️  TOGETHER_API_KEY no encontrada.");
    return null;
  }
  console.log(`\n📡 Together AI → ${MODEL} (${width}×${height})`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 65_000);
  try {
    const res = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${TOGETHER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, width, height, n: 1, steps: 12, output_format: "jpeg" }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error(`❌ HTTP ${res.status}: ${err.slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    const first = data.data?.[0];
    if (first?.url) {
      console.log(`✅ URL recibida: ${first.url.slice(0, 60)}…`);
      const imgRes = await fetch(first.url, { signal: AbortSignal.timeout(30_000) });
      if (!imgRes.ok) { console.error("❌ No se pudo descargar."); return null; }
      return Buffer.from(await imgRes.arrayBuffer());
    }
    if (first?.b64_json) {
      console.log(`✅ b64_json recibido (${first.b64_json.length} chars)`);
      return Buffer.from(first.b64_json, "base64");
    }
    console.error("❌ Respuesta sin url ni b64_json");
    return null;
  } catch (err) {
    clearTimeout(timeout);
    console.error(err?.name === "AbortError" ? "❌ Timeout (65s)" : `❌ Error: ${err}`);
    return null;
  }
}

// ── Composite con resvg + sharp ──────────────────────────────────────────────
async function composite(baseBuf, overlaySvg) {
  const sharp = (await import("../node_modules/sharp/lib/index.js")).default;
  const { Resvg } = await import("../node_modules/@resvg/resvg-js/index.js");

  const meta = await sharp(baseBuf).metadata();
  const W = meta.width ?? 1024;
  const H = meta.height ?? 768;

  // Resize overlay viewBox to match actual image size
  const sized = overlaySvg
    .replace(/width="\d+"/, `width="${W}"`)
    .replace(/height="\d+"/, `height="${H}"`);

  console.log(`\n🖌️  Renderizando overlay SVG → PNG (resvg, ${W}×${H})…`);
  const resvg = new Resvg(sized, { fitTo: { mode: "width", value: W } });
  const overlayPng = Buffer.from(resvg.render().asPng());
  console.log(`   Overlay: ${(overlayPng.length / 1024).toFixed(1)} KB`);

  const out = await sharp(baseBuf)
    .composite([{ input: overlayPng, top: 0, left: 0 }])
    .png({ compressionLevel: 6 })
    .toBuffer();
  console.log(`   Composited: ${(out.length / 1024).toFixed(1)} KB`);
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const W = 1024, H = 768; // seeker/free tier size

  console.log("=".repeat(60));
  console.log(`🧪  test-image-pipe — Hexagrama #${hexNumber} ${hexData.chinese} ${hexData.name}`);
  if (hexData.transformed) console.log(`   → #${hexData.transformed.number} ${hexData.transformed.chinese} ${hexData.transformed.name}`);
  console.log("=".repeat(60));

  // Prompt igual al que usaría el motor de producción
  const prompt =
    `Ethereal Chinese ink wash landscape, misty mountains and still water, ` +
    `soft morning mist, pine trees on rocky cliffs, contemplative atmosphere, ` +
    `traditional sumi-e style, muted blues and grays, no text, no seals, ` +
    `no watermarks, no people, wide panoramic view`;

  // 1. Together AI
  const baseBuf = await callTogether(prompt, W, H);

  if (!baseBuf) {
    console.log("\n❌ Sin imagen base — no se puede verificar el composite.");
    process.exit(1);
  }

  // Guardar base
  const basePath = join(tmpdir(), `iching-base-hex${hexNumber}.jpg`);
  writeFileSync(basePath, baseBuf);
  console.log(`💾 Base guardada → ${basePath} (${(baseBuf.length / 1024).toFixed(1)} KB)`);

  // 2. Generar overlay con lógica idéntica a producción
  const overlaySvg = buildOverlaySvg(hexData, W, H);
  const svgPath = join(tmpdir(), `iching-overlay-hex${hexNumber}.svg`);
  writeFileSync(svgPath, overlaySvg, "utf8");
  console.log(`🖼️  Overlay SVG → ${svgPath}`);

  // 3. Composite
  const compositedBuf = await composite(baseBuf, overlaySvg);
  const outPath = join(tmpdir(), `iching-composited-hex${hexNumber}.png`);
  writeFileSync(outPath, compositedBuf);
  console.log(`\n✅ RESULTADO FINAL → ${outPath}`);

  // Abrir automáticamente
  try { execSync(`start "" "${outPath}"`, { stdio: "ignore" }); } catch {}

  console.log("\n" + "=".repeat(60));
  console.log("RESUMEN:");
  console.log(`  Together AI:   ✅ OK`);
  console.log(`  Overlay SVG:   ✅ idéntico a producción`);
  console.log(`  Composite:     ✅ resvg + sharp`);
  console.log("=".repeat(60));
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
