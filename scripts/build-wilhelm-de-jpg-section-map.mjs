/**
 * Build Wilhelm DE JPG section + Drittes Buch hex start maps from OCR anchors.
 * QA code: VF-FID-W-036 · v1.0.0
 * Area: scripts/lib/wilhelm-de-jpg-page-map.mjs
 * Family: FID-W
 */
import { writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseWilhelmDe64HexCommentsTxt } from "./lib/wilhelm-de-64hex-comments-txt.mjs";
import {
  bookPageToSegmentRef,
  resolveJpgPath,
  WILHELM_DE_JPG_MAX_BOOK_PAGE,
} from "./lib/wilhelm-de-jpg-page-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_SECTIONS = join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-book-section-starts.json");
const OUT_COMMENTS = join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json");
const DRITTES_OCR = join(ROOT, "tools/source-pdfs/W german/wilhelm-de-drittes-buch-pass02.txt");

/** Vision-verified anchors in the 585-page JPG scan (2026-06-30). */
const SECTIONS = [
  {
    id: "erstes_buch",
    labelDe: "ERSTES BUCH",
    labelEs: "Texto oracular de los 64 hexagramas",
    wingRole: "oracle_text",
    startBookPage: 23,
    endBookPage: 212,
    markers: ["DAS URTEIL", "DAS BILD", "Die einzelnen Linien"],
  },
  {
    id: "zweites_buch",
    labelDe: "ZWEITES BUCH — DAS MATERIAL",
    labelEs: "Material y alas completas (bloques)",
    wingRole: "ten_wings_monolith",
    startBookPage: 213,
    endBookPage: 314,
    markers: ["ZWEITES BUCH", "DAS MATERIAL"],
  },
  {
    id: "zweites_einleitung",
    labelDe: "Einleitung zu den zehn Flügeln",
    labelEs: "Ensayo: cómo Wilhelm reparte las 10 alas",
    parent: "zweites_buch",
    startBookPage: 216,
    endBookPage: 218,
    markers: ["zehn Flügel", "Tuan Dschuan", "Siang Dschuan", "Wen Yän", "Schuo Gua"],
  },
  {
    id: "schuo_gua",
    labelDe: "I. SCHUO GUA / Besprechung der Zeichen",
    labelEs: "Ala 8 — Discusión de los trigramas (texto continuo)",
    parent: "zweites_buch",
    wingNumbers: [8],
    startBookPage: 219,
    endBookPage: 232,
    markers: ["I. SCHUO GUA", "KAPITEL I", "KAPITEL II", "KAPITEL III"],
  },
  {
    id: "da_dschuan",
    labelDe: "II. DA DSCHUAN / Die große Abhandlung",
    labelEs: "Alas 5–6 — Gran Tratado / Xi Ci (texto continuo)",
    parent: "zweites_buch",
    wingNumbers: [5, 6],
    startBookPage: 233,
    endBookPage: 310,
    markers: ["II. DA DSCHUAN", "Hi Tsï Dschuan", "I. ABTEILUNG", "II. ABTEILUNG"],
  },
  {
    id: "drittes_buch",
    labelDe: "DRITTES BUCH — DIE KOMMENTARE",
    labelEs: "Comentarios clásicos repartidos hex por hex",
    wingRole: "ten_wings_per_hex",
    startBookPage: 315,
    endBookPage: WILHELM_DE_JPG_MAX_BOOK_PAGE,
    markers: ["DRITTES BUCH", "DIE KOMMENTARE"],
  },
];

/** Field markers inside each hex of Drittes Buch → Ten Wings (Wilhelm split). */
const DRITTES_WING_FIELDS = [
  { wing: [1, 2], field: "commentary_decision", markerDe: "Kommentar zur Entscheidung" },
  { wing: [3, 4], field: "commentary_image", markerDe: "Kommentar zu den Bildern" },
  { wing: [3, 4], field: "L1_b_comentario", markerDe: "Zu den einzelnen Linien / Kleine Bilder" },
  { wing: [7], field: "wen_yen", markerDe: "Kommentar zu den Textworten (Wen Yän)", hexOnly: [1, 2] },
  { wing: [9], field: "sequence", markerDe: "Die Reihenfolge" },
  { wing: [10], field: "misc_notes", markerDe: "Vermischte Zeichen" },
  { wing: [], field: "ruler_note", markerDe: "Kernzeichen", note: "Nota técnica Wilhelm, no es ala clásica" },
];

