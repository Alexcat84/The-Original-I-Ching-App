/**
 * Runs `build:data` only when tools/datasets is present locally.
 * On Vercel (and any CI where tools/ is not checked in) the step is
 * skipped — the generated JSONs are already committed to
 * packages/iching-data/src/generated/ and do not need to be rebuilt.
 */
import { existsSync } from "fs";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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
