#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseWilhelmAppendixTxtFile,
} from "./lib/wilhelm-appendix-txt.mjs";
import {
  WILHELM_APPENDIX_DATASET_DIR,
  WILHELM_APPENDIX_PARSED_JSON,
  WILHELM_APPENDIX_TXT_PATH,
} from "./lib/wilhelm-dataset-paths.mjs";

const OUT_JSON = WILHELM_APPENDIX_PARSED_JSON;

async function main() {
  const parsed = parseWilhelmAppendixTxtFile();
  const out = {
    source: WILHELM_APPENDIX_TXT_PATH,
    parsedAt: new Date().toISOString(),
    ...parsed,
  };
  await mkdir(WILHELM_APPENDIX_DATASET_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_JSON}`);
  console.log(`Houses: ${parsed.houses.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
