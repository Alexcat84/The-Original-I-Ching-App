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

const source = fs.readFileSync(buildGradlePath, "utf8");

// Check if already fully patched
if (!source.includes("classifier = 'sources'") && !source.includes("apply plugin: 'maven-publish'")) {
  console.log("expo-app-integrity Gradle 8 patch already applied.");
  process.exit(0);
}

let updated = source;

// 1. Remove the maven-publish plugin declaration — no publishing block remains,
//    and AGP 8.1+ errors when maven-publish is applied without configuration.
updated = updated.replace("apply plugin: 'maven-publish'\n\n", "");

// 2. Remove the androidSourcesJar task and afterEvaluate publishing block
//    which use Gradle 8-incompatible APIs (classifier=, components.release).
const problematicBlock = `// Creating sources with comments
task androidSourcesJar(type: Jar) {
  classifier = 'sources'
  from android.sourceSets.main.java.srcDirs
}

afterEvaluate {
  publishing {
    publications {
      release(MavenPublication) {
        from components.release
        // Add additional sourcesJar to artifacts
        artifact(androidSourcesJar)
      }
    }
    repositories {
      maven {
        url = mavenLocal().url
      }
    }
  }
}`;

if (updated.includes(problematicBlock)) {
  updated = updated.replace(problematicBlock, "");
}

if (updated === source) {
  console.error("expo-app-integrity: could not apply Gradle 8 patch — target not found");
  process.exit(1);
}

fs.writeFileSync(buildGradlePath, updated, "utf8");
console.log("Applied expo-app-integrity Gradle 8 patch.");
