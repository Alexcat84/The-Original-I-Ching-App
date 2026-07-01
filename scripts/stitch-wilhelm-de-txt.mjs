#!/usr/bin/env node

/**
 * QA code: VF-FID-W-010 stitch-wilhelm-de-txt · v1.0.0
 * Area: scripts/stitch-wilhelm-de-txt.mjs
 * Family: FID-W
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  WILHELM_DE_PASS_DIRS,
  WILHELM_DE_STITCHED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

/** @param {string} dir */
async function stitchDir(dir) {
  const files = (await readdir(dir))
    .filter((f) => f.endsWith(".txt"))
    .sort((a, b) => Number(a.replace(".txt", "")) - Number(b.replace(".txt", "")));

  const parts = [];
  for (const f of files) {
    const pageNum = Number(f.replace(".txt", ""));
    const body = await readFile(join(dir, f), "utf8");
    parts.push(`--- page ${pageNum} ---\n${body}`);
  }
  return { pageCount: files.length, text: parts.join("\n\n") };
}

async function main() {
  const jobs = [
    ["bookOnePass01", WILHELM_DE_PASS_DIRS.bookOnePass01, WILHELM_DE_STITCHED.bookOnePass01],
    ["bookOnePass03", WILHELM_DE_PASS_DIRS.bookOnePass03, WILHELM_DE_STITCHED.bookOnePass03],
    ["bookThreePass02", WILHELM_DE_PASS_DIRS.bookThreePass02, WILHELM_DE_STITCHED.bookThreePass02],
    ["bookThreePass04", WILHELM_DE_PASS_DIRS.bookThreePass04, WILHELM_DE_STITCHED.bookThreePass04],
  ];

  for (const [label, srcDir, outPath] of jobs) {
    const { pageCount, text } = await stitchDir(srcDir);
    await mkdir(join(outPath, ".."), { recursive: true });
    await writeFile(outPath, text, "utf8");
    console.log(`${label}: ${pageCount} pages → ${outPath} (${text.length} chars)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
