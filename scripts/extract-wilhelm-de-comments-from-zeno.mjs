#!/usr/bin/env node

/**
 * QA code: VF-FID-W-029 extract-wilhelm-de-comments-from-zeno · v1.0.0
 * Area: scripts/extract-wilhelm-de-comments-from-zeno.mjs
 * Family: FID-W
 *
 * Probe zeno.org for Drittes Buch (Ten Wings). As of 2026-06, Zeno hosts
 * Erstes Buch + Zweites Buch only — not Die Kommentare per hex.
 * Writes an extraction plan report; no OCR fallback.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchZenoHtml,
  discoverRelativeLinks,
  ZENO_WILHELM_ROOT,
  ZENO_ZWEITES_BUCH,
} from "./lib/wilhelm-de-zeno-html.mjs";
import { discoverZenoHexPaths } from "./lib/wilhelm-de-zeno-parse.mjs";
import {
  WILHELM_DE_COMMENTS_DIR,
  WILHELM_DE_ZENO_MATERIAL_JSON,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

/**
 * @param {string} html
 */
function findDrittesLinks(html) {
  return [
    ...new Set(
      [...html.matchAll(/href="(\/Philosophie\/M\/Anonym\/I\+Ging[^"]+)"/g)]
        .map((m) => m[1])
        .filter((p) => /Drittes|Kommentar|drittes|DRITTES/i.test(decodeURIComponent(p))),
    ),
  ];
}

async function main() {
  const rootHtml = await fetchZenoHtml(ZENO_WILHELM_ROOT);
  const rootDrittes = findDrittesLinks(rootHtml);

  const hexPaths = await discoverZenoHexPaths();
  const hex1Html = await fetchZenoHtml(hexPaths[0]);
  const hex1Subs = discoverRelativeLinks(hex1Html, `${hexPaths[0]}/`);

  const zweitesHtml = await fetchZenoHtml(ZENO_ZWEITES_BUCH);
  const zweitesLinks = discoverRelativeLinks(zweitesHtml, `${ZENO_ZWEITES_BUCH}/`);

  const plan = {
    probedAt: new Date().toISOString(),
    zenoAvailability: {
      erstesBuch64Hex: { available: true, hexCount: hexPaths.length },
      zweitesBuchMaterial: { available: true, sectionCount: zweitesLinks.length, sections: zweitesLinks },
      drittesBuchTenWings: {
        available: false,
        rootLinks: rootDrittes,
        hexSubpages: hex1Subs,
        note: "zeno.org does not publish Drittes Buch / Die Kommentare (37-field Ten Wings layer)",
      },
    },
    extractionPlan: [
      {
        phase: 1,
        layer: "book-one",
        source: "zeno.org Erstes Buch",
        status: "done",
        command: "npm run extract:wilhelm-de-from-zeno:all && npm run promote:wilhelm-de-zeno-to-merged",
      },
      {
        phase: 2,
        layer: "comments-ten-wings",
        source: "Diederichs 1924 PDF Drittes Buch (print primary — not on Zeno)",
        status: "blocked-on-zeno",
        nextSteps: [
          "Build PDF text extract → wilhelm-de-64hex-comments-zeno-extract-latest.json (misnamed until Zeno adds Drittes Buch)",
          "Field split with DE markers (Kommentar zur Entscheidung, Kommentar zu den Bildern, Wen Yen)",
          "promote-wilhelm-de-comments-to-merged (mirror book-one promote)",
          "AU 64×37 vs physical book before runtimeIngest",
        ],
        blockedReason: "No Drittes Buch URLs on zeno.org",
      },
      {
        phase: 3,
        layer: "zweites-buch-material",
        source: "zeno.org Zweites Buch",
        status: "partial",
        artifact: WILHELM_DE_ZENO_MATERIAL_JSON,
        command: "npm run extract:wilhelm-de-from-zeno:all (includes --material crawl)",
      },
    ],
  };

  await mkdir(WILHELM_DE_COMMENTS_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(REPORTS, `wilhelm-de-comments-zeno-probe-${stamp}.json`);
  await writeFile(reportPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");

  console.log("extract:wilhelm-de-comments-from-zeno — probe complete");
  console.log(`  Erstes Buch: ${hexPaths.length} hex paths OK`);
  console.log(`  Zweites Buch: ${zweitesLinks.length} material sections on Zeno`);
  console.log(`  Drittes Buch on Zeno: ${rootDrittes.length} links (expected 0)`);
  console.log(`  → Ten Wings extract must use PDF maestro path, not Zeno`);
  console.log(`  report: ${reportPath}`);

  if (!plan.zenoAvailability.drittesBuchTenWings.available) {
    process.exitCode = 0;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
