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

const source = fs.readFileSync(buildGradlePath, "utf8");

if (!source.includes("classifier = 'sources'")) {
  console.log("expo-app-integrity Gradle 8 patch already applied.");
  process.exit(0);
}

if (!source.includes(problematicBlock)) {
  console.error("Could not find target block in expo-app-integrity build.gradle");
  process.exit(1);
}

const updated = source.replace(problematicBlock, "");
fs.writeFileSync(buildGradlePath, updated, "utf8");
console.log("Applied expo-app-integrity Gradle 8 patch.");
