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
      // RLS integration suite needs a live Supabase stack — runs only via
      // vitest.rls.config.ts / `npm run test:rls` (own CI job), never here.
      "src/**/*.rls.test.ts",
      "src/lib/__tests__/overlay-title-pango.exhaustive.test.ts",
      "src/lib/__tests__/overlay-title-pango.e2e-samples.test.ts",
      "src/lib/__tests__/overlay-title-pango.random-samples.test.ts",
      "src/lib/__tests__/overlay-title-pango.long-name-samples.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
