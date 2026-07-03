#!/usr/bin/env node
/**
 * QA code: VF-FID-W-037 sync-wilhelm-de-comments-meta-from-erstes · v1.0.0
 * Area: scripts/sync-wilhelm-de-comments-meta-from-erstes.mjs
 * Family: FID-W
 *
 * Backfill comments-layer chinese_roman from Erstes Buch merged maestro (64 hex).
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tsvEscapeCell } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import { resolveCommentsChineseRoman } from "./lib/wilhelm-de-comments-erstes-meta.mjs";
import { WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function parseArgs(argv) {
  return { promote: argv.includes("--promote") };
}

/**
 * @param {string} body
 * @param {number} hex
 * @param {string} roman
 */
function patchPilotTsvChineseRoman(body, hex, roman) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const header = lines[0]?.split("\t") ?? [];
  const iCampo = header.indexOf("campo");
  const iPdf = header.indexOf("contenido_pdf");
  if (iCampo < 0 || iPdf < 0) throw new Error("Invalid pilot TSV header");

  let changed = false;
  const out = lines.map((line, idx) => {
    if (idx === 0) return line;
    const parts = line.split("\t");
    const campo = parts[iCampo]?.trim();
    if (campo === "chinese_roman") {
      const prev = parts[iPdf] ?? "";
      const next = tsvEscapeCell(roman);
      if (prev !== next) changed = true;
      parts[iPdf] = next;
      if (header.includes("au_estado")) {
        const iEstado = header.indexOf("au_estado");
        if (iEstado >= 0 && String(parts[iEstado] ?? "").trim() === "pendiente") {
          parts[iEstado] = "cerrado";
        }
      }
      return parts.join("\t");
    }
    if (campo === "hex_fin") return line;
    return line;
  });

  return { body: `${out.join("\n")}\n`, changed };
}

async function main() {
  const { promote } = parseArgs(process.argv);
  const names = (await readdir(WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR)).filter((n) =>
    /^wilhelm-de-comments-hex-\d+-pilot-au\.tsv$/.test(n),
  );

  /** @type {Array<{ hex: number; roman: string; changed: boolean }>} */
  const updates = [];

  for (const name of names.sort()) {
    const hex = Number(name.match(/hex-(\d+)-/)?.[1]);
    if (!hex || hex < 1 || hex > 64) continue;
    const path = join(WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR, name);
    const roman = resolveCommentsChineseRoman(hex, "");
    if (!roman) {
      throw new Error(`book-one missing chinese_roman for hex ${hex}`);
    }
    const raw = await readFile(path, "utf8");
    const { body, changed } = patchPilotTsvChineseRoman(raw, hex, roman);
    if (changed) await writeFile(path, body, "utf8");
    updates.push({ hex, roman, changed });
  }

  const changedCount = updates.filter((u) => u.changed).length;
  console.log(`Pilot TSV chinese_roman sync: ${changedCount}/${updates.length} updated`);

  if (promote) {
    const { spawnSync } = await import("node:child_process");
    for (const cmd of [
      ["npm", ["run", "apply:wilhelm-de-comments-au-gold"]],
      ["npm", ["run", "validate:wilhelm-de-comments-au-gold"]],
      ["npm", ["run", "promote:wilhelm-de-comments-au-to-merged"]],
      ["node", ["scripts/build-hexagram-commentary.mjs"]],
      ["npm", ["run", "verify:wilhelm-de-en-structure-parity"]],
    ]) {
      const r = spawnSync(cmd[0], cmd[1], { cwd: ROOT, encoding: "utf8", shell: true, stdio: "inherit" });
      if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
