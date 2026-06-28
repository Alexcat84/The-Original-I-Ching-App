import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Separate config for the full 64x63 (Wilhelm + Legge) overlay-title pair grid —
 * deliberately NOT part of the default `vitest run` (apps/web/package.json "test"
 * script), which would make every local `npm test` take minutes instead of seconds.
 *
 * This is wired into .github/workflows/ci.yml as its OWN explicit step (see
 * "Overlay title exhaustive render check"), not gated behind an opt-in env var that
 * could silently never run — that exact gap (a rendering test gated behind a flag
 * nobody set in CI) is what let the original Khwăn/resvg regression ship undetected.
 * See docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/lib/__tests__/overlay-title-pango.exhaustive.test.ts"],
    testTimeout: 600_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
