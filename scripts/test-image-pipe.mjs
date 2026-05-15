#!/usr/bin/env node
/**
 * test-image-pipe.mjs
 *
 * Verifica el pipeline completo de generación de imágenes:
 *   1. Llama a Together AI con el prompt de un hexagrama conocido
 *   2. Descarga la imagen generada
 *   3. Genera el SVG overlay del hexagrama
 *   4. Renderiza el SVG a PNG (resvg) y lo composita encima con sharp
 *   5. Guarda la imagen final en /tmp/test-image-pipe-composited.png
 *   6. Reporta qué pasó en cada etapa
 *
 * Uso (clave en .env ya no necesaria como argumento):
 *   node scripts/test-image-pipe.mjs [hexNumber]
 *   TOGETHER_API_KEY=xxx node scripts/test-image-pipe.mjs [hexNumber]
 *
 * Ejemplo:
 *   node scripts/test-image-pipe.mjs 44
 */

import { writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Cargar .env desde la raíz del monorepo si existe ───────────────────────
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
  console.log(`📄 Variables cargadas desde ${rootEnvPath}`);
} catch {
  console.log("ℹ️  No se encontró .env raíz — usando variables de entorno del sistema.");
}

const hexNumber = parseInt(process.argv[2] ?? "44", 10);
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL = process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
const WIDTH = 1024;
const HEIGHT = 768;
const STEPS = 12;

// ── Datos de líneas para hexagramas comunes ─────────────────────────────────
// 7 = yang estático, 8 = yin estático, 9 = yang cambiante, 6 = yin cambiante
const HEX_LINE_DATA = {
  44: [6, 7, 7, 7, 7, 7], // Gou — línea 1 cambiante (yin→yang)
  1:  [7, 7, 7, 7, 7, 7], // Qian — todo yang
  2:  [8, 8, 8, 8, 8, 8], // Kun — todo yin
};
const lines = HEX_LINE_DATA[hexNumber] ?? Array(6).fill(7);

// ── Generar SVG overlay del hexagrama ──────────────────────────────────────
function buildSvgOverlay(primaryNumber, lineValues, width, height) {
  const lineH = Math.round(height * 0.052);
  const gap = Math.round(height * 0.014);
  const lineW = Math.round(width * 0.18);
  const breakW = Math.round(lineW * 0.15);
  const cx = width - Math.round(width * 0.11);
  const totalH = 6 * lineH + 5 * gap;
  const startY = Math.round((height - totalH) / 2);
  const strokeW = Math.max(3, Math.round(lineH * 0.22));
  const baseColor = "rgba(255,255,255,0.90)";
  const changingColor = "rgba(255,210,60,0.97)";

  let linesStr = "";
  for (let i = 0; i < 6; i++) {
    const pos = 6 - i; // posición 6 arriba, posición 1 abajo
    const val = lineValues[pos - 1] ?? 7;
    const isYang = val === 7 || val === 9;
    const isChanging = val === 6 || val === 9;
    const y = startY + i * (lineH + gap) + lineH / 2;
    const color = isChanging ? changingColor : baseColor;

    if (isYang) {
      linesStr += `<line x1="${cx - lineW / 2}" y1="${y}" x2="${cx + lineW / 2}" y2="${y}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
    } else {
      const half = (lineW - breakW) / 2;
      linesStr += `<line x1="${cx - lineW / 2}" y1="${y}" x2="${cx - lineW / 2 + half}" y2="${y}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
      linesStr += `<line x1="${cx + lineW / 2 - half}" y1="${y}" x2="${cx + lineW / 2}" y2="${y}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
    }
  }

  const numY = startY + totalH + Math.round(height * 0.05);
  const numSize = Math.round(height * 0.038);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="${cx - lineW / 2 - 10}" y="${startY - 10}" width="${lineW + 20}" height="${totalH + numSize + 20}" rx="6" fill="rgba(0,0,0,0.28)"/>
  ${linesStr}
  <text x="${cx}" y="${numY}" text-anchor="middle" font-size="${numSize}" fill="${baseColor}" font-family="Georgia, serif" font-weight="bold">#${primaryNumber}</text>
</svg>`;
}

// ── Llamar a Together AI ────────────────────────────────────────────────────
async function callTogether(prompt) {
  if (!TOGETHER_API_KEY) {
    console.log("⚠️  TOGETHER_API_KEY no encontrada. Omitiendo llamada a Together AI.");
    return null;
  }

  console.log(`\n📡 Llamando a Together AI (${MODEL})...`);
  console.log(`   Prompt (primeros 120 chars): ${prompt.slice(0, 120)}…`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 65_000);

  try {
    const res = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        width: WIDTH,
        height: HEIGHT,
        n: 1,
        steps: STEPS,
        output_format: "jpeg",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`❌ Together AI devolvió HTTP ${res.status}`);
      console.error(`   Body: ${errText.slice(0, 300)}`);
      return null;
    }

    const data = await res.json();
    const first = data.data?.[0];

    if (first?.url) {
      console.log(`✅ Together AI → URL: ${first.url.slice(0, 60)}…`);
      const imgRes = await fetch(first.url, { signal: AbortSignal.timeout(30_000) });
      if (!imgRes.ok) { console.error("❌ No se pudo descargar la imagen."); return null; }
      return { url: first.url, buf: Buffer.from(await imgRes.arrayBuffer()) };
    }

    if (first?.b64_json) {
      console.log(`✅ Together AI → b64_json (${first.b64_json.length} chars)`);
      return { url: null, buf: Buffer.from(first.b64_json, "base64") };
    }

    console.error("❌ Together AI: respuesta sin url ni b64_json");
    return null;
  } catch (err) {
    clearTimeout(timeout);
    console.error(err?.name === "AbortError" ? "❌ Together AI: timeout (65s)" : `❌ Together AI error: ${err}`);
    return null;
  }
}

