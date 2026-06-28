import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const repoRoot = path.resolve(__dirname, "..", "..");
const rootEnv = loadEnv("", repoRoot, "");

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/lib/__tests__/overlay-title-pango.random-samples.test.ts"],
    testTimeout: 180_000,
    env: {
      TOGETHER_API_KEY: rootEnv.TOGETHER_API_KEY ?? "",
      TOGETHER_IMAGE_MODEL: rootEnv.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell",
      TOGETHER_IMAGE_STEPS: rootEnv.TOGETHER_IMAGE_STEPS ?? "12",
      OVERLAY_RANDOM_COUNT: rootEnv.OVERLAY_RANDOM_COUNT ?? "20",
      OVERLAY_RANDOM_SEED: rootEnv.OVERLAY_RANDOM_SEED ?? "20260628",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