function withSegmentRef(section) {
  const start = bookPageToSegmentRef(section.startBookPage);
  const end = bookPageToSegmentRef(section.endBookPage);
  return { ...section, start, end };
}

function buildCommentsHexStarts() {
  const raw = readFileSync(DRITTES_OCR, "utf8");
  const lines = raw.split("\n");
  const pageAtLine = new Array(lines.length).fill(0);
  let page = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^--- page (\d+) ---/);
    if (m) page = +m[1];
    pageAtLine[i] = page;
  }

  const DRITTES_TITLE_BOOK_PAGE = 315;
  const DRITTES_HEX1_OCR_PAGE = 13;

  const { hexagrams, headerCount } = parseWilhelmDe64HexCommentsTxt(raw);
  if (headerCount !== 64) {
    throw new Error(`Expected 64 comment hex headers, got ${headerCount}`);
  }

  /** @type {Array<{ hex: number; title: string; bookPage: number; segment: string; page: number }>} */
  const starts = Object.values(hexagrams)
    .sort((a, b) => a.bookNumber - b.bookNumber)
    .map((h) => {
      const ocrPage = pageAtLine[h.lineStart - 1] || pageAtLine[h.lineStart];
      const bookPage =
        DRITTES_TITLE_BOOK_PAGE + (ocrPage - DRITTES_HEX1_OCR_PAGE) + 1;
      const ref = bookPageToSegmentRef(bookPage);
      resolveJpgPath(ref);
      return {
        hex: h.bookNumber,
        title: h.bookTitle,
        chinese: h.bookChinese,
        ocrPage,
        bookPage,
        segment: ref.segment,
        page: ref.page,
      };
    });

  const endAnchor = { segment: "501-585", page: 85, bookPage: 585 };
  /** @type {typeof starts[number] & { endBookPage: number; endSegment: string; endPage: number }[]} */
  const withEnds = starts.map((cur, i) => {
    const next = starts[i + 1];
    const endBookPage = next ? next.bookPage - 1 : endAnchor.bookPage;
    const endRef = bookPageToSegmentRef(endBookPage);
    return {
      ...cur,
      endBookPage,
      endSegment: endRef.segment,
      endPage: endRef.page,
    };
  });

  return {
    schemaVersion: "1.0.0",
    source: "Drittes Buch pass02 OCR + JPG anchor page 316 (2026-06-30)",
    drittesTitleBookPage: DRITTES_TITLE_BOOK_PAGE,
    drittesHex1BookPage: starts[0]?.bookPage ?? 316,
    wingFieldMap: DRITTES_WING_FIELDS,
    starts: withEnds,
  };
}

function main() {
  const sectionsPayload = {
    schemaVersion: "1.0.0",
    source: "585 JPG scan vision + pass03 OCR (2026-06-30)",
    totalBookPages: WILHELM_DE_JPG_MAX_BOOK_PAGE,
    noteEs:
      "Wilhelm no imprime las 10 alas en un solo bloque: alas 5–6 y 8 van completas en ZWEITES BUCH; alas 1–4, 7, 9–10 van repartidas por hex en DRITTES BUCH bajo los marcadores alemanes listados.",
    sections: SECTIONS.map(withSegmentRef),
    drittesWingFields: DRITTES_WING_FIELDS,
  };

  for (const s of sectionsPayload.sections) {
    resolveJpgPath(s.start);
    resolveJpgPath(s.end);
  }

  const commentsPayload = buildCommentsHexStarts();
  for (const s of commentsPayload.starts) {
    resolveJpgPath({ segment: s.segment, page: s.page });
  }

  writeFileSync(OUT_SECTIONS, `${JSON.stringify(sectionsPayload, null, 2)}\n`, "utf8");
  writeFileSync(OUT_COMMENTS, `${JSON.stringify(commentsPayload, null, 2)}\n`, "utf8");

  console.log(`Wrote ${OUT_SECTIONS}`);
  console.log(`Wrote ${OUT_COMMENTS} (${commentsPayload.starts.length} hex anchors)`);
}

main();