// ── Composite: base + overlay via sharp ────────────────────────────────────
async function compositeWithSharp(baseBuf, overlaySvg) {
  // sharp puede importarse desde la raíz del monorepo
  let sharp;
  try {
    sharp = (await import("../node_modules/sharp/lib/index.js")).default;
  } catch {
    try {
      sharp = require("../node_modules/sharp/lib/index.js");
    } catch (e) {
      console.error("❌ No se pudo importar sharp:", e.message);
      return null;
    }
  }

  // Obtener dimensiones reales de la imagen base
  const meta = await sharp(baseBuf).metadata();
  const width = meta.width ?? WIDTH;
  const height = meta.height ?? HEIGHT;

  // Redimensionar el SVG a las dimensiones reales
  const overlaySized = overlaySvg
    .replace(/width="\d+"/, `width="${width}"`)
    .replace(/height="\d+"/, `height="${height}"`)
    .replace(/viewBox="0 0 \d+ \d+"/, `viewBox="0 0 ${width} ${height}"`);

  console.log(`\n🖌️  Compositando overlay (${width}×${height})...`);

  // Renderizar SVG a PNG con @resvg/resvg-js
  let overlayPng;
  try {
    const { Resvg } = await import("../node_modules/@resvg/resvg-js/index.js");
    const resvg = new Resvg(overlaySized, { fitTo: { mode: "width", value: width } });
    overlayPng = Buffer.from(resvg.render().asPng());
    console.log(`   Overlay renderizado por resvg: ${(overlayPng.length / 1024).toFixed(1)} KB`);
  } catch (resvgErr) {
    console.warn(`   ⚠️  resvg falló (${resvgErr.message}), usando SVG directo en sharp...`);
    overlayPng = Buffer.from(overlaySized, "utf8");
  }

  const composited = await sharp(baseBuf)
    .composite([{ input: overlayPng, top: 0, left: 0 }])
    .png({ compressionLevel: 6 })
    .toBuffer();

  console.log(`   Imagen compositada: ${(composited.length / 1024).toFixed(1)} KB`);
  return composited;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log(`🧪  test-image-pipe.mjs — Hexagrama #${hexNumber}`);
  console.log("=".repeat(60));

  const prompt =
    `Minimalist ink wash painting, sumi-e style, misty mountain landscape, ` +
    `solitary pine on a rocky ledge, soft gray mist, tranquil atmosphere, ` +
    `traditional Chinese ink wash, black and white with subtle warm tones, ` +
    `no text, no seals, no watermarks, no human figures, centered composition`;

  // 1. Generar SVG overlay
  const overlaySvg = buildSvgOverlay(hexNumber, lines, WIDTH, HEIGHT);
  const svgPath = join(tmpdir(), `test-image-pipe-overlay-hex${hexNumber}.svg`);
  writeFileSync(svgPath, overlaySvg, "utf8");
  console.log(`\n🖼️  SVG overlay generado → ${svgPath}`);

  // 2. Llamar a Together AI
  const togetherResult = await callTogether(prompt);

  if (!togetherResult) {
    console.log("\n⚠️  Sin imagen de Together AI — no se puede probar el composite completo.");
    console.log(`   Abre el SVG overlay en el navegador para verificar el hexagrama: ${svgPath}`);
  } else {
    // Guardar imagen base
    const basePath = join(tmpdir(), `test-image-pipe-base-hex${hexNumber}.jpg`);
    writeFileSync(basePath, togetherResult.buf);
    console.log(`💾 Imagen base guardada → ${basePath} (${(togetherResult.buf.length / 1024).toFixed(1)} KB)`);

    // 3. Compositar
    const compositedBuf = await compositeWithSharp(togetherResult.buf, overlaySvg);

    if (compositedBuf) {
      const outPath = join(tmpdir(), `test-image-pipe-composited-hex${hexNumber}.png`);
      writeFileSync(outPath, compositedBuf);
      console.log(`✅ Imagen COMPOSITADA guardada → ${outPath}`);
      // Abrir automáticamente
      const { execSync } = await import("node:child_process");
      try { execSync(`start "" "${outPath}"`, { stdio: "ignore" }); } catch {}
    } else {
      console.error("❌ Composite falló — revisa los errores arriba.");
    }
  }

  // Resumen
  console.log("\n" + "=".repeat(60));
  console.log("RESUMEN:");
  console.log(`  Together AI:    ${TOGETHER_API_KEY ? (togetherResult ? "✅ OK" : "❌ FALLÓ") : "⚠️  Sin API key"}`);
  console.log(`  SVG overlay:    ✅ Generado`);
  console.log(`  Composite:      ${togetherResult ? "✅ Ver imagen abierta" : "⚠️  Requiere imagen de Together"}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
