/**
 * Local release APK: expo prebuild (if needed) + Gradle assembleRelease.
 * Output: apps/mobile/android/app/build/outputs/apk/release/
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

if (!fs.existsSync(androidDir)) {
  console.log("[android] No android/ folder — running expo prebuild…");
  run("npx", ["expo", "prebuild", "--platform", "android"]);
}

const gradleWrapper = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
console.log("[android] Gradle assembleRelease…");
run(gradleWrapper, ["assembleRelease"], { cwd: androidDir });

const apkDir = path.join(androidDir, "app", "build", "outputs", "apk", "release");
console.log(`\n[android] Done. APK directory:\n  ${apkDir}`);
