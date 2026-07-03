/**
 * One-shot: genera 4 imágenes de prueba via Together AI (FLUX.1-schnell) usando
 * el mismo pipeline de producción que buildImageAsset(), composita el overlay
 * de títulos con el nuevo renderizador @napi-rs/canvas, y guarda los PNG en
 * reports/overlay-pango-e2e-samples/.
 *
 * Uso: node --loader ts-node/esm scripts/archive/gen-overlay-together-samples.mjs
 * O con tsx:  npx tsx scripts/archive/gen-overlay-together-samples.mjs
 *
 * Requiere TOGETHER_API_KEY en .env (ya configurado).
 */

import "dotenv/config";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(ROOT, "reports", "overlay-pango-e2e-samples");

// ──────────────────────────────────────────────────────────────────────────────
// Importamos los módulos compilados del workspace (TypeScript → dist)
// Usamos tsx via dynamic import para poder importar TS directamente
// ──────────────────────────────────────────────────────────────────────────────

// Ruta al módulo overlay-title-pango ya compilado o via tsx
// Usamos la ruta relativa al source y dejamos que tsx transpile
const WEB_SRC = path.join(ROOT, "apps", "web", "src", "lib");

// Configuración de las 4 muestras de prueba
const SAMPLES = [
  {
    id: "khwan-to-khien",
    label: "Legge #2 Khwăn → #1 Khien (caso que disparó la regresión)",
    primaryNumber: 2,
    primaryName: "Khwăn",
    primaryChinese: "坤",
    transformedNumber: 1,
    transformedName: "Khien",
    transformedChinese: "乾",
    prompt:
      "NEGATIVE PROMPT: no calligraphy, no text, no symbols, no hexagrams, no people. PRIMARY SETTING: ancient Chinese landscape, misty mountain peaks reflected in still water, ink-wash painting style, rich black brushwork, soft grey mist, tranquil atmosphere, watercolor wash, Song dynasty aesthetic",
    lines: [
      { position: 1, value: 8, isChanging: false },
      { position: 2, value: 8, isChanging: false },
      { position: 3, value: 8, isChanging: false },
      { position: 4, value: 8, isChanging: false },
      { position: 5, value: 8, isChanging: false },
      { position: 6, value: 8, isChanging: false },
    ],
  },
  {
    id: "hexagram3-to-8",
    label: "Legge #3 Chun → #8 Pih (caso histórico 3→8 con diacríticos)",
    primaryNumber: 3,
    primaryName: "Chun",
    primaryChinese: "屯",
    transformedNumber: 8,
    transformedName: "Pih",
    transformedChinese: "比",
    prompt:
      "NEGATIVE PROMPT: no calligraphy, no text, no symbols, no hexagrams, no people. PRIMARY SETTING: spring rain on ancient forest, new sprouts emerging from fertile earth, misty bamboo grove, delicate ink brushwork, watercolor wash, morning light, Song dynasty aesthetic",
    lines: [
      { position: 1, value: 7, isChanging: false },
      { position: 2, value: 8, isChanging: false },
      { position: 3, value: 8, isChanging: false },
      { position: 4, value: 7, isChanging: false },
      { position: 5, value: 8, isChanging: false },
      { position: 6, value: 7, isChanging: false },
    ],
  },
  {
    id: "hexagram43-to-44",
    label: "Legge #43 Kwăi → #44 Kow (CJK: 夬→姤, caracteres que faltaban en la fuente)",
    primaryNumber: 43,
    primaryName: "Kwăi",
    primaryChinese: "夬",
    transformedNumber: 44,
    transformedName: "Kow",
    transformedChinese: "姤",
    prompt:
      "NEGATIVE PROMPT: no calligraphy, no text, no symbols, no hexagrams, no people. PRIMARY SETTING: stormy sky clearing over ancient city walls, powerful wind dispersing dark clouds, dramatic ink-wash brushwork, strong contrast, dynamic atmosphere, Tang dynasty aesthetic",
    lines: [
      { position: 1, value: 7, isChanging: false },
      { position: 2, value: 7, isChanging: false },
      { position: 3, value: 7, isChanging: false },
      { position: 4, value: 7, isChanging: false },
      { position: 5, value: 7, isChanging: false },
      { position: 6, value: 8, isChanging: false },
    ],
  },
  {
    id: "wilhelm-qian-kun",
    label: "Wilhelm #1 Ch'ien → #2 K'un (mutación Qian→Kun, todas las líneas cambian)",
    primaryNumber: 1,
    primaryName: "Ch'ien",
    primaryChinese: "乾",
    transformedNumber: 2,
    transformedName: "K'un",
    transformedChinese: "坤",
    prompt:
      "NEGATIVE PROMPT: no calligraphy, no text, no symbols, no hexagrams, no people. PRIMARY SETTING: golden sunrise over vast plains, powerful dragon ascending from clouds, celestial light rays, majestic ink-wash painting, traditional Chinese landscape, Zhou dynasty aesthetic",
    lines: [
      { position: 1, value: 9, isChanging: true },
      { position: 2, value: 9, isChanging: true },
      { position: 3, value: 9, isChanging: true },
      { position: 4, value: 9, isChanging: true },
      { position: 5, value: 9, isChanging: true },
      { position: 6, value: 9, isChanging: true },
    ],
  },
];

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_IMAGE_MODEL = process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
const TOGETHER_IMAGE_STEPS = Number(process.env.TOGETHER_IMAGE_STEPS ?? "12");
const WIDTH = 1344;
const HEIGHT = 768;

