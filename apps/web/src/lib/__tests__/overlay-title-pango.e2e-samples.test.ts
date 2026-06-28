/**
 * QA code: TS-WEB-OVR-006 overlay-title-pango-e2e-samples · v1.0.0
 * Area: apps/web/src/lib/overlay-title-pango, sumi-hexagram-art (overlay variant)
 * Family: WEB-OVR
 *
 * Genera 4 imágenes de muestra usando el pipeline de producción real:
 *   1. Together AI (FLUX.1-schnell) → background JPEG
 *   2. buildSumiHexagramOverlaySvgDataUrl() → overlay SVG con barras + título
 *      (internamente usa renderOverlayTitleLayer() con @napi-rs/canvas — el renderer nuevo)
 *   3. renderSvgToPng() → rasteriza el overlay SVG via resvg-js
 *   4. sharp composite → imagen final PNG
 *
 * Guarda resultados en reports/overlay-pango-e2e-samples/.
 * Se salta automáticamente si no hay TOGETHER_API_KEY en el entorno.
 *
 * Correr:
 *   npm run gen:overlay-e2e-samples --prefix apps/web
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { buildSumiHexagramOverlaySvgDataUrl, type SumiLineInput } from "../sumi-hexagram-art";
import { renderSvgToPng } from "../svg-to-png";

// ── Resolución de env ──────────────────────────────────────────────────────────
// Vitest carga .env via dotenv; también intentamos raíz del repo.
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY ?? "";
const TOGETHER_MODEL =
  process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
const TOGETHER_STEPS = Math.min(12, Number(process.env.TOGETHER_IMAGE_STEPS ?? "12"));
const WIDTH = 1344;
const HEIGHT = 768;

const OUT_DIR = path.resolve(process.cwd(), "..", "..", "reports", "overlay-pango-e2e-samples");

// ── Fixtures de las 4 muestras ─────────────────────────────────────────────────
const SAMPLES: Array<{
  id: string;
  label: string;
  primaryNumber: number;
  primaryName: string;
  primaryChinese: string;
  transformedNumber?: number;
  transformedName?: string;
  transformedChinese?: string;
  lines: SumiLineInput[];
  prompt: string;
}> = [
  {
    id: "khwan-to-khien",
    label: "Legge #2 Khwăn → #1 Khien (caso que disparó la regresión resvg)",
    primaryNumber: 2,
    primaryName: "Khwăn",
    primaryChinese: "坤",
    transformedNumber: 1,
    transformedName: "Khien",
    transformedChinese: "乾",
    lines: [
      { position: 1, value: 8, isChanging: false },
      { position: 2, value: 8, isChanging: false },
      { position: 3, value: 8, isChanging: false },
      { position: 4, value: 8, isChanging: false },
      { position: 5, value: 8, isChanging: false },
      { position: 6, value: 8, isChanging: false },
    ],
    prompt:
      "ancient Chinese landscape, misty mountain peaks reflected in still water, ink-wash painting style, rich black brushwork, soft grey mist, tranquil atmosphere, watercolor wash, Song dynasty aesthetic, no text, no calligraphy, no symbols",
  },
  {
    id: "hexagram3-to-8",
    label: "Legge #3 Chun → #8 Pih (nombre con diacríticos, caso histórico)",
    primaryNumber: 3,
    primaryName: "Chun",
    primaryChinese: "屯",
    transformedNumber: 8,
    transformedName: "Pih",
    transformedChinese: "比",
    lines: [
      { position: 1, value: 7, isChanging: false },
      { position: 2, value: 8, isChanging: false },
      { position: 3, value: 8, isChanging: false },
      { position: 4, value: 7, isChanging: false },
      { position: 5, value: 8, isChanging: false },
      { position: 6, value: 7, isChanging: false },
    ],
    prompt:
      "spring rain on ancient forest, new sprouts emerging from fertile earth, misty bamboo grove, delicate ink brushwork, watercolor wash, morning light, Song dynasty aesthetic, no text, no calligraphy, no symbols",
  },
  {
    id: "hexagram43-to-44",
    label: "Legge #43 Kwăi → #44 Kow (CJK: 夬→姤, caracteres que faltaban en font)",
    primaryNumber: 43,
    primaryName: "Kwăi",
    primaryChinese: "夬",
    transformedNumber: 44,
    transformedName: "Kow",
    transformedChinese: "姤",
    lines: [
      { position: 1, value: 7, isChanging: false },
      { position: 2, value: 7, isChanging: false },
      { position: 3, value: 7, isChanging: false },
      { position: 4, value: 7, isChanging: false },
      { position: 5, value: 7, isChanging: false },
      { position: 6, value: 8, isChanging: false },
    ],
    prompt:
      "stormy sky clearing over ancient city walls, powerful wind dispersing dark clouds, dramatic ink-wash brushwork, strong contrast, dynamic atmosphere, Tang dynasty aesthetic, no text, no calligraphy, no symbols",
  },
  {
    id: "wilhelm-qian-with-changing",
    label: "Wilhelm #1 Ch'ien con líneas cambiantes (overlay dorado)",
    primaryNumber: 1,
    primaryName: "Ch'ien",
    primaryChinese: "乾",
    transformedNumber: 2,
    transformedName: "K'un",
    transformedChinese: "坤",
    lines: [
      { position: 1, value: 9, isChanging: true },
      { position: 2, value: 9, isChanging: false },
      { position: 3, value: 9, isChanging: true },
      { position: 4, value: 9, isChanging: false },
      { position: 5, value: 9, isChanging: true },
      { position: 6, value: 9, isChanging: false },
    ],
    prompt:
      "golden sunrise over vast plains, celestial light rays breaking through clouds, majestic ink-wash painting, traditional Chinese landscape, Zhou dynasty aesthetic, no text, no calligraphy, no symbols",
  },
];

// ── Helper: Together AI → Buffer ───────────────────────────────────────────────
async function fetchTogetherBackground(prompt: string): Promise<Buffer> {
  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TOGETHER_MODEL,
      prompt: prompt.slice(0, 2800),
      width: WIDTH,
      height: HEIGHT,
      n: 1,
      steps: TOGETHER_STEPS,
      output_format: "jpeg",
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Together ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
  };
  const first = data.data?.[0];
  if (!first) throw new Error("Together: sin data.data[0]");
  if (first.url) {
    const imgRes = await fetch(first.url);
    if (!imgRes.ok) throw new Error(`Fetch imagen Together: ${imgRes.status}`);
    return Buffer.from(await imgRes.arrayBuffer());
  }
  if (first.b64_json) return Buffer.from(first.b64_json, "base64");
  throw new Error("Together: formato de respuesta inesperado");
}

// ── Suite ──────────────────────────────────────────────────────────────────────
describe("overlay e2e con Together AI — pipeline de producción completo", () => {
  beforeAll(async () => {
    await fs.mkdir(OUT_DIR, { recursive: true });
  });

  for (const sample of SAMPLES) {
    it(
      sample.label,
      async () => {
        if (!TOGETHER_API_KEY) {
          console.log(`[SKIP] Sin TOGETHER_API_KEY — ${sample.id}`);
          return;
        }

        // ── 1. Background via Together AI ────────────────────────────────────
        console.log(`[${sample.id}] → Together AI...`);
        const bgBuffer = await fetchTogetherBackground(sample.prompt);
        console.log(`[${sample.id}] bg: ${Math.round(bgBuffer.length / 1024)}KB`);

        // ── 2. Overlay SVG via pipeline de producción real ───────────────────
        // buildSumiHexagramOverlaySvgDataUrl() llama internamente a
        // renderOverlayTitleLayer() con @napi-rs/canvas — mismo código que prod.
        console.log(`[${sample.id}] → buildSumiHexagramOverlaySvgDataUrl...`);
        const overlaySvgDataUrl = await buildSumiHexagramOverlaySvgDataUrl({
          lines: sample.lines,
          primaryNumber: sample.primaryNumber,
          primaryName: sample.primaryName,
          primaryChinese: sample.primaryChinese,
          transformedNumber: sample.transformedNumber ?? null,
          transformedName: sample.transformedName ?? null,
          transformedChinese: sample.transformedChinese ?? null,
          outputWidth: WIDTH,
          outputHeight: HEIGHT,
        });

        // ── 3. Rasterizar overlay SVG via resvg-js (mismo que prod) ─────────
        const svgStr = decodeURIComponent(
          overlaySvgDataUrl.slice("data:image/svg+xml;charset=utf-8,".length),
        );
        const overlayPng = await renderSvgToPng(svgStr, WIDTH);
        console.log(
          `[${sample.id}] overlay PNG: ${Math.round(overlayPng.length / 1024)}KB`,
        );

        // ── 4. Componer: background + overlay ────────────────────────────────
        const finalPng = await sharp(bgBuffer)
          .resize(WIDTH, HEIGHT, { fit: "cover" })
          .composite([{ input: overlayPng, top: 0, left: 0 }])
          .png({ compressionLevel: 8 })
          .toBuffer();

        // ── 5. Guardar ───────────────────────────────────────────────────────
        const outPath = path.join(OUT_DIR, `${sample.id}.png`);
        await fs.writeFile(outPath, finalPng);
        console.log(`[${sample.id}] ✅ guardado: ${outPath}`);

        // ── 6. Verificar que el título renderizó (tinta en zona EN) ──────────
        // El overlay PNG embebe el título como data:image/png;base64,
        // lo extraemos del SVG para verificar el ink ratio directamente.
        const match = svgStr.match(/href="data:image\/png;base64,([^"]+)"/);
        expect(match, "SVG debe contener imagen base64 del título").toBeTruthy();

        const titlePng = Buffer.from(match![1]!, "base64");
        const { data, info } = await sharp(titlePng)
          .extract({ left: 0, top: 140, width: WIDTH, height: 95 })
          .raw()
          .toBuffer({ resolveWithObject: true });

        let opaque = 0;
        for (let i = 3; i < data.length; i += info.channels) {
          if ((data[i] as number) > 10) opaque++;
        }
        const inkRatio = opaque / (WIDTH * 95);
        console.log(
          `[${sample.id}] ink ratio zona EN: ${(inkRatio * 100).toFixed(2)}%`,
        );
        expect(
          inkRatio,
          `Título ausente o vacío en zona EN para ${sample.label}`,
        ).toBeGreaterThan(0.004);
      },
      120_000, // 2 min por imagen (Together puede tardar)
    );
  }
});
