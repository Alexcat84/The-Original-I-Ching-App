#!/usr/bin/env node
/**
 * test-image-pipe.mjs
 *
 * Verifica el pipeline de generación de imágenes:
 *   1. Llama a Together AI con el prompt de un hexagrama conocido
 *   2. Guarda la imagen resultante en /tmp/test-image-pipe-output.*
 *   3. Genera el SVG de overlay del hexagrama y lo guarda también
 *   4. Reporta qué pasó en cada etapa
 *
 * Uso:
 *   TOGETHER_API_KEY=<key> node scripts/test-image-pipe.mjs [hexNumber]
 *
 * Ejemplo:
 *   TOGETHER_API_KEY=xxx node scripts/test-image-pipe.mjs 44
 */

import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hexNumber = parseInt(process.argv[2] ?? "44", 10);
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL = process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
const WIDTH = 1024;
const HEIGHT = 768;
const STEPS = 12;

// ── Hexagrama data mínimo para overlay ─────────────────────────────────────
// Estos son los valores de línea para el hexagrama #44 (Gou / El Encuentro):
// líneas 1→6: yin, yang, yang, yang, yang, yang  (valor 8=yin estático, 7=yang estático)
const HEX_44_LINES = [8, 7, 7, 7, 7, 7]; // posición 1..6

function buildSvgOverlay(primaryNumber, lines, width, height) {
  // SVG simplificado de overlay con número de hexagrama y líneas
  const lineH = Math.round(height * 0.045);
  const gap = Math.round(height * 0.012);
  const lineW = Math.round(width * 0.22);
  const breakW = Math.round(lineW * 0.14);
  const cx = width - Math.round(width * 0.14);
  const totalH = 6 * lineH + 5 * gap;
  const startY = Math.round((height - totalH) / 2);
  const strokeColor = "rgba(255,255,255,0.88)";
  const strokeW = Math.max(2, Math.round(lineH * 0.18));

  let linesStr = "";
  for (let i = 0; i < 6; i++) {
    const pos = 6 - i; // posición 6 arriba, 1 abajo
    const lineVal = lines[pos - 1];
    const isYang = lineVal === 7 || lineVal === 9;
    const isChanging = lineVal === 6 || lineVal === 9;
    const y = startY + i * (lineH + gap) + lineH / 2;
    const color = isChanging ? "rgba(255,220,80,0.95)" : strokeColor;

    if (isYang) {
      // Línea continua
      linesStr += `<line x1="${cx - lineW / 2}" y1="${y}" x2="${cx + lineW / 2}" y2="${y}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
    } else {
      // Línea partida
      const halfW = (lineW - breakW) / 2;
      linesStr += `<line x1="${cx - lineW / 2}" y1="${y}" x2="${cx - lineW / 2 + halfW}" y2="${y}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
      linesStr += `<line x1="${cx + lineW / 2 - halfW}" y1="${y}" x2="${cx + lineW / 2}" y2="${y}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
    }
  }

  const numY = startY + totalH + Math.round(height * 0.04);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${linesStr}
  <text x="${cx}" y="${numY}" text-anchor="middle" font-size="${Math.round(height * 0.032)}" fill="${strokeColor}" font-family="serif">#${primaryNumber}</text>
</svg>`;
}

async function callTogether(prompt) {
  if (!TOGETHER_API_KEY) {
    console.log("⚠️  TOGETHER_API_KEY no configurada. Omitiendo llamada a Together AI.");
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
      console.error(`   Body (primeros 300 chars): ${errText.slice(0, 300)}`);
      return null;
    }

    const data = await res.json();
    const first = data.data?.[0];

    if (first?.url) {
      console.log(`✅ Together AI → URL recibida: ${first.url.slice(0, 60)}…`);
      // Descargar la imagen
      const imgRes = await fetch(first.url);
      if (!imgRes.ok) {
        console.error("❌ No se pudo descargar la imagen desde la URL.");
        return null;
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      return { type: "jpeg", data: buf };
    }

    if (first?.b64_json) {
      console.log(`✅ Together AI → b64_json recibido (${first.b64_json.length} chars)`);
      return { type: "jpeg", data: Buffer.from(first.b64_json, "base64") };
    }

    console.error("❌ Together AI: respuesta sin url ni b64_json:", JSON.stringify(first).slice(0, 200));
    return null;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      console.error("❌ Together AI: timeout (65s)");
    } else {
      console.error("❌ Together AI: error de red:", err);
    }
    return null;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log(`🧪  test-image-pipe.mjs — Hexagrama #${hexNumber}`);
  console.log("=".repeat(60));

  // 1. Prompt similar al que usa el motor real para hex #44
  const prompt =
    `Minimalist ink wash painting, sumi-e style, misty mountain landscape, ` +
    `solitary pine on a rocky ledge, soft gray mist, tranquil atmosphere, ` +
    `traditional Chinese ink wash, black and white with subtle warm tones, ` +
    `no text, no seals, no watermarks, no human figures, centered composition`;

  // 2. Llamar a Together AI
  const togetherResult = await callTogether(prompt);

  if (togetherResult) {
    const outPath = join(tmpdir(), `test-image-pipe-hex${hexNumber}.jpg`);
    writeFileSync(outPath, togetherResult.data);
    console.log(`\n💾 Imagen guardada en: ${outPath}`);
    console.log(`   Tamaño: ${(togetherResult.data.length / 1024).toFixed(1)} KB`);
  } else {
    console.log("\n⚠️  Together AI no devolvió imagen. Verificando con SVG fallback...");
  }

  // 3. Generar el SVG overlay del hexagrama
  console.log("\n🖼️  Generando SVG overlay del hexagrama...");
  const lines = hexNumber === 44 ? HEX_44_LINES : Array(6).fill(7); // fallback: todo yang
  const svg = buildSvgOverlay(hexNumber, lines, WIDTH, HEIGHT);
  const svgPath = join(tmpdir(), `test-image-pipe-overlay-hex${hexNumber}.svg`);
  writeFileSync(svgPath, svg, "utf8");
  console.log(`✅ SVG overlay guardado en: ${svgPath}`);
  console.log(`   Abre este archivo en un navegador para verificar el hexagrama visual.`);

  // 4. Resumen
  console.log("\n" + "=".repeat(60));
  console.log("RESUMEN:");
  console.log(`  Together AI:    ${TOGETHER_API_KEY ? (togetherResult ? "✅ OK" : "❌ FALLÓ") : "⚠️  Sin API key"}`);
  console.log(`  SVG overlay:    ✅ Generado`);
  if (togetherResult) {
    console.log(`\n  Para verificar el composite completo (Together + overlay),`);
    console.log(`  abre la imagen JPG y el SVG overlay lado a lado en el navegador.`);
    console.log(`  En producción, el compositor los combina antes de enviar al cliente.`);
  }
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
