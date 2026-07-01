#!/usr/bin/env node
/**
 * Generate empty Ten Wings scaffold for Wilhelm DE comments (Drittes Buch parse pending).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_DE_COMMENTS_DIR,
  WILHELM_DE_COMMENTS_PARSED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function emptyFields(n) {
  /** @type {Record<string, string>} */
  const f = { hex: String(n) };
  f.commentary_decision = "";
  f.commentary_image = "";
  f.wen_yen = "";
  f.wen_yen_note = "";
  f.sequence = "";
  f.misc_notes = "";
  f.ruler_note = "";
  f.yong_b_comentario = "";
  for (let p = 1; p <= 6; p++) {
    f[`L${p}_b_comentario`] = "";
  }
  return f;
}

async function main() {
  const hexagrams = {};
  for (let n = 1; n <= 64; n++) {
    hexagrams[String(n)] = { fields: emptyFields(n) };
  }
  const payload = {
    source: "stub-pending-drittes-buch-parse",
    parsedAt: new Date().toISOString(),
    hexagrams,
  };
  await mkdir(WILHELM_DE_COMMENTS_DIR, { recursive: true });
  await writeFile(WILHELM_DE_COMMENTS_PARSED, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${WILHELM_DE_COMMENTS_PARSED} (stub)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
