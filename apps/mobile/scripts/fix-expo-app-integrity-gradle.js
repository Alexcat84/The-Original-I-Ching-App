const fs = require("node:fs");
const path = require("node:path");

const packageJsonPath = require.resolve("expo-app-integrity/package.json", {
  paths: [process.cwd()],
});

const buildGradlePath = path.join(
  path.dirname(packageJsonPath),
  "android",
  "build.gradle"
);

// Gradle 8 / AGP 8-compatible replacement.
// The original build.gradle applied ExpoModulesCorePlugin inside buildscript {}
// (wrong lifecycle), used the deprecated `classifier =` API, and tried
// `from components.release` without first configuring singleVariant — all
// fatal with AGP 8.2. Rewritten to follow the same pattern as expo-media-library.
const cleanBuildGradle = `apply plugin: 'com.android.library'

group = 'expo.modules.integrity'
version = '0.1.0'

def expoModulesCorePlugin = new File(project(":expo-modules-core").projectDir.absolutePath, "ExpoModulesCorePlugin.gradle")
apply from: expoModulesCorePlugin
applyKotlinExpoModulesCorePlugin()
useDefaultAndroidSdkVersions()

android {
  defaultConfig {
    versionCode 1
    versionName "0.1.0"
  }
}

repositories {
  mavenCentral()
}

dependencies {
  implementation project(':expo-modules-core')
  implementation "com.google.android.play:integrity:1.1.0"
}
`;

const current = fs.readFileSync(buildGradlePath, "utf8");

if (current === cleanBuildGradle) {
  console.log("expo-app-integrity Gradle 8 patch already applied.");
  process.exit(0);
}

fs.writeFileSync(buildGradlePath, cleanBuildGradle, "utf8");
console.log("Applied expo-app-integrity Gradle 8 patch (full rewrite).");
