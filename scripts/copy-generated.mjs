import { rmSync, cpSync, existsSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcGen = join(root, "packages", "iching-data", "src", "generated");
const distGen = join(root, "packages", "iching-data", "dist", "generated");
if (!existsSync(srcGen)) {
  console.error("Missing", srcGen, "— run npm run build:data in iching-data first");
  process.exit(1);
}
if (existsSync(distGen)) {
  rmSync(distGen, { recursive: true, force: true });
}
cpSync(srcGen, distGen, { recursive: true });
console.log("Copied generated hexagram JSON to dist");