async function generateTogetherImage(prompt) {
  if (!TOGETHER_API_KEY) throw new Error("TOGETHER_API_KEY not set");
  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TOGETHER_IMAGE_MODEL,
      prompt: prompt.slice(0, 2800),
      width: WIDTH,
      height: HEIGHT,
      n: 1,
      steps: Math.min(12, TOGETHER_IMAGE_STEPS),
      output_format: "jpeg",
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Together API ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  const first = data.data?.[0];
  if (!first) throw new Error("Together: no data.data[0]");
  if (first.url) {
    const imgRes = await fetch(first.url);
    if (!imgRes.ok) throw new Error(`Could not fetch Together image URL: ${imgRes.status}`);
    return Buffer.from(await imgRes.arrayBuffer());
  }
  if (first.b64_json) return Buffer.from(first.b64_json, "base64");
  throw new Error("Together: unexpected response shape");
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log(`\n📁 Output dir: ${OUT_DIR}\n`);

  // Importar el módulo TS via tsx (debe correrse con npx tsx)
  const { renderOverlayTitleLayer, OVERLAY_ARROW } = await import(
    path.join(WEB_SRC, "overlay-title-pango.ts")
  );
  const { buildOverlayEnglishTitleLayout } = await import(
    path.join(WEB_SRC, "overlay-title-layout.ts")
  );
  const { SUMI_OVERLAY_HEX_TOP_Y } = await import(
    path.join(WEB_SRC, "overlay-title-layout.ts")
  );
  const { renderSvgToPng } = await import(
    path.join(WEB_SRC, "svg-to-png.ts")
  );

  let passCount = 0;
  let failCount = 0;

  for (const sample of SAMPLES) {
    console.log(`\n🔄 [${sample.id}] ${sample.label}`);
    try {
      // 1) Generar background con Together AI
      process.stdout.write("   → Together AI: generando imagen...");
      const bgBuffer = await generateTogetherImage(sample.prompt);
      console.log(` ✓ (${Math.round(bgBuffer.length / 1024)}KB)`);

      // 2) Construir overlay SVG con las barras del hexagrama
      const sorted = [...sample.lines].sort((a, b) => a.position - b.position);
      const cx = WIDTH / 2;
      const lineGap = 58;
      const baseY = 528;
      const barH = 28;
      const halfW = 244;
      const yinGap = 60;
      const lineEls = [];
      for (let i = 0; i < sorted.length; i++) {
        const line = sorted[i];
        const y = baseY - i * lineGap;
        const yang = line.value === 7 || line.value === 9;
        const gOpen = line.isChanging ? `<g filter="url(#goldGlow)">` : `<g>`;
        const fill = line.isChanging ? "#c9a010" : "#4a2c18";
        const stroke = line.isChanging ? "#fffef8" : "#faf4eb";
        const sw = line.isChanging ? 4.2 : 3.5;
        if (yang) {
          lineEls.push(`${gOpen}<rect x="${cx - halfW}" y="${y}" width="${halfW * 2}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`);
        } else {
          const segW = halfW - yinGap / 2;
          lineEls.push(`${gOpen}<rect x="${cx - halfW}" y="${y}" width="${segW}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>\n<rect x="${cx + yinGap / 2}" y="${y}" width="${segW}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`);
        }
      }

      // 3) Renderizar título con @napi-rs/canvas (el nuevo renderer)
      process.stdout.write("   → Canvas/Skia: renderizando título...");
      const zhText = `${sample.primaryChinese}${sample.transformedChinese ? ` ${OVERLAY_ARROW} ${sample.transformedChinese}` : ""}`;
      const enLayout = buildOverlayEnglishTitleLayout(
        {
          primaryNumber: sample.primaryNumber,
          primaryName: sample.primaryName,
          transformedNumber: sample.transformedNumber,
          transformedName: sample.transformedName,
        },
        { hexTopY: SUMI_OVERLAY_HEX_TOP_Y }
      );

      const titlePng = await renderOverlayTitleLayer({
        width: WIDTH,
        height: HEIGHT,
        lines: [
          {
            text: zhText,
            script: "cjk",
            fontSizePx: 92,
            baselineY: 125,
            fill: "#1c1a16",
            stroke: "rgba(255,248,242,0.94)",
            strokeWidthPx: 5,
          },
          ...enLayout.lines.map((line, idx) => ({
            text: line,
            script: "latin",
            fontSizePx: enLayout.fontSize,
            baselineY: enLayout.ys[idx],
            fill: "#2e2a22",
            stroke: "rgba(255,248,242,0.9)",
            strokeWidthPx: 3,
          })),
        ],
      });
      const titlePngBase64 = titlePng.toString("base64");
      console.log(` ✓ (${Math.round(titlePng.length / 1024)}KB)`);

      // 4) Componer SVG overlay sobre el background
      const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs>
  <filter id="goldGlow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="7" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<g>${lineEls.join("\n")}</g>
<image x="0" y="0" width="${WIDTH}" height="${HEIGHT}" href="data:image/png;base64,${titlePngBase64}"/>
</svg>`;

      process.stdout.write("   → sharp: componiendo resultado final...");
      const overlayPng = await renderSvgToPng(overlaySvg, WIDTH);

      // 5) Componer background + overlay
      const finalPng = await sharp(bgBuffer)
        .resize(WIDTH, HEIGHT, { fit: "cover" })
        .composite([{ input: overlayPng, top: 0, left: 0 }])
        .png({ compressionLevel: 8 })
        .toBuffer();
      console.log(` ✓ (${Math.round(finalPng.length / 1024)}KB)`);

      // 6) Guardar
      const outPath = path.join(OUT_DIR, `${sample.id}.png`);
      await fs.writeFile(outPath, finalPng);
      console.log(`   ✅ Guardado: ${outPath}`);

      // 7) Verificar que hay tinta en la zona del título EN
      const { data, info } = await sharp(finalPng)
        .extract({ left: 0, top: 140, width: WIDTH, height: 95 })
        .raw()
        .toBuffer({ resolveWithObject: true });
      let opaque = 0;
      for (let i = 3; i < data.length; i += info.channels) {
        if (data[i] > 10) opaque++;
      }
      const ratio = opaque / (WIDTH * 95);
      if (ratio > 0.004) {
        console.log(`   🎯 Ink ratio en zona EN: ${(ratio * 100).toFixed(2)}% ✅`);
        passCount++;
      } else {
        console.log(`   ❌ Ink ratio BAJO (${(ratio * 100).toFixed(2)}%) — posible título ausente`);
        failCount++;
      }
    } catch (err) {
      console.error(`   ❌ Error en ${sample.id}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Resultado: ${passCount}/${SAMPLES.length} PASS, ${failCount} FAIL`);
  if (failCount === 0) {
    console.log("✅ Todos los overlays renderizados correctamente con @napi-rs/canvas (Skia)\n");
  } else {
    console.log("⚠️  Hay fallos — revisar los PNG en reports/overlay-pango-e2e-samples/\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Script falló:", err);
  process.exit(1);
});
