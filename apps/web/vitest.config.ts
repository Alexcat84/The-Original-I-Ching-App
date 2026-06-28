import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Full 64x63 pair grid (~4 min) — run separately via vitest.exhaustive.config.ts /
    // `npm run test:overlay-exhaustive`, wired as its own CI step, not the default suite.
    exclude: [
      "**/node_modules/**",
      "src/lib/__tests__/overlay-title-pango.exhaustive.test.ts",
      "src/lib/__tests__/overlay-title-pango.e2e-samples.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
