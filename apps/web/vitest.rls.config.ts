import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * RLS integration tests ONLY (see docs/auditorias/20260716-GATE-SEC-01).
 * These run against a real local Supabase stack (supabase start + db reset),
 * so they are deliberately excluded from the fast unit-test pass: they live
 * behind their own file suffix (*.rls.test.ts) and this dedicated config,
 * following the vitest.exhaustive.config.ts pattern.
 *
 * Run locally:
 *   supabase start && supabase db reset
 *   eval "$(supabase status -o env | sed 's/^/export /')"   # ANON_KEY / SERVICE_ROLE_KEY
 *   npm run test:rls
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["src/__tests__/rls/**/*.rls.test.ts"],
    environment: "node",
    // A cold local stack + auth admin calls are slow; generous budgets.
    testTimeout: 60_000,
    hookTimeout: 120_000,
    // No unit-test setup files: these tests must not inherit mocks.
    setupFiles: [],
    // The suite mutates shared DB state (two auth users); keep it serial.
    fileParallelism: false,
  },
});
