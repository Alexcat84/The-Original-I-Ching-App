import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type AuditReportStatus = "closed" | "monitoring" | "ongoing";

export type AuditReportEntry = {
  id: string;
  date: string;
  title: string;
  /** Short public summary: source audited + outcome only. */
  summary: string;
  status: AuditReportStatus;
  statusLabel: string;
};

/**
 * One APA 7 reference for a verification block. Split so the title can
 * render italicized without a markdown parser, the same pattern as
 * `AcademicSource` in notes-page-ui.ts. Not translated per locale.
 */
export type AuditSourceCitation = {
  citation: string;
  title: string;
  rest: string;
};

export type AuditBlockStatusKind = "current" | "permanent" | "superseded";
export type AuditBlockCategory =
  | "oracle-text"
  | "divination-method"
  | "library-commentary"
  | "mutation-rule";

/**
 * One verification block = one source comparison. Each block documents a
 * single source: which edition, when it was checked, how, against which
 * standard set of textual fields, and the exact result, so a reader can
 * audit any single claim without needing the internal engineering report.
 */
export type AuditSourceBlock = {
  id: string;
  category: AuditBlockCategory;
  title: string;
  source: AuditSourceCitation;
  verificationDate: string;
  method: string;
  standardCompared: string;
  result: string;
  statusKind: AuditBlockStatusKind;
  statusLabel: string;
  currentStatusNote: string;
};

export type AuditTimelineEntryKind = "verification" | "release";

/** One row in the public `/audits` timeline (blocks + feature releases merged). */
export type AuditTimelineEntry = {
  id: string;
  kind: AuditTimelineEntryKind;
  category?: AuditBlockCategory;
  verificationDateIso: string;
  /** Locale-formatted verification date shown in the expanded field row. */
  verificationDate: string;
  headline: string;
  statusKind: AuditBlockStatusKind;
  statusLabel: string;
  source: AuditSourceCitation;
  method: string;
  standardCompared: string;
  result: string;
  currentStatusNote: string;
};

export type AuditsPageUiMessages = {
  /** Page `<title>` / Open Graph only; not rendered in the article body. */
  title: string;
  oracleTextSectionHeading: string;
  divinationMethodSectionHeading: string;
  libraryCommentarySectionHeading: string;
  mutationRulesSectionHeading: string;
  blockVerificationDateLabel: string;
  blockSourceLabel: string;
  blockMethodLabel: string;
  blockStandardLabel: string;
  blockResultLabel: string;
  blockStatusLabel: string;
  timeline: AuditTimelineEntry[];
};

/** Sort metadata keyed by block/report id (ISO date is locale-neutral). */
const TIMELINE_META: Record<string, { verificationDateIso: string; sortOrder: number }> = {
  "wilhelm-appendix-coins-2026-06-25": { verificationDateIso: "2026-06-25", sortOrder: 0 },
  "wilhelm-appendix-yarrow-2026-06-25": { verificationDateIso: "2026-06-25", sortOrder: 1 },
  "zhouyi-ctext-2026-06-21": { verificationDateIso: "2026-06-23", sortOrder: 0 },
  "legge-oxford-pdf-2026-06-22": { verificationDateIso: "2026-06-23", sortOrder: 1 },
  "wilhelm-pantheon-pdf-2026-06-22": { verificationDateIso: "2026-06-23", sortOrder: 2 },
  "legge-commentary-txt-maestro-2026-06-23": { verificationDateIso: "2026-06-24", sortOrder: 0 },
  "wilhelm-commentary-txt-maestro-2026-06-23": { verificationDateIso: "2026-06-24", sortOrder: 1 },
  "wilhelm-diederichs-1924-oracle-2026-06-30": { verificationDateIso: "2026-06-30", sortOrder: 0 },
  "wilhelm-diederichs-1924-commentary-2026-06-30": { verificationDateIso: "2026-06-30", sortOrder: 1 },
  "huang-mutation-pdf-2026-06-22": { verificationDateIso: "2026-06-22", sortOrder: 0 },
  "zhuxi-adler-mutation-pdf-2026-06-22": { verificationDateIso: "2026-06-22", sortOrder: 1 },
  "wilhelm-parma-initial-2026-06-21": { verificationDateIso: "2026-06-21", sortOrder: 0 },
  "legge-sacred-texts-initial-2026-06-21": { verificationDateIso: "2026-06-21", sortOrder: 1 },
  "zhouyi-ctext-initial-2026-06-21": { verificationDateIso: "2026-06-21", sortOrder: 2 },
  "coins-math-initial-2026-05-19": { verificationDateIso: "2026-05-19", sortOrder: 0 },
  "yarrow-math-initial-2026-05-19": { verificationDateIso: "2026-05-19", sortOrder: 1 },
};

function timelineMetaFor(id: string): { verificationDateIso: string; sortOrder: number } {
  const meta = TIMELINE_META[id];
  if (!meta) {
    throw new Error(`Missing TIMELINE_META for audit entry "${id}"`);
  }
  return meta;
}

function blockToTimelineEntry(block: AuditSourceBlock): AuditTimelineEntry & { sortOrder: number } {
  assertCompleteVerificationBlock(block);
  const { verificationDateIso, sortOrder } = timelineMetaFor(block.id);
  return {
    id: block.id,
    kind: "verification",
    category: block.category,
    verificationDateIso,
    verificationDate: block.verificationDate,
    sortOrder,
    headline: block.title,
    statusKind: block.statusKind,
    statusLabel: block.statusLabel,
    source: block.source,
    method: block.method,
    standardCompared: block.standardCompared,
    result: block.result,
    currentStatusNote: block.currentStatusNote,
  };
}

function buildTimeline(blocks: AuditSourceBlock[]): AuditTimelineEntry[] {
  return blocks
    .map(blockToTimelineEntry)
    .sort((a, b) => {
      const byDate = b.verificationDateIso.localeCompare(a.verificationDateIso);
      if (byDate !== 0) return byDate;
      return a.sortOrder - b.sortOrder;
    })
    .map(({ sortOrder: _sortOrder, ...entry }) => entry);
}

/**
 * Shared APA 7 citations for verification sources. Author/title/publisher
 * are not translated per locale (same convention as ACADEMIC_SOURCES in
 * notes-page-ui.ts); only the surrounding prose in each locale's
 * AuditSourceBlock is translated.
 */
const CITATIONS = {
  wilhelmParma: {
    citation: "Wilhelm, R. (n.d.). ",
    title: "I Ching Wilhelm translation",
    rest: " [Web mirror]. University of Parma. http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html",
  },
  wilhelmPantheon: {
    citation: "Wilhelm, R., & Baynes, C. F. (1950). ",
    title: "The I Ching or Book of Changes",
    rest: " (Bollingen Series XIX). Princeton University Press.",
  },
  wilhelmDiederichs1924: {
    citation: "Wilhelm, R. (1924). ",
    title: "I Ging: Das Buch der Wandlungen",
    rest: ". Eugen Diederichs Verlag.",
  },
  leggeSacredTexts: {
    citation: "Legge, J. (1882). ",
    title: "The Yî King",
    rest: " [Web reproduction]. Internet Sacred Text Archive. https://sacred-texts.com/ich/index.htm",
  },
  leggeOxford: {
    citation: "Legge, J. (1882). ",
    title: "The Yî King",
    rest: " (F. M. Müller, Ed.; Sacred Books of the East, Vol. 16). Clarendon Press.",
  },
  zhouyiCtext: {
    citation: "Sturgeon, D. (n.d.). ",
    title: "Chinese Text Project",
    rest: ". https://ctext.org/book-of-changes",
  },
  huang: {
    citation: "Huang, A. (2010). ",
    title: "The Complete I Ching",
    rest: " (10th anniversary ed.). Inner Traditions. (Original work published 1998).",
  },
  zhuxiAdler: {
    citation: "Adler, J. A. (2002). ",
    title: "Introduction to the study of the classic of change",
    rest: " (I-hsüeh ch'i-meng). Global Scholarly Publications.",
  },
  nielsen: {
    citation: "Nielsen, B. (2003). ",
    title: "A companion to Yi Jing numerology and cosmology",
    rest: ". Routledge.",
  },
} satisfies Record<string, AuditSourceCitation>;

const CANONICAL_CITATIONS = new Set<AuditSourceCitation>(Object.values(CITATIONS));

