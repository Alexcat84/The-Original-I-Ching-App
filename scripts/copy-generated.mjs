import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcGen = join(root, "packages", "iching-data", "src", "generated");
const distGen = join(root, "packages", "iching-data", "dist", "generated");
if (!existsSync(srcGen)) {
  console.error("Missing", srcGen, "— run npm run build:data in iching-data first");
  process.exit(1);
}
cpSync(srcGen, distGen, { recursive: true });
console.log("Copied generated hexagram JSON to dist");
