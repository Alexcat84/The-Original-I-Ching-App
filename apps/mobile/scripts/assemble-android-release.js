/**
 * Local release APK:
 * 1. `expo prebuild --platform android` — aplica `app.config.js` a `android/` (versionName, versionCode,
 *    plugins, manifiesto embebido) para que coincida con lo que verá `Constants.expoConfig` en el JS.
 * 2. Gradle `assembleRelease`.
 *
 * Output: apps/mobile/android/app/build/outputs/apk/release/
 *
 * `--no-install`: no reinstala node_modules ni CocoaPods (el monorepo ya tiene deps).
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const mobileRoot = path.resolve(__dirname, "..");
const androidDir = path.join(mobileRoot, "android");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    cwd: options.cwd ?? mobileRoot,
    env: process.env,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("[android] expo prebuild — sync app.config.js → android/ (embedded config + Gradle)…");
run("npx", ["expo", "prebuild", "--platform", "android", "--no-install"]);

if (!fs.existsSync(androidDir)) {
  console.error("[android] android/ missing after prebuild — abort.");
  process.exit(1);
}

const gradleWrapper = process.platform === "win32" ? ".\\gradlew.bat" : "./gradlew";
console.log("[android] Gradle assembleRelease…");
run(gradleWrapper, ["assembleRelease"], { cwd: androidDir });

const apkDir = path.join(androidDir, "app", "build", "outputs", "apk", "release");
console.log(`\n[android] Done. APK directory:\n  ${apkDir}`);
