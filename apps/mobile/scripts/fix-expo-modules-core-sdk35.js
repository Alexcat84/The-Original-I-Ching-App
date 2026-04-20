const fs = require("node:fs");
const path = require("node:path");

const packageJsonPath = require.resolve("expo-modules-core/package.json", {
  paths: [process.cwd()],
});

const permissionsServicePath = path.join(
  path.dirname(packageJsonPath),
  "android",
  "src",
  "main",
  "java",
  "expo",
  "modules",
  "adapters",
  "react",
  "permissions",
  "PermissionsService.kt"
);

const originalLine = "return requestedPermissions.contains(permission)";
const patchedLine = "return requestedPermissions?.contains(permission) == true";

const source = fs.readFileSync(permissionsServicePath, "utf8");

if (source.includes(patchedLine)) {
  console.log("expo-modules-core SDK35 patch already applied.");
  process.exit(0);
}

if (!source.includes(originalLine)) {
  console.error("Could not find target line in PermissionsService.kt");
  process.exit(1);
}

const updated = source.replace(originalLine, patchedLine);
fs.writeFileSync(permissionsServicePath, updated, "utf8");
console.log("Applied expo-modules-core SDK35 patch.");