function assertCompleteVerificationBlock(block: AuditSourceBlock): void {
  const stringFields: (keyof AuditSourceBlock)[] = [
    "title",
    "method",
    "standardCompared",
    "result",
    "statusLabel",
    "verificationDate",
  ];
  for (const field of stringFields) {
    const value = block[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Audit block "${block.id}" missing required field "${field}"`);
    }
  }
  if (!CANONICAL_CITATIONS.has(block.source)) {
    throw new Error(`Audit block "${block.id}" must use a shared CITATIONS entry (APA 7)`);
  }
  const { citation, title, rest } = block.source;
  if (!citation.trim() || !title.trim() || !rest.trim()) {
    throw new Error(`Audit block "${block.id}" has an incomplete APA citation`);
  }
}

const BLOCKS_EN: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): initial cross-check (W/B 1950 comparative)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 Jun 2026",
    method:
      "Automated field-by-field comparison between the text extracted from the mirror and the text served by the app.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including the special texts 用九/用六 for hexagrams 1 and 2 (514 fields total).",
    result:
      "Final: 514/514 fields matched (100%). Intermediate passes: 94.94% → 99.81% → 100%; the last 6 fields were completed from the printed edition where the web mirror had gaps.",
    statusKind: "superseded",
    statusLabel: "Obsolete.",
    currentStatusNote: "Comparative cross-reference against the Wilhelm/Baynes 1950 English rendering, retained for historical completeness. The app's oracle source is the first printed edition (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): verification (W/B 1950 comparative reference)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 Jun 2026",
    method:
      "Automated field-by-field comparison between text extracted from a local EPUB of the published edition and the text served by the app.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "Final: 514/514 fields matched (100%).",
    statusKind: "superseded",
    statusLabel: "Obsolete.",
    currentStatusNote: "Comparative cross-reference against the Wilhelm/Baynes 1950 English rendering, retained for historical completeness. The app's oracle source is the first printed edition (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: initial verification",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 Jun 2026",
    method: "Automated field-by-field comparison against this published edition.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result:
      "Final: 514/514 fields matched (100%). Intermediate pass on 21 Jun: 77.19% → final: 100% after parser and gold corrections, verified directly against this published edition.",
    statusKind: "superseded",
    statusLabel: "Obsolete.",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: verification (published edition)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 Jun 2026",
    method:
      "Automated field-by-field comparison between text extracted from a local EPUB of the published edition and the text served by the app.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "Final: 514/514 fields matched (100%).",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: initial verification",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 Jun 2026",
    method:
      "The app dataset had been built from a non-ctext source. A first automated field-by-field comparison detected wrong and duplicated glyphs in that dataset (hex 31 咸/鹹; hex 19 label collision). The bundle was re-ingested from ctext.org and re-verified the same day.",
    standardCompared:
      "卦辭, 大象, and the 6 lines of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result:
      "Final: 514/514 fields matched (100%). Intermediate pass on 21 Jun: 90.66% → final: 100% after re-ingestion and parser correction.",
    statusKind: "superseded",
    statusLabel: "Obsolete.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: second verification",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 Jun 2026",
    method:
      "Independent re-run of the field-by-field comparison plus dedicated checks for character corruption and duplicate glyphs, on 22-23 Jun 2026.",
    standardCompared:
      "卦辭, 大象, and the 6 lines of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "514/514 fields matched (100%), with zero corruption flags.",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "Richard Wilhelm (1924): verification against the first edition",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 Jun 2026",
    method:
      "Field-by-field comparison of the app's oracle text against the first printed edition (Eugen Diederichs Verlag, Jena, 1924).",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 for hexagrams 1 and 2 (514 fields total).",
    result: "514/514 fields matched (100%).",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "A post-verification field audit (W-08, July 2026) identified and corrected 73 OCR artifacts across the Wilhelm 1924 dataset. Text re-verified against the first printed edition after all corrections.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Classical commentaries: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 Jun 2026",
    method:
      "Automated verification of classical commentaries against the Wilhelm/Baynes (1950) published edition, including Wilhelm's own notes and Confucius's Ten Wings commentary.",
    standardCompared:
      "Wilhelm's own commentary and Confucius's Ten Wings notes on judgment, image, and each line; About this hexagram block; Words on the Text (hex 1-2 only); yong commentary (hex 1-2 only). 64 hexagrams.",
    result: "1920/1920 fields matched (100%).",
    statusKind: "superseded",
    statusLabel: "Obsolete.",
    currentStatusNote: "Comparative cross-reference against the Wilhelm/Baynes 1950 English commentary, retained for completeness. Commentary is drawn from the first printed edition (Diederichs, 1924).",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Classical commentaries: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "24 Jun 2026",
    method:
      "Automated verification of classical commentaries against the James Legge (1882) published edition, including footnotes and the Great Symbolism of Appendix II.",
    standardCompared:
      "Footnotes (64 hexagrams); Great Symbolism image gloss, Appendix II (64 hexagrams); Lesser Symbolism line notes, Appendix II (present for 6 of 64 hexagrams in Legge's edition).",
    result:
      "Footnotes and Great Symbolism image gloss fully covered (64/64, 100%); Lesser Symbolism line notes verified for every hexagram where Legge's edition includes them. Verification PASS.",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "Classical commentaries: Richard Wilhelm (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 Jun 2026",
    method:
      "Field-by-field comparison of the app's commentary text against the first printed edition (Eugen Diederichs Verlag, Jena, 1924), covering the third book (Die Kommentare), which contains Wilhelm's own notes and his rendering of the Confucian Ten Wings for all 64 hexagrams.",
    standardCompared:
      "Wilhelm's own commentary and the Ten Wings notes on judgment, image, and each line; About this hexagram block; Words on the Text (hexagrams 1 and 2 only); yong commentary (hexagrams 1 and 2 only). 64 hexagrams; 2,304 fields in total.",
    result: "2,304/2,304 fields matched (100%).",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "A post-verification field audit (W-08, July 2026) identified and corrected 73 OCR artifacts across the Wilhelm 1924 dataset. Text re-verified against the first printed edition after all corrections.",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Changing-line rules: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "22 Jun 2026",
    method: "Automated comparison of the app's reduction rules against the published rule text, case by case.",
    standardCompared:
      "The 9 published rule cases for reducing changing lines to a single governing line text (0 through 6 changing lines, plus 用九/用六).",
    result: "Final: 9/9 rule cases matched (100%).",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Changing-line rules: Zhu Xi (classical)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 Jun 2026",
    method: "Automated comparison of the app's classical reduction rules against the translated rule text.",
    standardCompared:
      "The published rule cases for reducing changing lines to a single governing line text (0 through 6 changing lines, plus 用九/用六).",
    result: "Final: 10/10 rule snippets matched (100%).",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "Three coins: verification (published edition)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 Jun 2026",
    method:
      "Automated verification against Appendix I, section 2, of the Wilhelm/Baynes (1950) published edition (automatic and manual paths).",
    standardCompared:
      "Inscribed face = yin (2), reverse = yang (3); resulting lines 6, 7, 8, 9 and exact probabilities 1/8, 3/8, 3/8, 1/8.",
    result: "Final: 3/3 checks passed (100%).",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "Yarrow stalks: verification (published edition)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 Jun 2026",
    method:
      "Automated verification against Appendix I, section 1, of the Wilhelm/Baynes (1950) published edition (automatic and manual paths).",
    standardCompared:
      "Three-round procedure, residue-to-line mapping, and line probabilities 1/16, 5/16, 7/16, 3/16.",
    result:
      "Final: 6/6 checks passed (100%). The classical 1/16, 5/16, 7/16, 3/16 distribution is exact; an independent literal simulation of the physical procedure differs by under 1%, a fully explained effect of counting stalks in groups of four, not a discrepancy.",
    statusKind: "current",
    statusLabel: "Current as of this date.",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "Three coins: initial verification",
    source: CITATIONS.nielsen,
    verificationDate: "19 May 2026",
    method:
      "Combinatorial proof of the 6/7/8/9 distribution and Monte Carlo simulation in engine tests. Cross-checked against published standard accounts (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Fair three-coin model (each side 2 or 3): line values 6, 7, 8, 9 and probabilities 1/8, 3/8, 3/8, 1/8.",
    result: "Distribution checks passed (combinatorics and Monte Carlo).",
    statusKind: "superseded",
    statusLabel: "Obsolete.",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "Yarrow stalks: initial verification",
    source: CITATIONS.nielsen,
    verificationDate: "19 May 2026",
    method:
      "Mathematical proof of residue-to-line mapping and Monte Carlo simulation (16,000 trials). Cross-checked against published probability tables (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Line distribution 1/16, 5/16, 7/16, 3/16; manual wizard accepts only 5/9 and 4/8 per round.",
    result: "Distribution and manual mapping checks passed.",
    statusKind: "superseded",
    statusLabel: "Obsolete.",
    currentStatusNote: "",
  },
];

const BLOCKS_ES: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): verificación inicial (comparativo W/B 1950)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 jun 2026",
    method:
      "Comparación automatizada campo por campo entre el texto extraído del mirror y el texto que sirve la app.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluidos los textos especiales 用九/用六 de los hexagramas 1 y 2 (514 campos en total).",
    result:
      "Final: 514/514 campos coincidentes (100%). Pasadas intermedias: 94.94% → 99.81% → 100%; los últimos 6 campos se completaron desde la edición impresa donde el mirror web tenía vacíos.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Cotejo comparativo contra la versión inglesa Wilhelm/Baynes de 1950, conservado por integridad histórica. La fuente oracular de la app es la primera edición impresa (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): verificación (referencia comparativa W/B 1950)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 jun 2026",
    method:
      "Comparación automatizada campo por campo entre el texto extraído de un EPUB local de la edición publicada y el texto que sirve la app.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "Final: 514/514 campos coincidentes (100%).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Cotejo comparativo contra la versión inglesa Wilhelm/Baynes de 1950, conservado por integridad histórica. La fuente oracular de la app es la primera edición impresa (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: verificación inicial",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 jun 2026",
    method: "Comparación automatizada campo por campo contra esta edición publicada.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result:
      "Final: 514/514 campos coincidentes (100%). Pasada intermedia el 21 jun: 77.19% → final: 100% tras correcciones del parser y gold, verificados directamente contra esta edición publicada.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: verificación (edición publicada)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 jun 2026",
    method:
      "Comparación automatizada campo por campo entre el texto extraído de un EPUB local de la edición publicada y el texto que sirve la app.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "Final: 514/514 campos coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: verificación inicial",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 jun 2026",
    method:
      "El dataset de la app se había construido desde una fuente distinta de ctext.org. Una primera comparación automatizada campo por campo detectó glifos erróneos y duplicados en ese dataset (hex 31 咸/鹹; colisión de etiqueta hex 19). El bundle se volvió a cargar desde ctext.org y se re-verificó el mismo día.",
    standardCompared: "卦辭, 大象 y las 6 líneas de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result:
      "Final: 514/514 campos coincidentes (100%). Pasada intermedia el 21 jun: 90.66% → final: 100% tras recarga y corrección del parser.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: segunda verificación",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 jun 2026",
    method:
      "Re-ejecución independiente de la comparación campo por campo más verificaciones dedicadas de corrupción de caracteres y glifos duplicados, el 22-23 jun 2026.",
    standardCompared: "卦辭, 大象 y las 6 líneas de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "514/514 campos coincidentes (100%), con cero indicadores de corrupción.",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "Richard Wilhelm (1924): verificación contra la primera edición",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 jun 2026",
    method:
      "Comparación campo por campo del texto oracular de la app contra la primera edición impresa (Eugen Diederichs Verlag, Jena, 1924).",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 de los hexagramas 1 y 2 (514 campos en total).",
    result: "514/514 campos coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "Una auditoría de campo posterior a la verificación (W-08, julio de 2026) identificó y corrigió 73 artefactos OCR en el conjunto de datos Wilhelm 1924. Texto reverificado contra la primera edición impresa tras todas las correcciones.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Comentarios clásicos: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 jun 2026",
    method:
      "Verificación automatizada de los comentarios clásicos contra la edición publicada Wilhelm/Baynes (1950), incluido el comentario propio de Wilhelm y las Diez Alas de Confucio.",
    standardCompared:
      "Comentario propio de Wilhelm y notas de las Diez Alas de Confucio en juicio, imagen y cada línea; bloque Acerca de este hexagrama; Words on the Text (solo hex 1-2); comentario yong (solo hex 1-2). 64 hexagramas.",
    result: "1920/1920 campos coincidentes (100%).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Cotejo comparativo contra los comentarios de la versión inglesa Wilhelm/Baynes de 1950, conservado por integridad histórica. El comentario proviene de la primera edición impresa (Diederichs, 1924).",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Comentarios clásicos: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "24 jun 2026",
    method:
      "Verificación automatizada de los comentarios clásicos contra la edición publicada de James Legge (1882), incluidas footnotes y el Gran Simbolismo del Apéndice II.",
    standardCompared:
      "Footnotes (64 hexagramas); glosa de imagen del Gran Simbolismo, Apéndice II (64 hexagramas); notas de Simbolismo menor por línea, Apéndice II (presentes en 6 de los 64 hexagramas en la edición de Legge).",
    result:
      "Footnotes y glosa de imagen del Gran Simbolismo cubiertos por completo (64/64, 100%); notas de Simbolismo menor verificadas en cada hexagrama donde la edición de Legge las incluye. Verificación PASS.",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "Comentarios clásicos: Richard Wilhelm (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 jun 2026",
    method:
      "Comparación campo por campo del texto de comentario de la app contra la primera edición impresa (Eugen Diederichs Verlag, Jena, 1924), abarcando el tercer libro (Die Kommentare), que contiene las notas propias de Wilhelm y su traducción de las Diez Alas confucianas para los 64 hexagramas.",
    standardCompared:
      "Comentario propio de Wilhelm y las Diez Alas confucianas en juicio, imagen y cada línea; bloque Acerca de este hexagrama; Wen Yen (hexagramas 1 y 2 solamente); comentario yong (hexagramas 1 y 2 solamente). 64 hexagramas; 2.304 campos en total.",
    result: "2.304/2.304 campos coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "Una auditoría de campo posterior a la verificación (W-08, julio de 2026) identificó y corrigió 73 artefactos OCR en el conjunto de datos Wilhelm 1924. Texto reverificado contra la primera edición impresa tras todas las correcciones.",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Reglas de líneas cambiantes: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "22 jun 2026",
    method:
      "Comparación automatizada de las reglas de reducción de la app contra el texto publicado de las reglas, caso por caso.",
    standardCompared:
      "Los 9 casos de regla publicados para reducir líneas cambiantes a un único texto de línea gobernante (0 a 6 líneas cambiantes, más 用九/用六).",
    result: "Final: 9/9 casos de regla coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Reglas de líneas cambiantes: Zhu Xi (clásico)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 jun 2026",
    method:
      "Comparación automatizada de las reglas de reducción clásicas de la app contra el texto traducido de las reglas.",
    standardCompared:
      "Los casos de regla publicados para reducir líneas cambiantes a un único texto de línea gobernante (0 a 6 líneas cambiantes, más 用九/用六).",
    result: "Final: 10/10 fragmentos de regla coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "Tres monedas: verificación (edición publicada)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 jun 2026",
    method:
      "Verificación automatizada contra el Apéndice I, sección 2, de la edición publicada Wilhelm/Baynes (1950), en rutas automática y manual.",
    standardCompared:
      "Cara inscrita = yin (2), reverso = yang (3); líneas 6, 7, 8, 9 y probabilidades exactas 1/8, 3/8, 3/8, 1/8.",
    result: "Final: 3/3 comprobaciones aprobadas (100%).",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "Varas de milenrama: verificación (edición publicada)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 jun 2026",
    method:
      "Verificación automatizada contra el Apéndice I, sección 1, de la edición publicada Wilhelm/Baynes (1950), en rutas automática y manual.",
    standardCompared:
      "Procedimiento de tres rondas, mapeo de restos a línea y probabilidades 1/16, 5/16, 7/16, 3/16.",
    result:
      "Final: 6/6 comprobaciones aprobadas (100%). La distribución clásica 1/16, 5/16, 7/16, 3/16 es exacta; una simulación independiente y literal del procedimiento físico difiere en menos del 1%, un efecto totalmente explicado por contar las varas en grupos de cuatro, no una discrepancia.",
    statusKind: "current",
    statusLabel: "Vigente a la fecha.",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "Tres monedas: verificación inicial",
    source: CITATIONS.nielsen,
    verificationDate: "19 may 2026",
    method:
      "Demostración combinatoria de la distribución 6/7/8/9 y simulación Monte Carlo en tests del motor. Contrastado con cuentas estándar publicadas (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Modelo de tres monedas justas (cada lado 2 o 3): valores 6, 7, 8, 9 y probabilidades 1/8, 3/8, 3/8, 1/8.",
    result: "Comprobaciones de distribución aprobadas (combinatoria y Monte Carlo).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "Varas de milenrama: verificación inicial",
    source: CITATIONS.nielsen,
    verificationDate: "19 may 2026",
    method:
      "Demostración matemática del mapeo restos-línea y simulación Monte Carlo (16.000 tiradas). Contrastado con tablas de probabilidad publicadas (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Distribución 1/16, 5/16, 7/16, 3/16; asistente manual acepta solo 5/9 y 4/8 por ronda.",
    result: "Comprobaciones de distribución y mapeo manual aprobadas.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
];

const BLOCKS_PT: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): verificação inicial (comparativo W/B 1950)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 de junho de 2026",
    method:
      "Comparação automatizada campo a campo entre o texto extraído do mirror e o texto servido pela app.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo os textos especiais 用九/用六 dos hexagramas 1 e 2 (514 campos no total).",
    result:
      "Final: 514/514 campos correspondentes (100%). Passagens intermédias: 94.94% → 99.81% → 100%; os últimos 6 campos foram completados a partir da edição impressa onde o mirror web tinha lacunas.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Cotejo comparativo contra a versão inglesa Wilhelm/Baynes de 1950, mantido por integridade histórica. A fonte oracular da app é a primeira edição impressa (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): verificação (referência comparativa W/B 1950)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 de junho de 2026",
    method:
      "Comparação automatizada campo a campo entre o texto extraído de um EPUB local da edição publicada e o texto servido pela app.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "Final: 514/514 campos correspondentes (100%).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Cotejo comparativo contra a versão inglesa Wilhelm/Baynes de 1950, mantido por integridade histórica. A fonte oracular da app é a primeira edição impressa (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: verificação inicial",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 de junho de 2026",
    method: "Comparação automatizada campo a campo contra esta edição publicada.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result:
      "Final: 514/514 campos correspondentes (100%). Passagem intermédia em 21 de junho: 77.19% → final: 100% após correções do parser e gold, verificados diretamente contra esta edição publicada.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: verificação (edição publicada)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 de junho de 2026",
    method:
      "Comparação automatizada campo a campo entre o texto extraído de um EPUB local da edição publicada e o texto servido pela app.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "Final: 514/514 campos correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: verificação inicial",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 de junho de 2026",
    method:
      "O dataset da app tinha sido construído a partir de uma fonte distinta de ctext.org. Uma primeira comparação automatizada campo a campo detectou glifos errados e duplicados nesse dataset (hex 31 咸/鹹; colisão de rótulo hex 19). O bundle foi recarregado a partir de ctext.org e re-verificado no mesmo dia.",
    standardCompared: "卦辭, 大象 e as 6 linhas dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result:
      "Final: 514/514 campos correspondentes (100%). Passagem intermédia em 21 de junho: 90.66% → final: 100% após recarga e correção do parser.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: segunda verificação",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 de junho de 2026",
    method:
      "Reexecução independente da comparação campo a campo mais verificações dedicadas de corrupção de caracteres e glifos duplicados, em 22-23 de junho de 2026.",
    standardCompared: "卦辭, 大象 e as 6 linhas dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "514/514 campos correspondentes (100%), com zero indicadores de corrupção.",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "Richard Wilhelm (1924): verificação contra a primeira edição",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 de junho de 2026",
    method:
      "Comparação campo a campo do texto oracular da app com a primeira edição impressa (Eugen Diederichs Verlag, Jena, 1924).",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 para os hexagramas 1 e 2 (514 campos no total).",
    result: "514/514 campos correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "Uma auditoria de campo pós-verificação (W-08, julho de 2026) identificou e corrigiu 73 artefactos OCR no conjunto de dados Wilhelm 1924. Texto reverificado contra a primeira edição impressa após todas as correções.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Comentários clássicos: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 de junho de 2026",
    method:
      "Verificação automatizada dos comentários clássicos contra a edição publicada Wilhelm/Baynes (1950), incluindo o comentário próprio de Wilhelm e as Dez Asas de Confúcio.",
    standardCompared:
      "Comentário próprio de Wilhelm e notas das Dez Asas de Confúcio em juízo, imagem e cada linha; bloco Sobre este hexagrama; Words on the Text (apenas hex 1-2); comentário yong (apenas hex 1-2). 64 hexagramas.",
    result: "1920/1920 campos coincidentes (100%).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Cotejo comparativo contra os comentários da versão inglesa Wilhelm/Baynes de 1950, mantido por integridade histórica. O comentário provém da primeira edição impressa (Diederichs, 1924).",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Comentários clássicos: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "24 de junho de 2026",
    method:
      "Verificação automatizada dos comentários clássicos contra a edição publicada de James Legge (1882), incluindo footnotes e o Grande Simbolismo do Apêndice II.",
    standardCompared:
      "Footnotes (64 hexagramas); glosa de imagem do Grande Simbolismo, Apêndice II (64 hexagramas); notas de Simbolismo menor por linha, Apêndice II (presentes em 6 dos 64 hexagramas na edição de Legge).",
    result:
      "Footnotes e glosa de imagem do Grande Simbolismo totalmente cobertos (64/64, 100%); notas de Simbolismo menor verificadas em cada hexagrama onde a edição de Legge as inclui. Verificação PASS.",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "Comentários clássicos: Richard Wilhelm (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 de junho de 2026",
    method:
      "Comparação campo a campo do texto de comentário da app com a primeira edição impressa (Eugen Diederichs Verlag, Jena, 1924), abrangendo o terceiro livro (Die Kommentare), que contém as notas do próprio Wilhelm e a sua tradução das Dez Asas confucianas para os 64 hexagramas.",
    standardCompared:
      "Comentário próprio de Wilhelm e as Dez Asas confucianas sobre julgamento, imagem e cada linha; bloco Sobre este hexagrama; Wen Yen (hexagramas 1 e 2 apenas); comentário yong (hexagramas 1 e 2 apenas). 64 hexagramas; 2.304 campos no total.",
    result: "2.304/2.304 campos correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "Uma auditoria de campo pós-verificação (W-08, julho de 2026) identificou e corrigiu 73 artefactos OCR no conjunto de dados Wilhelm 1924. Texto reverificado contra a primeira edição impressa após todas as correções.",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regras de linhas mutantes: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "22 de junho de 2026",
    method:
      "Comparação automatizada das regras de redução da app contra o texto publicado das regras, caso a caso.",
    standardCompared:
      "Os 9 casos de regra publicados para reduzir linhas mutantes a um único texto de linha governante (0 a 6 linhas mutantes, mais 用九/用六).",
    result: "Final: 9/9 casos de regra correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regras de linhas mutantes: Zhu Xi (clássico)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 de junho de 2026",
    method:
      "Comparação automatizada das regras de redução clássicas da app contra o texto traduzido das regras.",
    standardCompared:
      "Os casos de regra publicados para reduzir linhas mutantes a um único texto de linha governante (0 a 6 linhas mutantes, mais 用九/用六).",
    result: "Final: 10/10 excertos de regra correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "Três moedas: verificação (edição publicada)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 de junho de 2026",
    method:
      "Verificação automatizada contra o Apêndice I, secção 2, da edição publicada Wilhelm/Baynes (1950), em percursos automático e manual.",
    standardCompared:
      "Face inscrita = yin (2), reverso = yang (3); linhas 6, 7, 8, 9 e probabilidades exactas 1/8, 3/8, 3/8, 1/8.",
    result: "Final: 3/3 verificações aprovadas (100%).",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "Varetas de mil-folhas: verificação (edição publicada)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 de junho de 2026",
    method:
      "Verificação automatizada contra o Apêndice I, secção 1, da edição publicada Wilhelm/Baynes (1950), em percursos automático e manual.",
    standardCompared:
      "Procedimento de três rondas, mapeamento de restos para linha e probabilidades 1/16, 5/16, 7/16, 3/16.",
    result:
      "Final: 6/6 verificações aprovadas (100%). A distribuição clássica 1/16, 5/16, 7/16, 3/16 é exata; uma simulação independente e literal do procedimento físico difere em menos de 1%, um efeito totalmente explicado por contar as varetas em grupos de quatro, não uma discrepância.",
    statusKind: "current",
    statusLabel: "Vigente nesta data.",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "Três moedas: verificação inicial",
    source: CITATIONS.nielsen,
    verificationDate: "19 de maio de 2026",
    method:
      "Demonstração combinatória da distribuição 6/7/8/9 e simulação Monte Carlo nos testes do motor. Contrastado com relatos padrão publicados (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Modelo de três moedas justas (cada lado 2 ou 3): valores 6, 7, 8, 9 e probabilidades 1/8, 3/8, 3/8, 1/8.",
    result: "Verificações de distribuição aprovadas (combinatória e Monte Carlo).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "Varetas de mil-folhas: verificação inicial",
    source: CITATIONS.nielsen,
    verificationDate: "19 de maio de 2026",
    method:
      "Demonstração matemática do mapeamento restos-linha e simulação Monte Carlo (16.000 tentativas). Contrastado com tabelas de probabilidade publicadas (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Distribuição 1/16, 5/16, 7/16, 3/16; assistente manual aceita apenas 5/9 e 4/8 por ronda.",
    result: "Verificações de distribuição e mapeamento manual aprovadas.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
];

const BLOCKS_FR: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): vérification initiale (comparatif W/B 1950)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 juin 2026",
    method:
      "Comparaison automatisée champ par champ entre le texte extrait du mirror et le texte servi par l'app.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris les textes spéciaux 用九/用六 des hexagrammes 1 et 2 (514 champs au total).",
    result:
      "Final : 514/514 champs correspondants (100 %). Passes intermédiaires : 94.94 % → 99.81 % → 100 % ; les 6 derniers champs ont été complétés à partir de l'édition imprimée là où le mirror web avait des lacunes.",
    statusKind: "superseded",
    statusLabel: "Obsolète.",
    currentStatusNote: "Référence croisée comparative vis-à-vis de la version anglaise Wilhelm/Baynes de 1950, conservée à titre historique. La source oraculaire de l'application est la première édition imprimée (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): vérification (référence comparative W/B 1950)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 juin 2026",
    method:
      "Comparaison automatisée champ par champ entre le texte extrait d'un EPUB local de l'édition publiée et le texte servi par l'app.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "Final : 514/514 champs correspondants (100 %).",
    statusKind: "superseded",
    statusLabel: "Obsolète.",
    currentStatusNote: "Référence croisée comparative vis-à-vis de la version anglaise Wilhelm/Baynes de 1950, conservée à titre historique. La source oraculaire de l'application est la première édition imprimée (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: vérification initiale",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 juin 2026",
    method: "Comparaison automatisée champ par champ contre cette édition publiée.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result:
      "Final : 514/514 champs correspondants (100 %). Passe intermédiaire le 21 juin : 77.19 % → final : 100 % après corrections du parser et du gold, vérifiés directement contre cette édition publiée.",
    statusKind: "superseded",
    statusLabel: "Obsolète.",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: vérification (édition publiée)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 juin 2026",
    method:
      "Comparaison automatisée champ par champ entre le texte extrait d'un EPUB local de l'édition publiée et le texte servi par l'app.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "Final : 514/514 champs correspondants (100 %).",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: vérification initiale",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 juin 2026",
    method:
      "Le dataset de l'app avait été construit à partir d'une source autre que ctext.org. Une première comparaison automatisée champ par champ a détecté des glyphes erronés et dupliqués dans ce dataset (hex 31 咸/鹹 ; collision d'étiquette hex 19). Le bundle a été rechargé depuis ctext.org et re-vérifié le même jour.",
    standardCompared: "卦辭, 大象 et les 6 traits des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result:
      "Final : 514/514 champs correspondants (100 %). Passe intermédiaire le 21 juin : 90.66 % → final : 100 % après rechargement et correction du parser.",
    statusKind: "superseded",
    statusLabel: "Obsolète.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: deuxième vérification",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 juin 2026",
    method:
      "Re-exécution indépendante de la comparaison champ par champ plus des vérifications dédiées de corruption de caractères et de glyphes dupliqués, les 22-23 juin 2026.",
    standardCompared: "卦辭, 大象 et les 6 traits des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "Final : 514/514 champs correspondants (100 %), avec zéro indicateur de corruption.",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "Richard Wilhelm (1924): vérification contre la première édition",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 juin 2026",
    method:
      "Comparaison champ par champ du texte oraculaire de l'app avec la première édition imprimée (Eugen Diederichs Verlag, Jena, 1924).",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 pour les hexagrammes 1 et 2 (514 champs au total).",
    result: "514/514 champs correspondants (100 %).",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "Un audit de champs post-vérification (W-08, juillet 2026) a identifié et corrigé 73 artefacts OCR dans le jeu de données Wilhelm 1924. Texte revérifié par rapport à la première édition imprimée après toutes les corrections.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Commentaires classiques: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 juin 2026",
    method:
      "Vérification automatisée des commentaires classiques par rapport à l'édition publiée Wilhelm/Baynes (1950), y compris le commentaire propre de Wilhelm et les Dix Ailes de Confucius.",
    standardCompared:
      "Commentaire propre de Wilhelm et notes des Dix Ailes de Confucius sur jugement, image et chaque ligne; bloc À propos de cet hexagramme; Words on the Text (hex 1-2 seulement); commentaire yong (hex 1-2 seulement). 64 hexagrammes.",
    result: "1920/1920 champs concordants (100%).",
    statusKind: "superseded",
    statusLabel: "Obsolète.",
    currentStatusNote: "Référence croisée comparative vis-à-vis des commentaires de la version anglaise Wilhelm/Baynes de 1950, conservée à titre historique. Le commentaire est tiré de la première édition imprimée (Diederichs, 1924).",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Commentaires classiques: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "24 juin 2026",
    method:
      "Vérification automatisée des commentaires classiques par rapport à l'édition publiée de James Legge (1882), y compris footnotes et le Grand Symbolisme de l'Appendice II.",
    standardCompared:
      "Footnotes (64 hexagrammes); glose d'image du Grand Symbolisme, Appendice II (64 hexagrammes); notes de Petit Symbolisme par ligne, Appendice II (présentes pour 6 des 64 hexagrammes dans l'édition de Legge).",
    result:
      "Footnotes et glose d'image du Grand Symbolisme entièrement couverts (64/64, 100 %); notes de Petit Symbolisme vérifiées pour chaque hexagramme où l'édition de Legge les inclut. Vérification PASS.",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "Commentaires classiques: Richard Wilhelm (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 juin 2026",
    method:
      "Comparaison champ par champ du texte de commentaire de l'app avec la première édition imprimée (Eugen Diederichs Verlag, Jena, 1924), couvrant le troisième livre (Die Kommentare), qui contient les notes propres de Wilhelm et sa traduction des Dix Ailes confucéennes pour les 64 hexagrammes.",
    standardCompared:
      "Commentaire propre de Wilhelm et les Dix Ailes confucéennes sur jugement, image et chaque trait; bloc À propos de cet hexagramme; Wen Yen (hexagrammes 1 et 2 uniquement); commentaire yong (hexagrammes 1 et 2 uniquement). 64 hexagrammes; 2 304 champs au total.",
    result: "2 304/2 304 champs concordants (100 %).",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "Un audit de champs post-vérification (W-08, juillet 2026) a identifié et corrigé 73 artefacts OCR dans le jeu de données Wilhelm 1924. Texte revérifié par rapport à la première édition imprimée après toutes les corrections.",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Règles des lignes changeantes: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "22 juin 2026",
    method:
      "Comparaison automatisée des règles de réduction de l'app par rapport au texte des règles publié, cas par cas.",
    standardCompared:
      "Les 9 cas de règle publiés pour réduire les lignes changeantes à un seul texte de trait gouvernant (0 à 6 lignes changeantes, plus 用九/用六).",
    result: "Final : 9/9 cas de règle correspondants (100 %).",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Règles des lignes changeantes: Zhu Xi (classique)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 juin 2026",
    method:
      "Comparaison automatisée des règles de réduction classiques de l'app par rapport au texte traduit des règles.",
    standardCompared:
      "Les cas de règle publiés pour réduire les lignes changeantes à un seul texte de trait gouvernant (0 à 6 lignes changeantes, plus 用九/用六).",
    result: "Final : 10/10 extraits de règle correspondants (100 %).",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "Trois pièces : vérification (édition publiée)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 juin 2026",
    method:
      "Vérification automatisée contre l'Annexe I, section 2, de l'édition publiée Wilhelm/Baynes (1950), sur les parcours automatique et manuel.",
    standardCompared:
      "Face inscrite = yin (2), revers = yang (3) ; traits 6, 7, 8, 9 et probabilités exactes 1/8, 3/8, 3/8, 1/8.",
    result: "Final : 3/3 contrôles approuvés (100 %).",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "Tiges de mil : vérification (édition publiée)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 juin 2026",
    method:
      "Vérification automatisée contre l'Annexe I, section 1, de l'édition publiée Wilhelm/Baynes (1950), sur les parcours automatique et manuel.",
    standardCompared:
      "Procédure en trois tours, correspondance restes-trait et probabilités 1/16, 5/16, 7/16, 3/16.",
    result:
      "Final : 6/6 contrôles approuvés (100 %). La distribution classique 1/16, 5/16, 7/16, 3/16 est exacte ; une simulation indépendante et littérale de la procédure physique diffère de moins de 1 %, un effet entièrement expliqué par le comptage des tiges en groupes de quatre, et non un écart.",
    statusKind: "current",
    statusLabel: "En vigueur à ce jour.",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "Trois pièces : vérification initiale",
    source: CITATIONS.nielsen,
    verificationDate: "19 mai 2026",
    method:
      "Démonstration combinatoire de la distribution 6/7/8/9 et simulation Monte Carlo dans les tests du moteur. Comparé aux exposés standard publiés (Nielsen 2003 ; Rutt 1996)",
    standardCompared:
      "Modèle de trois pièces équitables (chaque face 2 ou 3) : valeurs 6, 7, 8, 9 et probabilités 1/8, 3/8, 3/8, 1/8.",
    result: "Contrôles de distribution approuvés (combinatoire et Monte Carlo).",
    statusKind: "superseded",
    statusLabel: "Obsolète.",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "Tiges de mil : vérification initiale",
    source: CITATIONS.nielsen,
    verificationDate: "19 mai 2026",
    method:
      "Démonstration mathématique de la correspondance restes-trait et simulation Monte Carlo (16 000 tirages). Comparé aux tables de probabilité publiées (Nielsen 2003 ; Rutt 1996)",
    standardCompared:
      "Distribution 1/16, 5/16, 7/16, 3/16 ; l'assistant manuel n'accepte que 5/9 et 4/8 par tour.",
    result: "Contrôles de distribution et de correspondance manuelle approuvés.",
    statusKind: "superseded",
    statusLabel: "Obsolète.",
    currentStatusNote: "",
  },
];

const BLOCKS_DE: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): erste Verifikation (Vergleich W/B 1950)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21. Juni 2026",
    method:
      "Automatisierter Feld-für-Feld-Vergleich zwischen dem aus dem Mirror extrahierten Text und dem von der App ausgelieferten Text.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich der Sondertexte 用九/用六 für Hexagramm 1 und 2 (514 Felder insgesamt).",
    result:
      "Final: 514/514 Felder übereinstimmend (100 %). Zwischenstände: 94.94 % → 99.81 % → 100 %; die letzten 6 Felder wurden aus der gedruckten Ausgabe ergänzt, wo der Web-Mirror Lücken hatte.",
    statusKind: "superseded",
    statusLabel: "Obsolet.",
    currentStatusNote: "Vergleichsreferenz gegen die englische Wilhelm/Baynes-Fassung von 1950, aufbewahrt für die historische Vollständigkeit. Die Orakelquelle der App ist die erste Druckausgabe (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): Verifikation (Vergleichsreferenz W/B 1950)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23. Juni 2026",
    method:
      "Automatisierter Feld-für-Feld-Vergleich zwischen aus einem lokalen EPUB der veröffentlichten Ausgabe extrahiertem Text und dem von der App ausgelieferten Text.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "Final: 514/514 Felder übereinstimmend (100 %).",
    statusKind: "superseded",
    statusLabel: "Obsolet.",
    currentStatusNote: "Vergleichsreferenz gegen die englische Wilhelm/Baynes-Fassung von 1950, aufbewahrt für die historische Vollständigkeit. Die Orakelquelle der App ist die erste Druckausgabe (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: erste Verifikation",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21. Juni 2026",
    method: "Automatisierter Feld-für-Feld-Vergleich gegen diese veröffentlichte Ausgabe.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result:
      "Final: 514/514 Felder übereinstimmend (100 %). Zwischenstand am 21. Juni: 77.19 % → final: 100 % nach Parser- und Gold-Korrekturen, direkt gegen diese veröffentlichte Ausgabe verifiziert.",
    statusKind: "superseded",
    statusLabel: "Obsolet.",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: Verifikation (veröffentlichte Ausgabe)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23. Juni 2026",
    method:
      "Automatisierter Feld-für-Feld-Vergleich zwischen aus einem lokalen EPUB der veröffentlichten Ausgabe extrahiertem Text und dem von der App ausgelieferten Text.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "Final: 514/514 Felder übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: erste Verifikation",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21. Juni 2026",
    method:
      "Das App-Dataset war zuvor aus einer Nicht-ctext-Quelle aufgebaut worden. Ein erster automatisierter Feld-für-Feld-Vergleich erkannte falsche und doppelte Glyphen in diesem Dataset (Hex 31 咸/鹹; Bezeichnungskollision Hex 19). Das Bundle wurde aus ctext.org neu geladen und am selben Tag erneut verifiziert.",
    standardCompared: "卦辭, 大象 und die 6 Linien aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result:
      "Final: 514/514 Felder übereinstimmend (100 %). Zwischenstand am 21. Juni: 90.66 % → final: 100 % nach Neuladen und Parser-Korrektur.",
    statusKind: "superseded",
    statusLabel: "Obsolet.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: zweite Verifikation",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23. Juni 2026",
    method:
      "Unabhängiger erneuter Lauf des Feld-für-Feld-Vergleichs plus dedizierter Prüfungen auf Zeichenkorruption und doppelte Glyphen, am 22.-23. Juni 2026.",
    standardCompared: "卦辭, 大象 und die 6 Linien aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "514/514 Felder übereinstimmend (100 %), mit null Korruptionsflags.",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "Richard Wilhelm (1924): Verifikation gegen die erste Ausgabe",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30. Juni 2026",
    method:
      "Feld-für-Feld-Vergleich des Orakeltexts der App mit der ersten Druckausgabe (Eugen Diederichs Verlag, Jena, 1924).",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 für Hexagramm 1 und 2 (514 Felder insgesamt).",
    result: "514/514 Felder übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "Eine Feldprüfung nach der Verifikation (W-08, Juli 2026) identifizierte und korrigierte 73 OCR-Artefakte im Wilhelm-1924-Datensatz. Text nach allen Korrekturen gegen die erste Druckausgabe nachgeprüft.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Klassische Kommentare: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24. Juni 2026",
    method:
      "Automatisierte Verifikation der klassischen Kommentare gegen die veröffentlichte Ausgabe Wilhelm/Baynes (1950), einschließlich Wilhelms eigener Anmerkungen und Konfuzius' Zehn Flügel.",
    standardCompared:
      "Wilhelms eigener Kommentar und Konfuzius' Zehn-Flügel-Noten zu Urteil, Bild und jeder Linie; Block Über dieses Hexagramm; Words on the Text (nur Hex 1-2); yong-Kommentar (nur Hex 1-2). 64 Hexagramme.",
    result: "1920/1920 Felder übereinstimmend (100%).",
    statusKind: "superseded",
    statusLabel: "Obsolet.",
    currentStatusNote: "Vergleichsreferenz gegen den Kommentar der englischen Wilhelm/Baynes-Fassung von 1950, aufbewahrt für die historische Vollständigkeit. Der Kommentar entstammt der ersten Druckausgabe (Diederichs, 1924).",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Klassische Kommentare: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "24. Juni 2026",
    method:
      "Automatisierte Verifikation der klassischen Kommentare gegen die veröffentlichte Ausgabe von James Legge (1882), einschließlich Footnotes und Große Symbolik des Anhangs II.",
    standardCompared:
      "Footnotes (64 Hexagramme); Große-Symbolik-Bildglosse, Anhang II (64 Hexagramme); Kleinere-Symbolik-Liniennoten, Anhang II (vorhanden für 6 von 64 Hexagrammen in Legges Ausgabe).",
    result:
      "Footnotes und Große-Symbolik-Bildglosse vollständig abgedeckt (64/64, 100 %); Kleinere-Symbolik-Liniennoten für jedes Hexagramm verifiziert, in dem Legges Ausgabe sie enthält. Verifikation PASS.",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "Klassische Kommentare: Richard Wilhelm (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30. Juni 2026",
    method:
      "Feld-für-Feld-Vergleich des Kommentartexts der App mit der ersten Druckausgabe (Eugen Diederichs Verlag, Jena, 1924), die das dritte Buch (Die Kommentare) umfasst, das Wilhelms eigene Anmerkungen und seine Übertragung der konfuzianischen Zehn Flügel für alle 64 Hexagramme enthält.",
    standardCompared:
      "Wilhelms eigener Kommentar und die Zehn-Flügel-Noten zu Urteil, Bild und jeder Linie; Block Über dieses Hexagramm; Wen Yen (nur Hexagramm 1 und 2); yong-Kommentar (nur Hexagramm 1 und 2). 64 Hexagramme; 2.304 Felder insgesamt.",
    result: "2.304/2.304 Felder übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "Eine Feldprüfung nach der Verifikation (W-08, Juli 2026) identifizierte und korrigierte 73 OCR-Artefakte im Wilhelm-1924-Datensatz. Text nach allen Korrekturen gegen die erste Druckausgabe nachgeprüft.",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regeln für wechselnde Linien: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "22. Juni 2026",
    method: "Automatisierter Vergleich der Reduktionsregeln der App gegen den veröffentlichten Regeltext, Fall für Fall.",
    standardCompared:
      "Die 9 veröffentlichten Regelfälle zur Reduktion wechselnder Linien auf einen einzigen maßgebenden Linientext (0 bis 6 wechselnde Linien, plus 用九/用六).",
    result: "Final: 9/9 Regelfälle übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regeln für wechselnde Linien: Zhu Xi (klassisch)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22. Juni 2026",
    method:
      "Automatisierter Vergleich der klassischen Reduktionsregeln der App gegen den übersetzten Regeltext.",
    standardCompared:
      "Die veröffentlichten Regelfälle zur Reduktion wechselnder Linien auf einen einzigen maßgebenden Linientext (0 bis 6 wechselnde Linien, plus 用九/用六).",
    result: "Final: 10/10 Regelausschnitte übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "Drei Münzen: Verifikation (veröffentlichte Ausgabe)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25. Juni 2026",
    method:
      "Automatisierte Verifikation gegen Anhang I, Abschnitt 2, der veröffentlichten Wilhelm/Baynes-Ausgabe (1950), automatisch und manuell.",
    standardCompared:
      "Prägeseite = Yin (2), Rückseite = Yang (3); Linien 6, 7, 8, 9 und exakte Wahrscheinlichkeiten 1/8, 3/8, 3/8, 1/8.",
    result: "Final: 3/3 Prüfungen bestanden (100 %).",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "Schafgarben-Stäbchen: Verifikation (veröffentlichte Ausgabe)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25. Juni 2026",
    method:
      "Automatisierte Verifikation gegen Anhang I, Abschnitt 1, der veröffentlichten Wilhelm/Baynes-Ausgabe (1950), automatisch und manuell.",
    standardCompared:
      "Dreirundiges Verfahren, Rest-zu-Linie-Zuordnung und Wahrscheinlichkeiten 1/16, 5/16, 7/16, 3/16.",
    result:
      "Final: 6/6 Prüfungen bestanden (100 %). Die klassische Verteilung 1/16, 5/16, 7/16, 3/16 ist exakt; eine unabhängige, wörtliche Simulation des physischen Verfahrens weicht um weniger als 1 % ab, ein vollständig erklärter Effekt des Zählens der Stäbchen in Vierergruppen, keine Abweichung.",
    statusKind: "current",
    statusLabel: "Gültig zum Stichtag.",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "Drei Münzen: Erstverifikation",
    source: CITATIONS.nielsen,
    verificationDate: "19. Mai 2026",
    method:
      "Kombinatorischer Beweis der 6/7/8/9-Verteilung und Monte-Carlo-Simulation in Engine-Tests. Abgeglichen mit veröffentlichten Standarddarstellungen (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Faires Drei-Münzen-Modell (jede Seite 2 oder 3): Linienwerte 6, 7, 8, 9 und Wahrscheinlichkeiten 1/8, 3/8, 3/8, 1/8.",
    result: "Verteilungsprüfungen bestanden (Kombinatorik und Monte Carlo).",
    statusKind: "superseded",
    statusLabel: "Obsolet.",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "Schafgarben-Stäbchen: Erstverifikation",
    source: CITATIONS.nielsen,
    verificationDate: "19. Mai 2026",
    method:
      "Mathematischer Beweis der Rest-zu-Linie-Zuordnung und Monte-Carlo-Simulation (16.000 Versuche). Abgeglichen mit veröffentlichten Wahrscheinlichkeitstabellen (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Verteilung 1/16, 5/16, 7/16, 3/16; manueller Assistent akzeptiert nur 5/9 und 4/8 pro Runde.",
    result: "Verteilungs- und manuelle Zuordnungsprüfungen bestanden.",
    statusKind: "superseded",
    statusLabel: "Obsolet.",
    currentStatusNote: "",
  },
];

const BLOCKS_IT: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): verifica iniziale (comparativo W/B 1950)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 giugno 2026",
    method:
      "Confronto automatizzato campo per campo tra il testo estratto dal mirror e il testo servito dall'app.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, inclusi i testi speciali 用九/用六 per gli esagrammi 1 e 2 (514 campi totali).",
    result:
      "Final: 514/514 campi corrispondenti (100%), passaggi intermedi: 94.94% → 99.81% → 100%; gli ultimi 6 campi sono stati completati dall'edizione stampata dove il mirror web aveva lacune.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Riferimento incrociato comparativo rispetto alla versione inglese Wilhelm/Baynes del 1950, conservato per completezza storica. La fonte oraculare dell'app è la prima edizione a stampa (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): verifica (riferimento comparativo W/B 1950)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 giugno 2026",
    method:
      "Confronto automatizzato campo per campo tra il testo estratto da un EPUB locale dell'edizione pubblicata e il testo servito dall'app.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "Final: 514/514 campi corrispondenti (100%).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Riferimento incrociato comparativo rispetto alla versione inglese Wilhelm/Baynes del 1950, conservato per completezza storica. La fonte oraculare dell'app è la prima edizione a stampa (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: verifica iniziale",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 giugno 2026",
    method: "Confronto automatizzato campo per campo rispetto a questa edizione pubblicata.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result:
      "Final: 514/514 campi corrispondenti (100%). Passaggio intermedio il 21 giugno: 77.19% → final: 100% dopo correzioni del parser e gold, verificati direttamente rispetto a questa edizione pubblicata.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: verifica (edizione pubblicata)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 giugno 2026",
    method:
      "Confronto automatizzato campo per campo tra il testo estratto da un EPUB locale dell'edizione pubblicata e il testo servito dall'app.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "Final: 514/514 campi corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: verifica iniziale",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 giugno 2026",
    method:
      "Il dataset dell'app era stato costruito da una fonte diversa da ctext.org. Un primo confronto automatizzato campo per campo ha rilevato glifi errati e duplicati in quel dataset (hex 31 咸/鹹; collisione etichetta hex 19). Il bundle è stato ricaricato da ctext.org e ri-verificato lo stesso giorno.",
    standardCompared: "卦辭, 大象 e le 6 linee di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result:
      "Final: 514/514 campi corrispondenti (100%). Passaggio intermedio il 21 giugno: 90.66% → final: 100% dopo ricaricamento e correzione del parser.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: seconda verifica",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 giugno 2026",
    method:
      "Riesecuzione indipendente del confronto campo per campo più verifiche dedicate per la corruzione dei caratteri e i glifi duplicati, il 22-23 giugno 2026.",
    standardCompared: "卦辭, 大象 e le 6 linee di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "514/514 campi corrispondenti (100%), con zero indicatori di corruzione.",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "Richard Wilhelm (1924): verifica contro la prima edizione",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 giugno 2026",
    method:
      "Confronto campo per campo del testo oracolare dell'app con la prima edizione a stampa (Eugen Diederichs Verlag, Jena, 1924).",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 per gli esagrammi 1 e 2 (514 campi totali).",
    result: "514/514 campi corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "Un audit di campo post-verifica (W-08, luglio 2026) ha identificato e corretto 73 artefatti OCR nel dataset Wilhelm 1924. Testo riverificato rispetto alla prima edizione a stampa dopo tutte le correzioni.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Commenti classici: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 giugno 2026",
    method:
      "Verifica automatizzata dei commenti classici rispetto all'edizione pubblicata Wilhelm/Baynes (1950), inclusi il commento proprio di Wilhelm e le Dieci Ali di Confucio.",
    standardCompared:
      "Commento proprio di Wilhelm e note delle Dieci Ali di Confucio su giudizio, immagine e ogni linea; blocco Informazioni su questo esagramma; Words on the Text (solo hex 1-2); commento yong (solo hex 1-2). 64 esagrammi.",
    result: "1920/1920 campi coincidenti (100%).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "Riferimento incrociato comparativo rispetto ai commenti della versione inglese Wilhelm/Baynes del 1950, conservato per completezza storica. Il commento è tratto dalla prima edizione a stampa (Diederichs, 1924).",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Commenti classici: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "24 giugno 2026",
    method:
      "Verifica automatizzata dei commenti classici rispetto all'edizione pubblicata di James Legge (1882), inclusi footnotes e Grande Simbolismo dell'Appendice II.",
    standardCompared:
      "Footnotes (64 esagrammi); glossa dell'immagine del Grande Simbolismo, Appendice II (64 esagrammi); note di Simbolismo minore per linea, Appendice II (presenti per 6 dei 64 esagrammi nell'edizione di Legge).",
    result:
      "Footnotes e glossa dell'immagine del Grande Simbolismo completamente coperti (64/64, 100%); note di Simbolismo minore verificate per ogni esagramma in cui l'edizione di Legge le include. Verifica PASS.",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "Commenti classici: Richard Wilhelm (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 giugno 2026",
    method:
      "Confronto campo per campo del testo di commento dell'app con la prima edizione a stampa (Eugen Diederichs Verlag, Jena, 1924), che comprende il terzo libro (Die Kommentare), contenente le note proprie di Wilhelm e la sua traduzione delle Dieci Ali confuciane per tutti i 64 esagrammi.",
    standardCompared:
      "Commento proprio di Wilhelm e le note delle Dieci Ali confuciane su giudizio, immagine e ogni linea; blocco Informazioni su questo esagramma; Wen Yen (solo esagrammi 1 e 2); commento yong (solo esagrammi 1 e 2). 64 esagrammi; 2.304 campi in totale.",
    result: "2.304/2.304 campi corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "Un audit di campo post-verifica (W-08, luglio 2026) ha identificato e corretto 73 artefatti OCR nel dataset Wilhelm 1924. Testo riverificato rispetto alla prima edizione a stampa dopo tutte le correzioni.",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regole delle linee mutanti: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "22 giugno 2026",
    method: "Confronto automatizzato delle regole di riduzione dell'app rispetto al testo delle regole pubblicato, caso per caso.",
    standardCompared:
      "I 9 casi di regola pubblicati per ridurre le linee mutanti a un unico testo di linea governante (da 0 a 6 linee mutanti, più 用九/用六).",
    result: "Final: 9/9 casi di regola corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regole delle linee mutanti: Zhu Xi (classico)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 giugno 2026",
    method:
      "Confronto automatizzato delle regole di riduzione classiche dell'app rispetto al testo tradotto delle regole.",
    standardCompared:
      "I casi di regola pubblicati per ridurre le linee mutanti a un unico testo di linea governante (da 0 a 6 linee mutanti, più 用九/用六).",
    result: "Final: 10/10 estratti di regola corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "Tre monete: verifica (edizione pubblicata)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 giu 2026",
    method:
      "Verifica automatizzata contro l'Appendice I, sezione 2, dell'edizione pubblicata Wilhelm/Baynes (1950), su percorsi automatico e manuale.",
    standardCompared:
      "Faccia incisa = yin (2), retro = yang (3); linee 6, 7, 8, 9 e probabilità esatte 1/8, 3/8, 3/8, 1/8.",
    result: "Finale: 3/3 controlli approvati (100%).",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "Steli di miglio: verifica (edizione pubblicata)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 giu 2026",
    method:
      "Verifica automatizzata contro l'Appendice I, sezione 1, dell'edizione pubblicata Wilhelm/Baynes (1950), su percorsi automatico e manuale.",
    standardCompared:
      "Procedura a tre round, mappatura resti-linea e probabilità 1/16, 5/16, 7/16, 3/16.",
    result:
      "Finale: 6/6 controlli approvati (100%). La distribuzione classica 1/16, 5/16, 7/16, 3/16 è esatta; una simulazione indipendente e letterale della procedura fisica differisce di meno dell'1%, un effetto interamente spiegato dal conteggio degli steli in gruppi di quattro, non una discrepanza.",
    statusKind: "current",
    statusLabel: "Vigente alla data.",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "Tre monete: verifica iniziale",
    source: CITATIONS.nielsen,
    verificationDate: "19 mag 2026",
    method:
      "Dimostrazione combinatoria della distribuzione 6/7/8/9 e simulazione Monte Carlo nei test del motore. Confrontato con resoconti standard pubblicati (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Modello di tre monete eque (ogni lato 2 o 3): valori 6, 7, 8, 9 e probabilità 1/8, 3/8, 3/8, 1/8.",
    result: "Controlli di distribuzione approvati (combinatoria e Monte Carlo).",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "Steli di miglio: verifica iniziale",
    source: CITATIONS.nielsen,
    verificationDate: "19 mag 2026",
    method:
      "Dimostrazione matematica della mappatura resti-linea e simulazione Monte Carlo (16.000 prove). Confrontato con tabelle di probabilità pubblicate (Nielsen 2003; Rutt 1996)",
    standardCompared:
      "Distribuzione 1/16, 5/16, 7/16, 3/16; l'assistente manuale accetta solo 5/9 e 4/8 per round.",
    result: "Controlli di distribuzione e mappatura manuale approvati.",
    statusKind: "superseded",
    statusLabel: "Obsoleto.",
    currentStatusNote: "",
  },
];

const BLOCKS_JA: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): 初回照合 (W/B 1950 比較参照)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "2026年6月21日",
    method:
      "ミラーから抽出したテキストとアプリが提供するテキストとの間で、自動化されたフィールド単位の比較を実施。",
    standardCompared:
      "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、および卦1・卦2の特殊テキスト用九/用六を含む、合計514フィールド。",
    result:
      "最終: 514/514フィールドが一致（100%）。中間結果: 94.94% → 99.81% → 100%; Webミラーに欠けていた最後の6フィールドは印刷版で補完。",
    statusKind: "superseded",
    statusLabel: "廃止。",
    currentStatusNote: "1950年英訳（Wilhelm/Baynes）との比較照合として記録を保持しています。アプリのオラクルソースは初版刊行本（Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag）です。",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): 検証（W/B 1950 比較参照）",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月23日",
    method:
      "出版版のローカルEPUBから抽出したテキストとアプリが提供するテキストとの間で、自動化されたフィールド単位の比較を実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result: "最終: 514/514フィールドが一致（100%）。",
    statusKind: "superseded",
    statusLabel: "廃止。",
    currentStatusNote: "1950年英訳（Wilhelm/Baynes）との比較照合として記録を保持しています。アプリのオラクルソースは初版刊行本（Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag）です。",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: 初回検証",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "2026年6月21日",
    method: "自動化されたフィールド単位の比較を、この出版版に対して実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result:
      "最終: 514/514フィールドが一致（100%）。6月21日の中間結果: 77.19% → 最終: 100%（パーサーとゴールドの修正後、この出版版に直接照合して検証）。",
    statusKind: "superseded",
    statusLabel: "廃止。",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: 検証（出版版）",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026年6月23日",
    method:
      "出版版のローカルEPUBから抽出したテキストとアプリが提供するテキストとの間で、自動化されたフィールド単位の比較を実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result: "最終: 514/514フィールドが一致（100%）。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "周易: 初回検証",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月21日",
    method:
      "アプリのデータセットはctext.org以外のソースから構築されていました。初回の自動化されたフィールド単位の比較で、そのデータセット内の誤字・重複字形を検出（卦31 咸/鹹; 卦19のラベル衝突）。バンドルをctext.orgから再読み込みし、同日に再検証。",
    standardCompared: "全64卦の卦辭、大象、6本の爻、用九/用六を含む、合計514フィールド。",
    result:
      "最終: 514/514フィールドが一致（100%）。6月21日の中間結果: 90.66% → 最終: 100%（再読み込みとパーサー修正後）。",
    statusKind: "superseded",
    statusLabel: "廃止。",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "周易: 第二回検証",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月23日",
    method:
      "2026年6月22-23日に、フィールド単位の比較の独立再実行と、文字破損および重複字形を検出する専用チェックを実施。",
    standardCompared: "全64卦の卦辭、大象、6本の爻、用九/用六を含む、合計514フィールド。",
    result: "最終: 514/514フィールドが一致（100%）、破損フラグゼロ。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "リヒャルト・ヴィルヘルム（1924年）: 初版との照合",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "2026年6月30日",
    method:
      "初版刊行本（Eugen Diederichs Verlag、イェーナ、1924年）に対するアプリのオラクルテキストのフィールド単位の比較。",
    standardCompared:
      "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、卦1・卦2の用九/用六を含む、合計514フィールド。",
    result: "514/514フィールドが一致（100%）。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "事後フィールド審査W-08（2026年7月）により、Wilhelm 1924データセット内のOCRアーティファクト73件を特定・修正しました。すべての修正後、初版印刷版に対してテキストを再検証済み。",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "古典注釈: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月24日",
    method:
      "古典注釈を、出版版Wilhelm/Baynes（1950）と照合する自動検証。ウィルヘルム自身の注と孔子の十翼注釈を含む。",
    standardCompared:
      "ウィルヘルム自身の注釈と孔子の十翼による卦辞・象辞・各爻への注；この卦についてブロック；Words on the Text（卦1-2のみ）；用の注釈（卦1-2のみ）。64卦。",
    result: "1920/1920フィールド一致（100%）。",
    statusKind: "superseded",
    statusLabel: "廃止。",
    currentStatusNote: "1950年英訳（Wilhelm/Baynes）の注釈との比較照合として記録を保持しています。注釈は初版刊行本（Diederichs、1924年）から取得しています。",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "古典注釈: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026年6月24日",
    method:
      "古典注釈を、出版版James Legge（1882）と照合する自動検証。脚注と付録II大象伝を含む。",
    standardCompared:
      "脚注（64卦）；大象伝の象解、付録II（64卦）；小象伝の各爻注、付録II（レッジ版では64卦中6卦のみ収録）。",
    result:
      "脚注と大象伝の象解は完全カバー（64/64、100%）；小象伝の各爻注はレッジ版に収録されている卦すべてで検証済み。検証PASS。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "古典注釈: リヒャルト・ヴィルヘルム（1924年）",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "2026年6月30日",
    method:
      "初版刊行本（Eugen Diederichs Verlag、イェーナ、1924年）に対するアプリの注釈テキストのフィールド単位の比較。対象は第三書（Die Kommentare）全体で、ヴィルヘルム自身の注釈と64卦すべてに対する十翼の訳を含む。",
    standardCompared:
      "ヴィルヘルム自身の注釈と十翼による卦辞・象辞・各爻への注；この卦についてブロック；Wen Yen（卦1・卦2のみ）；用九/用六の注釈（卦1・卦2のみ）。64卦；合計2,304フィールド。",
    result: "2,304/2,304フィールドが一致（100%）。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "事後フィールド審査W-08（2026年7月）により、Wilhelm 1924データセット内のOCRアーティファクト73件を特定・修正しました。すべての修正後、初版印刷版に対してテキストを再検証済み。",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "変爻ルール: アルフレッド・ホアン",
    source: CITATIONS.huang,
    verificationDate: "2026年6月22日",
    method: "アプリの還元ルールを公開されたルールテキストと照合する、自動化された比較をケースごとに実施。",
    standardCompared:
      "変爻を単一の支配的な爻テキストに還元するための、公開された9つのルールケース（変爻0本から6本、および用九/用六）。",
    result: "最終: 9/9のルールケースが一致（100%）。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "変爻ルール: 朱熹（古典）",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "2026年6月22日",
    method: "アプリの古典的な還元ルールを翻訳されたルールテキストと照合する、自動化された比較を実施。",
    standardCompared:
      "変爻を単一の支配的な爻テキストに還元するための公開ルールケース（変爻0本から6本、および用九/用六）。",
    result: "最終: 10/10のルール抜粋が一致（100%）。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "三枚コイン：検証（刊行版）",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月25日",
    method:
      "Wilhelm/Baynes（1950）刊行版付録I第2節に対する自動検証（自動・手動ルート）。",
    standardCompared:
      "刻印面＝陰（2）、裏面＝陽（3）；爻6・7・8・9と確率1/8、3/8、3/8、1/8。",
    result: "最終：3/3チェック合格（100%）。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "蓍草法：検証（刊行版）",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月25日",
    method:
      "Wilhelm/Baynes（1950）刊行版付録I第1節に対する自動検証（自動・手動ルート）。",
    standardCompared:
      "三回の手順、余りから爻への対応、確率1/16、5/16、7/16、3/16。",
    result:
      "最終：6/6チェック合格（100%）。古典的な1/16、5/16、7/16、3/16の分布は正確であり、物理的な手順を文字どおりに再現した独立シミュレーションとの差は1%未満で、これは蓍草を4本ずつ束ねて数える方法に起因することが完全に説明済みの効果であり、不一致ではない。",
    statusKind: "current",
    statusLabel: "現時点で有効。",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "三枚コイン：初回検証",
    source: CITATIONS.nielsen,
    verificationDate: "2026年5月19日",
    method:
      "6/7/8/9分布の組合せ論的証明とエンジンテストでのモンテカルロシミュレーション。公表された標準説明（Nielsen 2003；Rutt 1996）と照合",
    standardCompared:
      "公平な三枚コインモデル（各面2または3）：爻6・7・8・9と確率1/8、3/8、3/8、1/8。",
    result: "分布チェック合格（組合せ論とモンテカルロ）",
    statusKind: "superseded",
    statusLabel: "廃止。",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "蓍草法：初回検証",
    source: CITATIONS.nielsen,
    verificationDate: "2026年5月19日",
    method:
      "余りから爻への対応の数学的証明とモンテカルロシミュレーション（16,000回）。公表された確率表（Nielsen 2003；Rutt 1996）と照合",
    standardCompared:
      "分布1/16、5/16、7/16、3/16；手動ウィザードは各ラウンド5/9と4/8のみ受理。",
    result: "分布および手動対応チェック合格。",
    statusKind: "superseded",
    statusLabel: "廃止。",
    currentStatusNote: "",
  },
];

const BLOCKS_ZH: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "卫礼贤 (1924): 初步交叉核验 (W/B 1950 比较参照)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "2026年6月21日",
    method: "在从镜像站提取的文本与应用提供的文本之间进行自动化逐字段比对。",
    standardCompared:
      "全部64卦的卦辭、象辭，以及6条爻辭，包括卦1、卦2的特殊文本用九/用六（共514个字段）。",
    result:
      "最终: 514/514个字段一致（100%）。中间结果: 94.94% → 99.81% → 100%；最后6个字段从印刷版补全，因网页镜像存在空缺。",
    statusKind: "superseded",
    statusLabel: "已废止。",
    currentStatusNote: "作为与1950年英译本（卫礼贤/贝恩斯）的对照参考予以保留，以供历史完整性参考。本应用的卦辞来源为初版印刷版（Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag）。",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "卫礼贤 (1924): 验证（W/B 1950 比较参照）",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月23日",
    method:
      "在出版版本地EPUB提取的文本与应用提供的文本之间进行自动化逐字段比对。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "最终: 514/514个字段一致（100%）。",
    statusKind: "superseded",
    statusLabel: "已废止。",
    currentStatusNote: "作为与1950年英译本（卫礼贤/贝恩斯）的对照参考予以保留，以供历史完整性参考。本应用的卦辞来源为初版印刷版（Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag）。",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "理雅各: 初步验证",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "2026年6月21日",
    method: "针对本出版版进行自动化逐字段比对。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result:
      "最终: 514/514个字段一致（100%）。6月21日中间结果: 77.19% → 最终: 100%（经解析器与黄金标准修正后，直接对照该出版版验证）。",
    statusKind: "superseded",
    statusLabel: "已废止。",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "理雅各: 验证（出版版）",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026年6月23日",
    method:
      "在出版版本地EPUB提取的文本与应用提供的文本之间进行自动化逐字段比对。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "最终: 514/514个字段一致（100%）。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "周易: 初步验证",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月21日",
    method:
      "应用数据集此前来自 ctext.org 以外的来源。首次自动化逐字段比对在该数据集中发现错误和重复字形（卦31 咸/鹹；卦19标签冲突）。数据集从 ctext.org 重新加载并于同日再验证。",
    standardCompared: "全部64卦的卦辭、大象，以及6条爻辭，包括用九/用六（共514个字段）。",
    result:
      "最终: 514/514个字段一致（100%）。6月21日中间结果: 90.66% → 最终: 100%（重新加载与解析器修正后）。",
    statusKind: "superseded",
    statusLabel: "已废止。",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "周易: 第二次验证",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月23日",
    method:
      "2026年6月22-23日独立重跑逐字段比对，并执行专门的字符损坏与重复字形检测。",
    standardCompared: "全部64卦的卦辭、大象，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "最终: 514/514个字段一致（100%），损坏标记为零。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "卫礼贤（1924年）: 对照初版验证",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "2026年6月30日",
    method:
      "将应用卦辞文本与初版印刷版（Eugen Diederichs Verlag，耶拿，1924年）进行逐字段比对。",
    standardCompared:
      "全部64卦的卦辭、象辭，以及6条爻辭，包括第1、2卦的用九/用六（共514个字段）。",
    result: "514/514个字段一致（100%）。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "事后字段审计W-08（2026年7月）在Wilhelm 1924数据集中识别并修正了73处OCR残留。所有修正完成后，已对照首版印刷版重新验证文本。",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "古典注释: 卫礼贤 (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月24日",
    method:
      "将古典注释与出版版卫礼贤/贝恩斯（1950）进行自动化验证，包括卫礼贤本人注释与孔子十翼注释。",
    standardCompared:
      "卫礼贤本人注释与孔子十翼对卦辞、象辞及六爻的注；关于此卦块；Words on the Text（仅第1-2卦）；用九/用六注释（仅第1-2卦）。64卦。",
    result: "1920/1920 字段一致（100%）。",
    statusKind: "superseded",
    statusLabel: "已废止。",
    currentStatusNote: "作为与1950年英译本（卫礼贤/贝恩斯）注释的对照参考予以保留。注释取自初版印刷版（Diederichs，1924年）。",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "古典注释: 理雅各",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026年6月24日",
    method:
      "将古典注释与出版版理雅各（1882）进行自动化验证，包括脚注与附录II大象传。",
    standardCompared:
      "脚注（64卦）；大象传象解，附录II（64卦）；小象传各爻注，附录II（理雅各版本中仅64卦中的6卦收录）。",
    result:
      "脚注与大象传象解已全覆盖（64/64，100%）；小象传各爻注已在理雅各版本收录的所有卦中验证。验证PASS。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "古典注释: 卫礼贤（1924年）",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "2026年6月30日",
    method:
      "将应用注释文本与初版印刷版（Eugen Diederichs Verlag，耶拿，1924年）进行逐字段比对，涵盖第三册（Die Kommentare），其中包含卫礼贤本人注释及其对所有64卦儒家十翼的翻译。",
    standardCompared:
      "卫礼贤本人注释与儒家十翼对卦辞、象辞及六爻的注；关于此卦块；Wen Yen（仅第1、2卦）；用九/用六注释（仅第1、2卦）。64卦；共2,304个字段。",
    result: "2,304/2,304个字段一致（100%）。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "事后字段审计W-08（2026年7月）在Wilhelm 1924数据集中识别并修正了73处OCR残留。所有修正完成后，已对照首版印刷版重新验证文本。",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "变爻规则: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "2026年6月22日",
    method: "逐条对比应用的简化规则与已发布的规则文本，进行自动化比对。",
    standardCompared: "已发布的9种规则情形，用于将变爻简化为单一的主导爻文本（0至6条变爻，加上用九/用六）。",
    result: "最终: 9/9个规则情形一致（100%）。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "变爻规则: 朱熹（古典）",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "2026年6月22日",
    method: "对比应用的古典简化规则与翻译后的规则文本，进行自动化比对。",
    standardCompared:
      "已发布的规则情形，用于将变爻简化为单一的主导爻文本（0至6条变爻，加上用九/用六）。",
    result: "最终: 10/10条规则摘录一致（100%）。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "三枚铜钱：验证（出版版）",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月25日",
    method:
      "对照 Wilhelm/Baynes（1950）出版版附录 I 第 2 节进行自动验证（自动与手动路径）。",
    standardCompared:
      "字面＝阴（2），背面＝阳（3）；爻 6、7、8、9 及精确概率 1/8、3/8、3/8、1/8。",
    result: "最终：3/3 项检查通过（100%）。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "蓍草法：验证（出版版）",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月25日",
    method:
      "对照 Wilhelm/Baynes（1950）出版版附录 I 第 1 节进行自动验证（自动与手动路径）。",
    standardCompared:
      "三轮程序、余数到爻的映射及概率 1/16、5/16、7/16、3/16。",
    result:
      "最终：6/6 项检查通过（100%）。经典的 1/16、5/16、7/16、3/16 分布是精确的；对物理操作过程进行的独立逐步模拟与之相差不到 1%，这是按四根一组数取蓍草这一计数方式所致的、已完全解释清楚的效应，并非不一致。",
    statusKind: "current",
    statusLabel: "截至本日有效。",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "三枚铜钱：初始验证",
    source: CITATIONS.nielsen,
    verificationDate: "2026年5月19日",
    method:
      "对 6/7/8/9 分布的组合证明及引擎测试中的蒙特卡罗模拟。对照已发表的标准论述（Nielsen 2003；Rutt 1996）",
    standardCompared:
      "公平三枚铜钱模型（每面 2 或 3）：爻值 6、7、8、9 及概率 1/8、3/8、3/8、1/8。",
    result: "分布检查通过（组合论与蒙特卡罗）",
    statusKind: "superseded",
    statusLabel: "已废止。",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "蓍草法：初始验证",
    source: CITATIONS.nielsen,
    verificationDate: "2026年5月19日",
    method:
      "余数到爻映射的数学证明及蒙特卡罗模拟（16,000 次）。对照已发表的概率表（Nielsen 2003；Rutt 1996）",
    standardCompared:
      "分布 1/16、5/16、7/16、3/16；手动向导每轮仅接受 5/9 与 4/8。",
    result: "分布与手动映射检查通过。",
    statusKind: "superseded",
    statusLabel: "已废止。",
    currentStatusNote: "",
  },
];

const BLOCKS_KO: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): 초기 교차 검토 (W/B 1950 비교 참조)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "2026년 6월 21일",
    method: "미러에서 추출한 텍스트와 앱이 제공하는 텍스트 간의 자동화된 필드별 비교 수행.",
    standardCompared:
      "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 그리고 괘 1과 2의 특수 텍스트 용구/용육(用九/用六)을 포함한 총 514개 필드.",
    result:
      "최종: 514/514개 필드 일치(100%). 중간 결과: 94.94% → 99.81% → 100%; 웹 미러에 빠져 있던 마지막 6개 필드는 인쇄판으로 보완.",
    statusKind: "superseded",
    statusLabel: "폐기됨.",
    currentStatusNote: "1950년 영어 번역본（Wilhelm/Baynes）과의 비교 대조 참고용으로 기록을 보관합니다. 앱의 오라클 출처는 초판 인쇄본（Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag）입니다.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): 검증 (W/B 1950 비교 참조)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026년 6월 23일",
    method:
      "출판판 로컬 EPUB에서 추출한 텍스트와 앱이 제공하는 텍스트 간의 자동화된 필드별 비교 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "최종: 514/514개 필드 일치(100%).",
    statusKind: "superseded",
    statusLabel: "폐기됨.",
    currentStatusNote: "1950년 영어 번역본（Wilhelm/Baynes）과의 비교 대조 참고용으로 기록을 보관합니다. 앱의 오라클 출처는 초판 인쇄본（Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag）입니다.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: 초기 검증",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "2026년 6월 21일",
    method: "자동화된 필드별 비교를 이 출판판에 대해 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result:
      "최종: 514/514개 필드 일치(100%). 6월 21일 중간 결과: 77.19% → 최종: 100% (파서 및 골드 수정 후, 이 출판판에 직접 대조하여 검증).",
    statusKind: "superseded",
    statusLabel: "폐기됨.",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: 검증 (출판판)",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026년 6월 23일",
    method:
      "출판판 로컬 EPUB에서 추출한 텍스트와 앱이 제공하는 텍스트 간의 자동화된 필드별 비교 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "최종: 514/514개 필드 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "주역: 초기 검증",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026년 6월 21일",
    method:
      "앱 데이터셋은 ctext.org가 아닌 다른 출처에서 구축되었습니다. 최초 자동화된 필드별 비교에서 해당 데이터셋의 잘못된·중복 자형을 검출(괘31 咸/鹹; 괘19 라벨 충돌). 데이터셋을 ctext.org에서 다시 불러와 같은 날 재검증.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 대상(大象), 6개 효, 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result:
      "최종: 514/514개 필드 일치(100%). 6월 21일 중간 결과: 90.66% → 최종: 100% (재로드 및 파서 수정 후).",
    statusKind: "superseded",
    statusLabel: "폐기됨.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "주역: 두 번째 검증",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026년 6월 23일",
    method:
      "2026년 6월 22-23일 필드별 비교의 독립 재실행과 문자 손상 및 중복 자형을 검사하는 전용 점검을 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 대상(大象), 6개 효, 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "최종: 514/514개 필드 일치(100%), 손상 플래그 0건.",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "Wilhelm (1924): 초판 대조 검증",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "2026년 6월 30일",
    method:
      "앱의 오라클 텍스트를 초판 인쇄본(Eugen Diederichs Verlag, 예나, 1924년)과 필드별로 비교.",
    standardCompared:
      "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 괘 1과 2의 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "514/514개 필드 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "사후 필드 감사 W-08 (2026년 7월)에서 Wilhelm 1924 데이터셋의 OCR 아티팩트 73건을 식별 및 수정했습니다. 모든 수정 후 초판 인쇄본과 텍스트를 재검증했습니다.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "고전 주석: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026년 6월 24일",
    method:
      "고전 주석을 출판판 Wilhelm/Baynes(1950)과 대조하는 자동 검증. Wilhelm 자신의 주석과 공자의 십익 주석 포함.",
    standardCompared:
      "Wilhelm 자신의 주석과 공자 십익의 괘사·상사·각 효 주석; 이 괘에 대하여 블록; Words on the Text(1-2괴만); 용 주석(1-2괴만). 64괴.",
    result: "1920/1920 필드 일치(100%).",
    statusKind: "superseded",
    statusLabel: "폐기됨.",
    currentStatusNote: "1950년 영어 번역본（Wilhelm/Baynes）의 주석과의 비교 대조 참고용으로 보관합니다. 주석은 초판 인쇄본（Diederichs, 1924년）에서 가져온 것입니다.",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "고전 주석: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026년 6월 24일",
    method:
      "고전 주석을 출판판 James Legge(1882)와 대조하는 자동 검증. 각주와 부록 II 대상전 포함.",
    standardCompared:
      "각주(64괴); 대상전 상 해설, 부록 II(64괴); 소상전 효별 주석, 부록 II(Legge판에서는 64괴 중 6괴에만 수록).",
    result:
      "각주와 대상전 상 해설은 완전 커버(64/64, 100%); 소상전 효별 주석은 Legge판에 수록된 모든 괴에서 검증 완료. 검증 PASS.",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "고전 주석: Wilhelm (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "2026년 6월 30일",
    method:
      "앱의 주석 텍스트를 초판 인쇄본(Eugen Diederichs Verlag, 예나, 1924년)과 필드별로 비교. 64괘 전체에 대한 Wilhelm 자신의 주석과 유교 십익 번역을 담은 제3권(Die Kommentare) 전체를 대상으로 함.",
    standardCompared:
      "Wilhelm 자신의 주석과 십익의 괘사, 상사, 각 효 주석; 이 괘에 대하여 블록; Wen Yen(괘 1, 2만); 용 주석(괘 1, 2만). 64괘; 총 2,304개 필드.",
    result: "2,304/2,304개 필드 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "사후 필드 감사 W-08 (2026년 7월)에서 Wilhelm 1924 데이터셋의 OCR 아티팩트 73건을 식별 및 수정했습니다. 모든 수정 후 초판 인쇄본과 텍스트를 재검증했습니다.",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "변효 규칙: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "2026년 6월 22일",
    method: "앱의 축소 규칙을 공개된 규칙 텍스트와 사례별로 대조한 자동화된 비교 수행.",
    standardCompared:
      "변효를 단일한 지배 효 텍스트로 축소하기 위한 9가지 공개 규칙 사례(변효 0개부터 6개까지, 그리고 용구/용육 포함).",
    result: "최종: 9/9개 규칙 사례 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "변효 규칙: 주희(고전)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "2026년 6월 22일",
    method: "앱의 고전적 축소 규칙을 번역된 규칙 텍스트와 대조한 자동화된 비교 수행.",
    standardCompared:
      "변효를 단일한 지배 효 텍스트로 축소하기 위한 공개 규칙 사례(변효 0개부터 6개까지, 그리고 용구/용육 포함).",
    result: "최종: 10/10 규칙 발췌 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "세 동전: 검증(출판판)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026년 6월 25일",
    method:
      "Wilhelm/Baynes(1950) 출판판 부록 I 제2절에 대한 자동 검증(자동·수동 경로).",
    standardCompared:
      "앞면(음)=2, 뒷면(양)=3; 효 6·7·8·9 및 확률 1/8, 3/8, 3/8, 1/8.",
    result: "최종: 3/3 검사 통과(100%).",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "서초법: 검증(출판판)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026년 6월 25일",
    method:
      "Wilhelm/Baynes(1950) 출판판 부록 I 제1절에 대한 자동 검증(자동·수동 경로).",
    standardCompared:
      "3라운드 절차, 나머지-효 매핑, 확률 1/16, 5/16, 7/16, 3/16.",
    result:
      "최종: 6/6 검사 통과(100%). 고전적인 1/16, 5/16, 7/16, 3/16 분포는 정확하며, 물리적 절차를 문자 그대로 재현한 독립 시뮬레이션과의 차이는 1% 미만으로, 이는 서초를 네 개씩 묶어 세는 방식에서 비롯된 것임이 완전히 설명된 효과이지 불일치가 아니다.",
    statusKind: "current",
    statusLabel: "현재 기준 유효.",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "세 동전: 초기 검증",
    source: CITATIONS.nielsen,
    verificationDate: "2026년 5월 19일",
    method:
      "6/7/8/9 분포의 조합론적 증명 및 엔진 테스트 몬테카를로 시뮬레이션. 게재된 표준 서술(Nielsen 2003; Rutt 1996)과 대조",
    standardCompared:
      "공정한 세 동전 모델(각 면 2 또는 3): 효값 6·7·8·9 및 확률 1/8, 3/8, 3/8, 1/8.",
    result: "분포 검사 통과(조합론·몬테카를로).",
    statusKind: "superseded",
    statusLabel: "폐기됨.",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "서초법: 초기 검증",
    source: CITATIONS.nielsen,
    verificationDate: "2026년 5월 19일",
    method:
      "나머지-효 매핑의 수학적 증명 및 몬테카를로 시뮬레이션(16,000회). 게재된 확률표(Nielsen 2003; Rutt 1996)와 대조",
    standardCompared:
      "분포 1/16, 5/16, 7/16, 3/16; 수동 마법사는 라운드당 5/9·4/8만 허용.",
    result: "분포·수동 매핑 검사 통과.",
    statusKind: "superseded",
    statusLabel: "폐기됨.",
    currentStatusNote: "",
  },
];

const BLOCKS_AR: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): التحقق المتقاطع الأولي (مرجع W/B 1950 المقارن)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 يونيو 2026",
    method:
      "مقارنة تلقائية حقل بحقل بين النص المستخرج من المرآة والنص الذي يقدمه التطبيق.",
    standardCompared:
      "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك النصوص الخاصة 用九/用六 للهكساغرامين 1 و2 (514 حقلاً إجمالاً).",
    result:
      "نهائي: تطابق 514/514 حقلاً (100%)، مراحل وسيطة: 94.94% → 99.81% → 100%؛ اكتملت الحقول الستة الأخيرة من النسخة المطبوعة حيث كان للمرآة فراغات.",
    statusKind: "superseded",
    statusLabel: "مهمل.",
    currentStatusNote: "مرجع مقارن مقابل الترجمة الإنجليزية Wilhelm/Baynes عام 1950، محتفظ به لاستيفاء السجل التاريخي. مصدر الأوراكل في التطبيق هو الطبعة الأولى المطبوعة (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): التحقق (المرجع المقارن W/B 1950)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 يونيو 2026",
    method:
      "مقارنة تلقائية حقل بحقل بين نص مستخرج من EPUB محلي للنسخة المنشورة والنص الذي يقدمه التطبيق.",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "نهائي: تطابق 514/514 حقلاً (100%).",
    statusKind: "superseded",
    statusLabel: "مهمل.",
    currentStatusNote: "مرجع مقارن مقابل الترجمة الإنجليزية Wilhelm/Baynes عام 1950، محتفظ به لاستيفاء السجل التاريخي. مصدر الأوراكل في التطبيق هو الطبعة الأولى المطبوعة (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag).",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: التحقق الأولي",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 يونيو 2026",
    method: "مقارنة تلقائية حقل بحقل مقابل هذه النسخة المنشورة.",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result:
      "نهائي: تطابق 514/514 حقلاً (100%). مرحلة وسيطة في 21 يونيو: 77.19% → نهائي: 100% بعد تصحيحات المحلل والمرجع الذهبي، تم التحقق مباشرة مقابل هذه النسخة المنشورة.",
    statusKind: "superseded",
    statusLabel: "مهمل.",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: التحقق (النسخة المنشورة)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 يونيو 2026",
    method:
      "مقارنة تلقائية حقل بحقل بين نص مستخرج من EPUB محلي للنسخة المنشورة والنص الذي يقدمه التطبيق.",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "نهائي: تطابق 514/514 حقلاً (100%).",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: التحقق الأولي",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 يونيو 2026",
    method:
      "كانت مجموعة بيانات التطبيق قد بُنيت من مصدر غير ctext.org. أول مقارنة تلقائية حقل بحقل كشفت عن حروف خاطئة ومكررة في تلك المجموعة (هكس 31 咸/鹹؛ تصادم تسمية هكس 19). أُعيد تحميل الحزمة من ctext.org وأُعيد التحقق في اليوم نفسه.",
    standardCompared: "卦辭، 大象، والخطوط الستة لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result:
      "نهائي: تطابق 514/514 حقلاً (100%). مرحلة وسيطة في 21 يونيو: 90.66% → نهائي: 100% بعد إعادة التحميل وتصحيح المحلل.",
    statusKind: "superseded",
    statusLabel: "مهمل.",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: التحقق الثاني",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 يونيو 2026",
    method:
      "إعادة تشغيل مستقلة للمقارنة حقل بحقل بالإضافة إلى فحوصات مخصصة لتلف الحروف والحروف المكررة، في 22-23 يونيو 2026.",
    standardCompared: "卦辭، 大象، والخطوط الستة لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "نهائي: تطابق 514/514 حقلاً (100%)، مع صفر مؤشرات فساد.",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "ريتشارد فيلهلم (1924): التحقق مقابل الطبعة الأولى",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 يونيو 2026",
    method:
      "مقارنة حقل بحقل لنص الأوراكل في التطبيق مقابل الطبعة الأولى المطبوعة (Eugen Diederichs Verlag، يينا، 1924).",
    standardCompared:
      "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 للهكساغرامين 1 و2 (514 حقلاً إجمالاً).",
    result: "تطابق 514/514 حقلاً (100%).",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "كشف تدقيق الحقول اللاحق للتحقق W-08 (يوليو 2026) عن 73 خللاً في التعرف الضوئي على الحروف ضمن مجموعة بيانات Wilhelm 1924 وعالجها. أُعيد التحقق من النص مقارنةً بالطبعة الأولى المطبوعة بعد تطبيق جميع التصحيحات.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "شروح تقليدية: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 يونيو 2026",
    method:
      "تحقق آلي من الشروح التقليدية مقابل النسخة المنشورة Wilhelm/Baynes (1950)، بما في ذلك شرح Wilhelm نفسه وشروح العشرة أجنحة لConfucius.",
    standardCompared:
      "شرح Wilhelm نفسه وملاحظات العشرة أجنحة لConfucius على الحكم والصورة وكل خط؛ كتلة حول هذا الHexagram؛ Words on the Text (Hexagram 1-2 فقط)؛ شرح yong (1-2 فقط). 64 hexagram.",
    result: "1920/1920 حقلاً متطابقاً (100%).",
    statusKind: "superseded",
    statusLabel: "مهمل.",
    currentStatusNote: "مرجع مقارن مقابل تعليق الترجمة الإنجليزية Wilhelm/Baynes عام 1950، محتفظ به لاستيفاء السجل التاريخي. التعليق مستمد من الطبعة الأولى المطبوعة (Diederichs، 1924).",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "شروح تقليدية: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "24 يونيو 2026",
    method:
      "تحقق آلي من الشروح التقليدية مقابل النسخة المنشورة James Legge (1882)، بما في ذلك footnotes والرمزية الكبرى للملحق II.",
    standardCompared:
      "Footnotes (64 hexagram)؛ شرح صورة الرمزية الكبرى، الملحق II (64 hexagram)؛ ملاحظات الرمزية الصغرى لكل خط، الملحق II (موجودة في 6 من أصل 64 hexagram في نسخة Legge).",
    result:
      "Footnotes وشرح صورة الرمزية الكبرى مغطاة بالكامل (64/64، 100%)؛ ملاحظات الرمزية الصغرى مُحققة لكل hexagram تتضمنه نسخة Legge. تحقق PASS.",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "شروح تقليدية: ريتشارد فيلهلم (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 يونيو 2026",
    method:
      "مقارنة حقل بحقل لنص التعليق في التطبيق مقابل الطبعة الأولى المطبوعة (Eugen Diederichs Verlag، يينا، 1924)، تشمل الكتاب الثالث (Die Kommentare) الذي يحتوي على ملاحظات فيلهلم نفسه وترجمته للعشرة أجنحة الكونفوشيوسية لجميع الـ64 هكساغرام.",
    standardCompared:
      "شرح فيلهلم نفسه وملاحظات العشرة أجنحة على الحكم والصورة وكل خط؛ كتلة حول هذا الهكساغرام؛ Wen Yen (هكساغرام 1 و2 فقط)؛ شرح yong (هكساغرام 1 و2 فقط). 64 هكساغرام؛ 2,304 حقلا إجمالا.",
    result: "تطابق 2,304/2,304 حقلاً (100%).",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "كشف تدقيق الحقول اللاحق للتحقق W-08 (يوليو 2026) عن 73 خللاً في التعرف الضوئي على الحروف ضمن مجموعة بيانات Wilhelm 1924 وعالجها. أُعيد التحقق من النص مقارنةً بالطبعة الأولى المطبوعة بعد تطبيق جميع التصحيحات.",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "قواعد الخطوط المتغيرة: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "22 يونيو 2026",
    method: "مقارنة تلقائية لقواعد الاختزال في التطبيق مقابل نص القواعد المنشور، حالة بحالة.",
    standardCompared:
      "حالات القواعد المنشورة التسع لاختزال الخطوط المتغيرة إلى نص خط حاكم واحد (من 0 إلى 6 خطوط متغيرة، بالإضافة إلى 用九/用六).",
    result: "نهائي: تطابق 9/9 حالات القواعد (100%).",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "قواعد الخطوط المتغيرة: Zhu Xi (كلاسيكي)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 يونيو 2026",
    method: "مقارنة تلقائية لقواعد الاختزال الكلاسيكية في التطبيق مقابل نص القواعد المترجم.",
    standardCompared:
      "حالات القواعد المنشورة لاختزال الخطوط المتغيرة إلى نص خط حاكم واحد (من 0 إلى 6 خطوط متغيرة، بالإضافة إلى 用九/用六).",
    result: "نهائي: تطابق 10/10 مقتطفات القواعد (100%).",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "ثلاث عملات: التحقق (الطبعة المنشورة)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 يونيو 2026",
    method:
      "تحقق آلي مقابل الملحق I، القسم 2، من طبعة Wilhelm/Baynes (1950) المنشورة، في المسارات الآلية واليدوية.",
    standardCompared:
      "الوجه المُنقَش = yin (2)، الظهر = yang (3)；الخطوط 6 و7 و8 و9 والاحتمالات 1/8 و3/8 و3/8 و1/8.",
    result: "النهائي: 3/3 فحوصات ناجحة (100%).",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "ساق العرقوس: التحقق (الطبعة المنشورة)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 يونيو 2026",
    method:
      "تحقق آلي مقابل الملحق I، القسم 1، من طبعة Wilhelm/Baynes (1950) المنشورة، في المسارات الآلية واليدوية.",
    standardCompared:
      "إجراء من ثلاث جولات، وتعيين الباقي إلى الخط، واحتمالات 1/16 و5/16 و7/16 و3/16.",
    result:
      "النهائي: 6/6 فحوصات ناجحة (100%). التوزيع التقليدي 1/16 و5/16 و7/16 و3/16 دقيق تماماً؛ وتختلف عنه محاكاة مستقلة وحرفية للإجراء الفعلي بأقل من 1%، وهو أثر مفهوم تماماً ناتج عن عدّ سيقان العرقوس في مجموعات من أربعة، وليس تبايناً حقيقياً.",
    statusKind: "current",
    statusLabel: "ساري حتى هذا التاريخ.",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "ثلاث عملات: التحقق الأولي",
    source: CITATIONS.nielsen,
    verificationDate: "19 مايو 2026",
    method:
      "برهان تركيبي لتوزيع 6/7/8/9 ومحاكاة Monte Carlo في اختبارات المحرك. مقارنة مع الحسابات المعيارية المنشورة (Nielsen 2003؛ Rutt 1996)",
    standardCompared:
      "نموذج ثلاث عملات عادلة (كل وجه 2 أو 3): قيم 6 و7 و8 و9 واحتمالات 1/8 و3/8 و3/8 و1/8.",
    result: "فحوصات التوزيع ناجحة (تركيبي وMonte Carlo).",
    statusKind: "superseded",
    statusLabel: "مهمل.",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "ساق العرقوس: التحقق الأولي",
    source: CITATIONS.nielsen,
    verificationDate: "19 مايو 2026",
    method:
      "برهان رياضي لتعيين الباقي إلى الخط ومحاكاة Monte Carlo (16,000 محاولة). مقارنة مع جداول الاحتمال المنشورة (Nielsen 2003؛ Rutt 1996)",
    standardCompared:
      "توزيع 1/16 و5/16 و7/16 و3/16؛ المعالج اليدوي يقبل 5/9 و4/8 فقط لكل جولة.",
    result: "فحوصات التوزيع والتعيين اليدوي ناجحة.",
    statusKind: "superseded",
    statusLabel: "مهمل.",
    currentStatusNote: "",
  },
];

const BLOCKS_HI: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm (1924): प्रारंभिक क्रॉस-चेक (W/B 1950 तुलनात्मक)",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 जून 2026",
    method:
      "मिरर से निकाले गए पाठ और ऐप द्वारा परोसे गए पाठ के बीच स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना।",
    standardCompared:
      "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें हेक्साग्राम 1 और 2 के विशेष पाठ 用九/用六 शामिल हैं (कुल 514 फ़ील्ड)।",
    result:
      "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)। मध्यवर्ती चरण: 94.94% → 99.81% → 100%; अंतिम 6 फ़ील्ड मुद्रित संस्करण से पूरे किए गए जहाँ वेब मिरर में अंतराल थे।",
    statusKind: "superseded",
    statusLabel: "अप्रचलित।",
    currentStatusNote: "1950 के Wilhelm/Baynes अंग्रेज़ी अनुवाद के साथ तुलनात्मक क्रॉस-रेफरेंस के रूप में संग्रहीत। ऐप का ओरेकल स्रोत प्रथम मुद्रित संस्करण (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag) है।",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm (1924): सत्यापन (W/B 1950 तुलनात्मक संदर्भ)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 जून 2026",
    method:
      "प्रकाशित संस्करण के स्थानीय EPUB से निकाले गए पाठ और ऐप द्वारा परोसे गए पाठ के बीच स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)।",
    statusKind: "superseded",
    statusLabel: "अप्रचलित।",
    currentStatusNote: "1950 के Wilhelm/Baynes अंग्रेज़ी अनुवाद के साथ तुलनात्मक क्रॉस-रेफरेंस के रूप में संग्रहीत। ऐप का ओरेकल स्रोत प्रथम मुद्रित संस्करण (Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag) है।",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: प्रारंभिक सत्यापन",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 जून 2026",
    method: "स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना इस प्रकाशित संस्करण के विरुद्ध।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result:
      "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)। 21 जून का मध्यवर्ती चरण: 77.19% → अंतिम: 100% पार्सर और गोल्ड सुधार के बाद, इस प्रकाशित संस्करण के विरुद्ध सीधे सत्यापित।",
    statusKind: "superseded",
    statusLabel: "अप्रचलित।",
    currentStatusNote: "",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: सत्यापन (प्रकाशित संस्करण)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 जून 2026",
    method:
      "प्रकाशित संस्करण के स्थानीय EPUB से निकाले गए पाठ और ऐप द्वारा परोसे गए पाठ के बीच स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: प्रारंभिक सत्यापन",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 जून 2026",
    method:
      "ऐप डेटासेट ctext.org के अलावा किसी अन्य स्रोत से बना था। पहली स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना ने उस डेटासेट में गलत और दोहरे अक्षर पाए (hex 31 咸/鹹; hex 19 लेबल टकराव)। बंडल ctext.org से पुनः लोड किया गया और उसी दिन पुनः सत्यापित।",
    standardCompared: "सभी 64 हेक्साग्राम का 卦辭, 大象, और 6 रेखाएँ, जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result:
      "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)। 21 जून का मध्यवर्ती चरण: 90.66% → अंतिम: 100% पुनः लोड और पार्सर सुधार के बाद।",
    statusKind: "superseded",
    statusLabel: "अप्रचलित।",
    currentStatusNote: "",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: दूसरा सत्यापन",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 जून 2026",
    method:
      "22-23 जून 2026 को फ़ील्ड-दर-फ़ील्ड तुलना का स्वतंत्र पुनः-चालन, साथ ही अक्षर भ्रष्टाचार और दोहरे अक्षरों की समर्पित जाँच।",
    standardCompared: "सभी 64 हेक्साग्राम का 卦辭, 大象, और 6 रेखाएँ, जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "अंतिम: 514/514 फ़ील्ड मेल खाए (100%), शून्य भ्रष्टाचार ध्वज।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-oracle-2026-06-30",
    category: "oracle-text",
    title: "Richard Wilhelm (1924): प्रथम संस्करण के विरुद्ध सत्यापन",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 जून 2026",
    method:
      "प्रथम मुद्रित संस्करण (Eugen Diederichs Verlag, Jena, 1924) के विरुद्ध ऐप के ओरेकल पाठ की फ़ील्ड-दर-फ़ील्ड तुलना।",
    standardCompared:
      "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), हेक्साग्राम 1 और 2 के 用九/用六 सहित (कुल 514 फ़ील्ड)।",
    result: "514/514 फ़ील्ड मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "पोस्ट-वेरिफिकेशन फ़ील्ड ऑडिट W-08 (जुलाई 2026) ने Wilhelm 1924 डेटासेट में 73 OCR अवशेष पहचानकर सुधारे। सभी सुधारों के बाद प्रथम मुद्रित संस्करण के विरुद्ध पाठ को पुन: सत्यापित किया गया।",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "शास्त्रीय टिप्पणियाँ: Wilhelm (1924)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 जून 2026",
    method:
      "शास्त्रीय टिप्पणियों का Wilhelm/Baynes (1950) प्रकाशित संस्करण के विरुद्ध स्वचालित सत्यापन, Wilhelm का अपना टीका और Confucius के दस पंख की टिप्पणी सहित।",
    standardCompared:
      "Wilhelm का अपना टीका और Confucius के दस पंख की judgment/image/प्रत्येक रेखा पर टिप्पणियाँ; About this hexagram ब्लॉक; Words on the Text (केवल hex 1-2); yong टीका (1-2)। 64 हेक्साग्राम।",
    result: "1920/1920 फ़ील्ड मेल (100%)।",
    statusKind: "superseded",
    statusLabel: "अप्रचलित।",
    currentStatusNote: "1950 के Wilhelm/Baynes अंग्रेज़ी टीके के साथ तुलनात्मक क्रॉस-रेफरेंस के रूप में संग्रहीत। टिप्पणी प्रथम मुद्रित संस्करण (Diederichs, 1924) से ली गई है।",
  },
  {
    id: "legge-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "शास्त्रीय टिप्पणियाँ: James Legge",
    source: CITATIONS.leggeOxford,
    verificationDate: "24 जून 2026",
    method:
      "शास्त्रीय टिप्पणियों का James Legge (1882) प्रकाशित संस्करण के विरुद्ध स्वचालित सत्यापन, footnotes और Appendix II Great Symbolism सहित।",
    standardCompared:
      "Footnotes (64 हेक्साग्राम); Great Symbolism image-ग्लोस, Appendix II (64 हेक्साग्राम); Lesser Symbolism रेखा-टिप्पणियाँ, Appendix II (Legge के संस्करण में 64 में से केवल 6 हेक्साग्राम में मौजूद)।",
    result:
      "Footnotes और Great Symbolism image-ग्लोस पूर्ण रूप से कवर (64/64, 100%); Lesser Symbolism रेखा-टिप्पणियाँ हर उस हेक्साग्राम के लिए सत्यापित जहाँ Legge का संस्करण उन्हें शामिल करता है। सत्यापन PASS।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-diederichs-1924-commentary-2026-06-30",
    category: "library-commentary",
    title: "शास्त्रीय टिप्पणियाँ: Richard Wilhelm (1924)",
    source: CITATIONS.wilhelmDiederichs1924,
    verificationDate: "30 जून 2026",
    method:
      "प्रथम मुद्रित संस्करण (Eugen Diederichs Verlag, Jena, 1924) के विरुद्ध ऐप के टिप्पणी पाठ की फ़ील्ड-दर-फ़ील्ड तुलना, तीसरी पुस्तक (Die Kommentare) को कवर करते हुए, जिसमें सभी 64 हेक्साग्राम के लिए Wilhelm की अपनी टिप्पणियाँ और कन्फ्यूशियस के दस पंखों का उनका अनुवाद है।",
    standardCompared:
      "Wilhelm की अपनी टिप्पणी और निर्णय, छवि और प्रत्येक रेखा पर दस पंखों की टिप्पणियाँ; About this hexagram ब्लॉक; Wen Yen (केवल हेक्साग्राम 1 और 2); yong टिप्पणी (केवल हेक्साग्राम 1 और 2)। 64 हेक्साग्राम; कुल 2,304 फ़ील्ड।",
    result: "2,304/2,304 फ़ील्ड मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "पोस्ट-वेरिफिकेशन फ़ील्ड ऑडिट W-08 (जुलाई 2026) ने Wilhelm 1924 डेटासेट में 73 OCR अवशेष पहचानकर सुधारे। सभी सुधारों के बाद प्रथम मुद्रित संस्करण के विरुद्ध पाठ को पुन: सत्यापित किया गया।",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "बदलती-रेखा नियम: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "22 जून 2026",
    method: "ऐप के समाहार नियमों की प्रकाशित नियम पाठ के विरुद्ध केस-दर-केस स्वचालित तुलना।",
    standardCompared:
      "बदलती रेखाओं को एक एकल शासक रेखा पाठ में समाहार करने के लिए प्रकाशित 9 नियम मामले (0 से 6 बदलती रेखाओं तक, साथ ही 用九/用六)।",
    result: "अंतिम: 9/9 नियम मामले मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "बदलती-रेखा नियम: Zhu Xi (शास्त्रीय)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 जून 2026",
    method: "ऐप के शास्त्रीय समाहार नियमों की अनुवादित नियम पाठ के विरुद्ध स्वचालित तुलना।",
    standardCompared:
      "बदलती रेखाओं को एक एकल शासक रेखा पाठ में समाहार करने के लिए प्रकाशित नियम मामले (0 से 6 बदलती रेखाओं तक, साथ ही 用九/用六)।",
    result: "अंतिम: 10/10 नियम अंश मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-coins-2026-06-25",
    category: "divination-method",
    title: "तीन सिक्के: सत्यापन (प्रकाशित संस्करण)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 जून 2026",
    method:
      "Wilhelm/Baynes (1950) प्रकाशित संस्करण के परिशिष्ट I, अनुभाग 2, के विरुद्ध स्वचालित सत्यापन (स्वचालित और मैन्युअल मार्ग)।",
    standardCompared:
      "अंकित मुख = yin (2), पृष्ठ = yang (3); रेखाएँ 6, 7, 8, 9 और सटीक प्रायिकताएँ 1/8, 3/8, 3/8, 1/8।",
    result: "अंतिम: 3/3 जाँचें उत्तीर्ण (100%)।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "",
  },
  {
    id: "wilhelm-appendix-yarrow-2026-06-25",
    category: "divination-method",
    title: "यैरो डंडियाँ: सत्यापन (प्रकाशित संस्करण)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "25 जून 2026",
    method:
      "Wilhelm/Baynes (1950) प्रकाशित संस्करण के परिशिष्ट I, अनुभाग 1, के विरुद्ध स्वचालित सत्यापन (स्वचालित और मैन्युअल मार्ग)।",
    standardCompared:
      "तीन-राउंड प्रक्रिया, अवशेष-से-रेखा मैपिंग, और प्रायिकताएँ 1/16, 5/16, 7/16, 3/16।",
    result:
      "अंतिम: 6/6 जाँचें उत्तीर्ण (100%)। शास्त्रीय 1/16, 5/16, 7/16, 3/16 वितरण सटीक है; भौतिक प्रक्रिया के एक स्वतंत्र, शब्दशः अनुकरण में अंतर 1% से कम है, जो डंडियों को चार-चार के समूह में गिनने के तरीके से पूरी तरह समझाया गया प्रभाव है, कोई विसंगति नहीं।",
    statusKind: "current",
    statusLabel: "इस तिथि तक वैध।",
    currentStatusNote: "",
  },
  {
    id: "coins-math-initial-2026-05-19",
    category: "divination-method",
    title: "तीन सिक्के: प्रारंभिक सत्यापन",
    source: CITATIONS.nielsen,
    verificationDate: "19 मई 2026",
    method:
      "6/7/8/9 वितरण का संयोजक प्रमाण और इंजन परीक्षणों में Monte Carlo सिमुलेशन। प्रकाशित मानक विवरण (Nielsen 2003; Rutt 1996) से तुलना",
    standardCompared:
      "निष्पक्ष तीन-सिक्का मॉडल (प्रत्येक पक्ष 2 या 3): मान 6, 7, 8, 9 और प्रायिकताएँ 1/8, 3/8, 3/8, 1/8।",
    result: "वितरण जाँचें उत्तीर्ण (संयोजक और Monte Carlo)।",
    statusKind: "superseded",
    statusLabel: "अप्रचलित।",
    currentStatusNote: "",
  },
  {
    id: "yarrow-math-initial-2026-05-19",
    category: "divination-method",
    title: "यैरो डंडियाँ: प्रारंभिक सत्यापन",
    source: CITATIONS.nielsen,
    verificationDate: "19 मई 2026",
    method:
      "अवशेष-से-रेखा मैपिंग का गणितीय प्रमाण और Monte Carlo सिमुलेशन (16,000 परीक्षण)। प्रकाशित प्रायिकता तालिकाओं (Nielsen 2003; Rutt 1996) से तुलना",
    standardCompared:
      "वितरण 1/16, 5/16, 7/16, 3/16; मैन्युअल विज़ार्ड प्रति राउंड केवल 5/9 और 4/8 स्वीकार करता है।",
    result: "वितरण और मैन्युअल मैपिंग जाँचें उत्तीर्ण।",
    statusKind: "superseded",
    statusLabel: "अप्रचलित।",
    currentStatusNote: "",
  },
];

const EN_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Fidelity Audits",
  oracleTextSectionHeading: "I Ching oracle texts",
  divinationMethodSectionHeading: "I Ching casting methods",
  libraryCommentarySectionHeading: "Classical commentaries (Wilhelm, Legge, Confucius)",
  mutationRulesSectionHeading: "Changing-line mutation rules",
  blockVerificationDateLabel: "Date verified",
  blockSourceLabel: "Source",
  blockMethodLabel: "Method",
  blockStandardLabel: "Standard compared",
  blockResultLabel: "Result",
  blockStatusLabel: "Status",
};

const ES_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Auditorías de fidelidad",
  oracleTextSectionHeading: "Textos del oráculo del I Ching",
  divinationMethodSectionHeading: "Métodos de tirada del I Ching",
  libraryCommentarySectionHeading: "Comentarios clásicos (Wilhelm, Legge, Confucio)",
  mutationRulesSectionHeading: "Reglas de mutación de líneas cambiantes",
  blockVerificationDateLabel: "Fecha de verificación",
  blockSourceLabel: "Fuente",
  blockMethodLabel: "Método",
  blockStandardLabel: "Estándar comparado",
  blockResultLabel: "Resultado",
  blockStatusLabel: "Estado",
};

const PT_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Auditorias de fidelidade",
  oracleTextSectionHeading: "Textos do oráculo do I Ching",
  divinationMethodSectionHeading: "Métodos de consulta do I Ching",
  libraryCommentarySectionHeading: "Comentários clássicos (Wilhelm, Legge, Confúcio)",
  mutationRulesSectionHeading: "Regras de mutação de linhas móveis",
  blockVerificationDateLabel: "Data de verificação",
  blockSourceLabel: "Fonte",
  blockMethodLabel: "Método",
  blockStandardLabel: "Padrão comparado",
  blockResultLabel: "Resultado",
  blockStatusLabel: "Estado",
};

const FR_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Audits de fidélité",
  oracleTextSectionHeading: "Textes oraculaires du I Ching",
  divinationMethodSectionHeading: "Méthodes de tirage du Yi King",
  libraryCommentarySectionHeading: "Commentaires classiques (Wilhelm, Legge, Confucius)",
  mutationRulesSectionHeading: "Règles de mutation des lignes changeantes",
  blockVerificationDateLabel: "Date de vérification",
  blockSourceLabel: "Source",
  blockMethodLabel: "Méthode",
  blockStandardLabel: "Norme comparée",
  blockResultLabel: "Résultat",
  blockStatusLabel: "Statut",
};

const DE_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Fidelitätsprüfungen",
  oracleTextSectionHeading: "I-Ching-Orakeltexte",
  divinationMethodSectionHeading: "I-Ching-Werfmethode",
  libraryCommentarySectionHeading: "Klassische Kommentare (Wilhelm, Legge, Konfuzius)",
  mutationRulesSectionHeading: "Mutationsregeln für wechselnde Linien",
  blockVerificationDateLabel: "Prüfdatum",
  blockSourceLabel: "Quelle",
  blockMethodLabel: "Methode",
  blockStandardLabel: "Verglichener Standard",
  blockResultLabel: "Ergebnis",
  blockStatusLabel: "Status",
};

const IT_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Audit di fedeltà",
  oracleTextSectionHeading: "Testi oracolari dell'I Ching",
  divinationMethodSectionHeading: "Metodi di consultazione dell'I Ching",
  libraryCommentarySectionHeading: "Commenti classici (Wilhelm, Legge, Confucio)",
  mutationRulesSectionHeading: "Regole di mutazione delle linee mutanti",
  blockVerificationDateLabel: "Data di verifica",
  blockSourceLabel: "Fonte",
  blockMethodLabel: "Metodo",
  blockStandardLabel: "Standard confrontato",
  blockResultLabel: "Risultato",
  blockStatusLabel: "Stato",
};

const JA_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "忠実度監査",
  oracleTextSectionHeading: "I Ching オラクルテキスト",
  divinationMethodSectionHeading: "I Ching 占い方法",
  libraryCommentarySectionHeading: "古典注釈（Wilhelm・Legge・孔子）",
  mutationRulesSectionHeading: "変爻の解釈規則",
  blockVerificationDateLabel: "検証日",
  blockSourceLabel: "出典",
  blockMethodLabel: "方法",
  blockStandardLabel: "比較基準",
  blockResultLabel: "結果",
  blockStatusLabel: "状態",
};

const ZH_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "保真审计",
  oracleTextSectionHeading: "I Ching 卦辞文本",
  divinationMethodSectionHeading: "I Ching 占筮方法",
  libraryCommentarySectionHeading: "古典注释（卫礼贤、理雅各、孔子）",
  mutationRulesSectionHeading: "变爻解读规则",
  blockVerificationDateLabel: "验证日期",
  blockSourceLabel: "来源",
  blockMethodLabel: "方法",
  blockStandardLabel: "比对标准",
  blockResultLabel: "结果",
  blockStatusLabel: "状态",
};

const KO_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "충실도 감사",
  oracleTextSectionHeading: "I Ching 오라클 텍스트",
  divinationMethodSectionHeading: "I Ching 점복 방법",
  libraryCommentarySectionHeading: "고전 주석 (Wilhelm, Legge, 공자)",
  mutationRulesSectionHeading: "변효 해석 규칙",
  blockVerificationDateLabel: "검증 날짜",
  blockSourceLabel: "출처",
  blockMethodLabel: "방법",
  blockStandardLabel: "비교 기준",
  blockResultLabel: "결과",
  blockStatusLabel: "상태",
};

const AR_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "تدقيقات المطابقة",
  oracleTextSectionHeading: "نصوص أوراكل I Ching",
  divinationMethodSectionHeading: "طرق استخبار I Ching",
  libraryCommentarySectionHeading: "شروح تقليدية (Wilhelm، Legge، Confucius)",
  mutationRulesSectionHeading: "قواعد تحول الخطوط المتغيرة",
  blockVerificationDateLabel: "تاريخ التحقق",
  blockSourceLabel: "المصدر",
  blockMethodLabel: "الطريقة",
  blockStandardLabel: "المعيار المُقارَن",
  blockResultLabel: "النتيجة",
  blockStatusLabel: "الحالة",
};

const HI_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "निष्ठा ऑडिट",
  oracleTextSectionHeading: "I Ching ओरेकल पाठ",
  divinationMethodSectionHeading: "I Ching कास्टिंग विधियाँ",
  libraryCommentarySectionHeading: "शास्त्रीय टिप्पणियाँ (Wilhelm, Legge, Confucius)",
  mutationRulesSectionHeading: "बदलती रेखाओं के परिवर्तन नियम",
  blockVerificationDateLabel: "सत्यापन तिथि",
  blockSourceLabel: "स्रोत",
  blockMethodLabel: "विधि",
  blockStandardLabel: "तुलना मानक",
  blockResultLabel: "परिणाम",
  blockStatusLabel: "स्थिति",
};

function withTimeline(
  base: Omit<AuditsPageUiMessages, "timeline">,
  sourceBlocks: AuditSourceBlock[],
): AuditsPageUiMessages {
  return { ...base, timeline: buildTimeline(sourceBlocks) };
}

const AUDITS_PAGE_UI: Record<AppLocale, AuditsPageUiMessages> = {
  en: withTimeline(EN_BASE, BLOCKS_EN),
  es: withTimeline(ES_BASE, BLOCKS_ES),
  pt: withTimeline(PT_BASE, BLOCKS_PT),
  fr: withTimeline(FR_BASE, BLOCKS_FR),
  de: withTimeline(DE_BASE, BLOCKS_DE),
  it: withTimeline(IT_BASE, BLOCKS_IT),
  ja: withTimeline(JA_BASE, BLOCKS_JA),
  zh: withTimeline(ZH_BASE, BLOCKS_ZH),
  ko: withTimeline(KO_BASE, BLOCKS_KO),
  ar: withTimeline(AR_BASE, BLOCKS_AR),
  hi: withTimeline(HI_BASE, BLOCKS_HI),
};

export function getAuditsPageUiMessages(locale: AppLocale): AuditsPageUiMessages {
  return AUDITS_PAGE_UI[locale] ?? AUDITS_PAGE_UI[DEFAULT_LOCALE];
}

const LOCALE_BCP47: Record<AppLocale, string> = {
  en: "en-GB",
  es: "es",
  pt: "pt",
  fr: "fr",
  de: "de",
  it: "it",
  ja: "ja",
  zh: "zh-Hans",
  ko: "ko",
  ar: "ar",
  hi: "hi",
};

/** Locale-aware long date for the public `/audits` timeline rail. */
export function formatAuditTimelineDate(iso: string, locale: AppLocale): string {
  return new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

/** Compact ISO date for the public `/audits` tree root nodes (YYYY.MM.DD). */
export function formatAuditTimelineDateCompact(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${year}.${month}.${day}`;
}

/** Compact date for the timeline circle (short month). */
export function formatAuditTimelineDateShort(iso: string, locale: AppLocale): string {
  return new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}
