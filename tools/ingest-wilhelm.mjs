/**
 * Re-ingest Wilhelm / Baynes oracle text from the University of Parma mirror.
 *
 * Updates only oracle fields in scripts/iching_wilhelm_translation.mjs:
 *   wilhelm_judgment, wilhelm_image, wilhelm_lines, yong_jiu, yong_liu
 * Structural metadata (trigrams, binary, pinyin, symbolic commentary) is preserved.
 *
 * Source: http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html
 *
 * Run: npm run ingest:wilhelm
 * Flags: --live (refetch Parma HTML)
 */

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseAllParmaWilhelm } from "../scripts/lib/hexagram-fidelity-parma.mjs";
import { loadParmaHtml } from "../scripts/lib/hexagram-fidelity-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const finalOut = join(root, "scripts", "iching_wilhelm_translation.mjs");

const live = process.argv.includes("--live");

const wilhelmModule = await import(pathToFileURL(finalOut).href);
const existing = structuredClone(wilhelmModule.default);

function cleanOracleText(s) {
  return String(s ?? "")
    .replace(/\s+\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function mergeOracleField(existing, incoming) {
  const next = cleanOracleText(incoming);
  const prev = cleanOracleText(existing);
  if (!next) return prev;
  return next;
}

async function main() {
  const html = await loadParmaHtml({ live });
  const parsed = parseAllParmaWilhelm(html);
  const warnings = [];

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const row = existing[key];
    const gold = parsed[n];
    if (!row) throw new Error(`Existing Wilhelm dataset missing hex ${n}`);
    if (!gold) throw new Error(`Parma parser missing hex ${n}`);

    const prevJ = row.wilhelm_judgment?.text ?? "";
    const prevI = row.wilhelm_image?.text ?? "";
    row.wilhelm_judgment = {
      text: mergeOracleField(prevJ, gold.judgment),
    };
    row.wilhelm_image = { text: mergeOracleField(prevI, gold.image) };
    if (!gold.judgment?.trim() && prevJ) warnings.push({ n, field: "judgment", kept: "existing" });
    if (!gold.image?.trim() && prevI) warnings.push({ n, field: "image", kept: "existing" });

    const prevLines = row.wilhelm_lines ?? {};
    const lines = {};
    for (let pos = 1; pos <= 6; pos++) {
      const next = cleanOracleText(gold.lines[pos] ?? "");
      lines[String(pos)] = { text: next };
      if (!next && (prevLines[String(pos)]?.text ?? "").trim()) {
        warnings.push({ n, field: `line${pos}`, note: "cleared (absent in Parma)" });
      }
    }
    row.wilhelm_lines = lines;

    if (gold.yongJiu) row.yong_jiu = cleanOracleText(gold.yongJiu);
    if (gold.yongLiu) row.yong_liu = cleanOracleText(gold.yongLiu);

    const filled = Object.values(lines).filter((l) => l.text.length > 0).length;
    console.log(
      `  Hex ${String(n).padStart(2, "0")}: J=${row.wilhelm_judgment.text.length}ch lines=${filled}/6`,
    );
  }

  // Spot-check hex 18 (Parma parser regression gate).
  const l1 = existing["18"].wilhelm_lines["1"].text;
  const l2 = existing["18"].wilhelm_lines["2"].text;
  if (!/father/i.test(l1) || !/mother/i.test(l2)) {
    throw new Error(
      `Hex 18 line order failed sanity check (L1=${l1.slice(0, 40)} L2=${l2.slice(0, 40)})`,
    );
  }

  const body =
    "// Oracle text refreshed by tools/ingest-wilhelm.mjs from Parma mirror.\n" +
    "// Source: http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html\n" +
    "// Structural metadata retained from prior transcription; judgment/image/lines from Parma.\n\n" +
    "export default " +
    JSON.stringify(existing, null, 2) +
    ";\n";
  await writeFile(finalOut, body, "utf8");
  console.log("\nWrote", finalOut);
  console.log("Hex 18 spot-check: L1=father, L2=mother OK");
  if (warnings.length > 0) {
    console.warn(`\n${warnings.length} fields kept from prior bundle (Parma parse empty):`);
    for (const w of warnings.slice(0, 15)) console.warn("  ", w);
    if (warnings.length > 15) console.warn(`  … and ${warnings.length - 15} more`);
  }
}

await main();
