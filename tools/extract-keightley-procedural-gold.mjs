#!/usr/bin/env node
/**
 * Extract Keightley procedural passages (crack notation, prognostication) for AUD-DIV-03.
 * Source: tools/source-pdfs/Sources of Shang History_ The Oracle-Bone Inscriptions of.pdf
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadPdfManifest, resolvePdfPath } from "../scripts/lib/pdf-gold-paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(
  __dirname,
  "datasets",
  "keightley",
  "procedural",
  "keightley-procedural-gold.json",
);

/** @type {Array<{ id: string; bookSection: string; pdfPages: [number, number] }>} */
const SECTIONS = [
  { id: "2.5-divination-sets", bookSection: "2.5 Divination Sets", pdfPages: [54, 55] },
  { id: "2.6-crack-notations", bookSection: "2.6 Crack Notations", pdfPages: [56, 57] },
  { id: "2.7-prognostication", bookSection: "2.7 The Prognostication", pdfPages: [57, 58] },
  { id: "4.3.1.11-crack-notation-taxonomy", bookSection: "4.3.1.11 Crack Notations", pdfPages: [136, 137] },
];

function pdftotextRange(pdfPath, from, to) {
  const r = spawnSync("pdftotext", ["-layout", "-f", String(from), "-l", String(to), pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(r.stderr?.trim() || `pdftotext failed (${r.status})`);
  }
  return r.stdout ?? "";
}

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const manifest = await loadPdfManifest();
  const entry = manifest.sources.keightley;
  if (!entry) throw new Error("manifest.sources.keightley missing");

  const { abs } = await resolvePdfPath("keightley");
  const extractedAt = new Date().toISOString();

  const sections = SECTIONS.map(({ id, bookSection, pdfPages }) => {
    const [from, to] = pdfPages;
    const raw = pdftotextRange(abs, from, to);
    return {
      id,
      bookSection,
      pdfPages: { from, to },
      charCount: raw.length,
      text: normalizeText(raw),
    };
  });

  const payload = {
    source: "keightley",
    manifestKey: "keightley",
    title: entry.title,
    author: entry.author,
    isbn13: entry.isbn13,
    extractedAt,
    pdfFile: entry.file,
    runtimeIngest: false,
    auditCode: "20260625-AUD-DIV-03 oracle-bones-keightley",
    sections,
    auditBlocks: {
      G: {
        label: "Verdict / crack-notation taxonomy",
        question: "Do four product verdicts map to Keightley crack notation + prognostication classes?",
        relatedSectionIds: ["2.6-crack-notations", "4.3.1.11-crack-notation-taxonomy", "2.7-prognostication"],
      },
      H: {
        label: "Random weights",
        question: "Are engine pattern weights (29.41% / 23.53%…) book-derived?",
        relatedSectionIds: ["2.5-divination-sets"],
        note: "Expected INFO — product redistribution post-Silence removal, not in Keightley.",
      },
      I: {
        label: "Crack topology (image prompt)",
        question: "Do patterns A–D in oracle-bones-prompt.ts have archaeological anchors in Keightley?",
        relatedSectionIds: ["2.6-crack-notations"],
      },
      J: {
        label: "FAQ / product copy",
        question: "Does public copy overclaim book-primary fidelity?",
        relatedSectionIds: ["2.6-crack-notations", "2.7-prognostication", "4.3.1.11-crack-notation-taxonomy"],
      },
    },
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_PATH} (${sections.length} sections)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
