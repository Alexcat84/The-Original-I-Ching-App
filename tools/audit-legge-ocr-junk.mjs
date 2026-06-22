#!/usr/bin/env node
/**
 * Find Legge PDF gold / bundle OCR junk that matches EPUB after cleanup.
 */
import { parseAllLeggeSbePdfOrThrow } from "../scripts/lib/hexagram-fidelity-legge-sbe-pdf.mjs";
import { parseAllLeggeEpubOrThrow } from "../scripts/lib/hexagram-fidelity-legge-epub.mjs";
import { fieldLooksCorrupt, fieldLooksTruncated } from "../scripts/lib/hexagram-fidelity-legge-sbe-epub-guide.mjs";
import { textsMatch } from "../scripts/lib/hexagram-fidelity-normalize.mjs";
import LEGGE from "../scripts/iching_legge_translation.mjs";

const epub = await parseAllLeggeEpubOrThrow();
const pdfNoGuide = await parseAllLeggeSbePdfOrThrow({ force: false, epubGuide: false });
const pdf = await parseAllLeggeSbePdfOrThrow({ force: false, epubGuide: true });

function epubField(n, f) {
  if (f.startsWith("L")) return epub[n]?.lines?.[Number(f.slice(1))];
  if (f === "yongJiu") return epub[n]?.yongJiu;
  return epub[n]?.[f];
}

function bundleField(n, f) {
  const row = LEGGE[String(n)];
  if (f.startsWith("L")) return row?.legge_lines?.[String(f.slice(1))]?.text;
  if (f === "yongJiu") return row?.yong_supernumerary;
  if (f === "judgment") return row?.legge_judgment?.text;
  if (f === "image") return row?.legge_image?.text;
  return undefined;
}

const issues = [];

for (let n = 1; n <= 64; n++) {
  const fields = [
    ["judgment", pdf[n].judgment, pdfNoGuide[n].judgment],
    ["image", pdf[n].image, pdfNoGuide[n].image],
  ];
  if (pdf[n].yongJiu) fields.push(["yongJiu", pdf[n].yongJiu, pdfNoGuide[n].yongJiu]);
  for (let p = 1; p <= 6; p++) {
    fields.push([`L${p}`, pdf[n].lines[p], pdfNoGuide[n].lines[p]]);
  }

  for (const [f, guided, raw] of fields) {
    const b = bundleField(n, f);
    const e = epubField(n, f);
    const t = String(guided ?? "").trim();
    if (!t) {
      issues.push({ n, f, kind: "empty", bundle: b, epub: e });
      continue;
    }
    if (fieldLooksCorrupt(t)) {
      issues.push({ n, f, kind: "corrupt", text: t.slice(0, 160), epub: e?.slice(0, 160) });
    }
    if (fieldLooksTruncated(t)) {
      issues.push({ n, f, kind: "truncated", text: t, epub: e?.slice(0, 160) });
    }
    if (e && !textsMatch(t, e, "legge")) {
      const isLineSix =
        textsMatch(
          t.replace(/\b(six|line)\b/gi, "LINE"),
          e.replace(/\b(six|line)\b/gi, "LINE"),
          "legge",
        );
      if (!isLineSix) {
        issues.push({ n, f, kind: "diff-epub", pdf: t.slice(0, 200), epub: e.slice(0, 200) });
      }
    }
    if (/its,\s*subject|to his\.\s*help|should \.\s| affairs\. :$| ~$/.test(t)) {
      issues.push({ n, f, kind: "ocr-junk-pattern", pdf: t, epub: e });
    }
    if (raw !== guided) {
      issues.push({ n, f, kind: "epub-repaired", before: String(raw).slice(0, 120), after: String(guided).slice(0, 120) });
    }
  }
}

console.log(`Issues: ${issues.length}`);
for (const it of issues) {
  console.log(JSON.stringify(it));
}
