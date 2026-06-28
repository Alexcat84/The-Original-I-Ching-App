import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

/**
 * Config para el test e2e de overlay con Together AI.
 * Usa el pipeline de producción real:
 *   Together AI → background + buildSumiHexagramOverlaySvgDataUrl (@napi-rs/canvas)
 *   → renderSvgToPng (resvg-js) → sharp composite → PNG guardado en reports/.
 *
 * Requiere TOGETHER_API_KEY en .env (raíz del repo).
 * Correr: npm run gen:overlay-e2e-samples --prefix apps/web
 *
 * Deliberadamente fuera del vitest.config.ts por defecto — no queremos
 * llamadas a Together en cada `npm test`.
 */

// Carga el .env de la raíz del repo (dos niveles arriba de apps/web)
const repoRoot = path.resolve(__dirname, "..", "..");
const rootEnv = loadEnv("", repoRoot, "");

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/lib/__tests__/overlay-title-pango.e2e-samples.test.ts"],
    testTimeout: 300_000, // 5 min total
    // Inyecta variables del .env raíz al proceso de test
    env: {
      TOGETHER_API_KEY: rootEnv.TOGETHER_API_KEY ?? "",
      TOGETHER_IMAGE_MODEL: rootEnv.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell",
      TOGETHER_IMAGE_STEPS: rootEnv.TOGETHER_IMAGE_STEPS ?? "12",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
