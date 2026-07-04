/**
 * Runs `build:data` only in a local dev environment where tools/datasets is
 * present. Skipped unconditionally on CI (GitHub Actions sets CI=true) and
 * Vercel (sets VERCEL=1) — the generated JSONs are already committed to
 * packages/iching-data/src/generated/ and do not need to be rebuilt there.
 *
 * Why env-var check instead of filesystem check: actions/checkout does not
 * run git clean, so untracked files from previous runner workspaces can
 * survive across runs even after tools/ was removed from git.
 */
import { existsSync } from "fs";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Skip unconditionally on CI/Vercel — generated files are already committed.
// We cannot rely on filesystem detection here: actions/checkout leaves previous
// workspace files in place, so tools/datasets could appear present on a runner
// that had it from an older commit.
if (process.env.CI || process.env.VERCEL) {
  console.log(
    "[iching-data] build:data skipped — CI/Vercel environment; using committed generated files.",
  );
  process.exit(0);
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const toolsDatasets = join(repoRoot, "tools", "datasets");

if (existsSync(toolsDatasets)) {
  // Run each build script directly via the current node binary — no shell,
  // no npm.cmd, no DEP0190. Arguments are hardcoded constants.
  const buildScripts = [
    "build-hexagrams.mjs",
    "build-hexagram-commentary.mjs",
    "build-trigrams.mjs",
    "build-mutation-rules.mjs",
  ];
  for (const script of buildScripts) {
    const result = spawnSync(process.execPath, [join(repoRoot, "scripts", script)], {
      stdio: "inherit",
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
} else {
  console.log(
    "[iching-data] build:data skipped — tools/datasets not available; using committed generated files.",
  );
}
