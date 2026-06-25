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
export type AuditBlockCategory = "oracle-text" | "library-commentary" | "mutation-rule";

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
  "zhouyi-ctext-2026-06-21": { verificationDateIso: "2026-06-23", sortOrder: 0 },
  "legge-oxford-pdf-2026-06-22": { verificationDateIso: "2026-06-23", sortOrder: 1 },
  "wilhelm-pantheon-pdf-2026-06-22": { verificationDateIso: "2026-06-23", sortOrder: 2 },
  "wilhelm-commentary-txt-maestro-2026-06-23": { verificationDateIso: "2026-06-24", sortOrder: 0 },
  "legge-commentary-txt-maestro-2026-06-23": { verificationDateIso: "2026-06-24", sortOrder: 1 },
  "huang-mutation-pdf-2026-06-22": { verificationDateIso: "2026-06-22", sortOrder: 0 },
  "zhuxi-adler-mutation-pdf-2026-06-22": { verificationDateIso: "2026-06-22", sortOrder: 1 },
  "wilhelm-parma-initial-2026-06-21": { verificationDateIso: "2026-06-21", sortOrder: 0 },
  "legge-sacred-texts-initial-2026-06-21": { verificationDateIso: "2026-06-21", sortOrder: 1 },
  "zhouyi-ctext-initial-2026-06-21": { verificationDateIso: "2026-06-21", sortOrder: 2 },
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
} satisfies Record<string, AuditSourceCitation>;

const CANONICAL_CITATIONS = new Set<AuditSourceCitation>(Object.values(CITATIONS));

function assertCompleteVerificationBlock(block: AuditSourceBlock): void {
  const stringFields: (keyof AuditSourceBlock)[] = [
    "title",
    "method",
    "standardCompared",
    "result",
    "statusLabel",
    "currentStatusNote",
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
    title: "Wilhelm/Baynes: initial verification",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 Jun 2026",
    method:
      "Automated field-by-field comparison (verify:hexagram-fidelity) between the text extracted from the mirror and the text served by the app.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including the special texts 用九/用六 for hexagrams 1 and 2 (514 fields total).",
    result:
      "Final: 514/514 fields matched (100%). Intermediate passes: 94.94% → 99.81% → 100%; the last 6 fields were completed from the printed edition where the web mirror had gaps.",
    statusKind: "superseded",
    statusLabel: "Superseded",
    currentStatusNote: "Historical cross-check against the University of Parma web mirror.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: verification (published edition)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 Jun 2026",
    method:
      "Automated field-by-field comparison (verify:hexagram-fidelity) between text extracted from a local EPUB of the published edition and the text served by the app.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "Final: 514/514 fields matched (100%).",
    statusKind: "current",
    statusLabel: "Current production source",
    currentStatusNote: "This is the gold reference the app verifies against today.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: initial verification",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 Jun 2026",
    method: "Automated field-by-field comparison (verify:hexagram-fidelity) against this published edition.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result:
      "Final: 514/514 fields matched (100%). Intermediate pass on 21 Jun: 77.19% → final: 100% after parser and gold corrections, verified directly against this published edition.",
    statusKind: "superseded",
    statusLabel: "Superseded",
    currentStatusNote: "Historical cross-check against the Internet Sacred Text Archive reproduction.",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: verification (published edition)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 Jun 2026",
    method:
      "Automated field-by-field comparison (verify:hexagram-fidelity) between text extracted from a local EPUB of the published edition and the text served by the app.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "Final: 514/514 fields matched (100%).",
    statusKind: "current",
    statusLabel: "Current production source",
    currentStatusNote: "This is the gold reference the app verifies against today.",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: initial verification",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 Jun 2026",
    method:
      "The app dataset had been built from a non-ctext source. First automated field-by-field comparison (verify:hexagram-fidelity) detected wrong and duplicated glyphs in that dataset (hex 31 咸/鹹; hex 19 label collision). The bundle was re-ingested from ctext.org and re-verified the same day.",
    standardCompared:
      "卦辭, 大象, and the 6 lines of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result:
      "Final: 514/514 fields matched (100%). Intermediate pass on 21 Jun: 90.66% → final: 100% after re-ingestion and parser correction.",
    statusKind: "superseded",
    statusLabel: "Superseded",
    currentStatusNote: "First quality pass on this source.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: second verification",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 Jun 2026",
    method:
      "Independent re-run of verify:hexagram-fidelity plus corruption gates (scan:zhouyi-corruption, check:hex-glyph-uniqueness) on 22-23 Jun 2026.",
    standardCompared:
      "卦辭, 大象, and the 6 lines of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "514/514 fields matched (100%), with zero corruption flags.",
    statusKind: "current",
    statusLabel: "Current production source",
    currentStatusNote:
      "Second independent pass on the same source; future audits will be numbered sequentially (third, fourth, …). Chinese Text Project remains the gold reference.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Classical commentaries: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 Jun 2026",
    method:
      "Automated verification of classical commentaries against the Wilhelm/Baynes (1950) published edition, including Wilhelm's own notes and Confucius's Ten Wings commentary.",
    standardCompared:
      "Wilhelm's own commentary and Confucius's Ten Wings notes on judgment, image, and each line; About this hexagram block; Words on the Text (hex 1-2 only); yong commentary (hex 1-2 only). 64 hexagrams.",
    result: "1920/1920 fields matched (100%).",
    statusKind: "current",
    statusLabel: "Current classical source",
    currentStatusNote:
      "Scholarly commentaries verified for all 64 hexagrams.",
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
      "Footnotes and Lesser Symbolism line notes; Great Symbolism image and line gloses (Appendix II). 64 hexagrams.",
    result: "Footnotes and Appendix II symbolism fully covered; verification PASS.",
    statusKind: "current",
    statusLabel: "Current classical source",
    currentStatusNote:
      "Scholarly commentaries verified for all 64 hexagrams.",
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
    statusLabel: "Current production source",
    currentStatusNote: "Default changing-line system in the app.",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Changing-line rules: Zhu Xi (classical)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 Jun 2026",
    method: "Automated comparison of the app's classical reduction rules against the translated rule text.",
    standardCompared: "The core published rule cases for 2, 3, 4, and 5 changing lines.",
    result: "Final: 10/10 rule snippets matched (100%).",
    statusKind: "current",
    statusLabel: "Current production source",
    currentStatusNote: "Available via the Changing-line reading selector in Options.",
  },
];

const BLOCKS_ES: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: verificación inicial",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 jun 2026",
    method:
      "Comparación automatizada campo por campo (verify:hexagram-fidelity) entre el texto extraído del mirror y el texto que sirve la app.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluidos los textos especiales 用九/用六 de los hexagramas 1 y 2 (514 campos en total).",
    result:
      "Final: 514/514 campos coincidentes (100%). Pasadas intermedias: 94.94% → 99.81% → 100%; los últimos 6 campos se completaron desde la edición impresa donde el mirror web tenía vacíos.",
    statusKind: "superseded",
    statusLabel: "Reemplazada",
    currentStatusNote: "Verificación cruzada histórica contra el mirror web de la Universidad de Parma.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: verificación (edición publicada)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 jun 2026",
    method:
      "Comparación automatizada campo por campo (verify:hexagram-fidelity) entre el texto extraído de un EPUB local de la edición publicada y el texto que sirve la app.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "Final: 514/514 campos coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Fuente de producción vigente",
    currentStatusNote: "Esta es la referencia gold contra la que la app se verifica hoy.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: verificación inicial",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 jun 2026",
    method: "Comparación automatizada campo por campo (verify:hexagram-fidelity) contra esta edición publicada.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result:
      "Final: 514/514 campos coincidentes (100%). Pasada intermedia el 21 jun: 77.19% → final: 100% tras correcciones del parser y gold, verificados directamente contra esta edición publicada.",
    statusKind: "superseded",
    statusLabel: "Reemplazada",
    currentStatusNote: "Verificación cruzada histórica contra la reproducción de Internet Sacred Text Archive.",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: verificación (edición publicada)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 jun 2026",
    method:
      "Comparación automatizada campo por campo (verify:hexagram-fidelity) entre el texto extraído de un EPUB local de la edición publicada y el texto que sirve la app.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "Final: 514/514 campos coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Fuente de producción vigente",
    currentStatusNote: "Esta es la referencia gold contra la que la app se verifica hoy.",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: verificación inicial",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 jun 2026",
    method:
      "El dataset de la app se había construido desde una fuente distinta de ctext.org. Primera comparación automatizada campo por campo (verify:hexagram-fidelity) que detectó glifos erróneos y duplicados en ese dataset (hex 31 咸/鹹; colisión de etiqueta hex 19). El bundle se volvió a cargar desde ctext.org y se re-verificó el mismo día.",
    standardCompared: "卦辭, 大象 y las 6 líneas de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result:
      "Final: 514/514 campos coincidentes (100%). Pasada intermedia el 21 jun: 90.66% → final: 100% tras recarga y corrección del parser.",
    statusKind: "superseded",
    statusLabel: "Reemplazada",
    currentStatusNote: "Primer pase de calidad sobre esta fuente.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: segunda verificación",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 jun 2026",
    method:
      "Re-ejecución independiente de verify:hexagram-fidelity más gates de corrupción (scan:zhouyi-corruption, check:hex-glyph-uniqueness) el 22-23 jun 2026.",
    standardCompared: "卦辭, 大象 y las 6 líneas de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "514/514 campos coincidentes (100%), con cero indicadores de corrupción.",
    statusKind: "current",
    statusLabel: "Fuente de producción vigente",
    currentStatusNote:
      "Segunda pasada independiente sobre la misma fuente; las auditorías futuras se numerarán en secuencia (tercera, cuarta, …). Chinese Text Project sigue siendo la referencia gold.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Comentarios clásicos: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 jun 2026",
    method:
      "Verificación automatizada de los comentarios clásicos contra la edición publicada Wilhelm/Baynes (1950), incluido el comentario propio de Wilhelm y las Diez Alas de Confucio.",
    standardCompared:
      "Comentario propio de Wilhelm y notas de las Diez Alas de Confucio en juicio, imagen y cada línea; bloque Acerca de este hexagrama; Words on the Text (solo hex 1-2); comentario yong (solo hex 1-2). 64 hexagramas.",
    result: "1920/1920 campos coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Fuente clásica vigente",
    currentStatusNote:
      "Comentarios académicos verificados para los 64 hexagramas.",
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
      "Footnotes y notas de Simbolismo menor por línea; imagen del Gran Simbolismo y glosas por línea (Apéndice II). 64 hexagramas.",
    result: "Footnotes y simbolismo del Apéndice II cubiertos por completo; verificación PASS.",
    statusKind: "current",
    statusLabel: "Fuente clásica vigente",
    currentStatusNote:
      "Comentarios académicos verificados para los 64 hexagramas.",
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
    statusLabel: "Fuente de producción vigente",
    currentStatusNote: "Sistema de líneas cambiantes por defecto en la app.",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Reglas de líneas cambiantes: Zhu Xi (clásico)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 jun 2026",
    method:
      "Comparación automatizada de las reglas de reducción clásicas de la app contra el texto traducido de las reglas.",
    standardCompared: "Los casos de regla principales publicados para 2, 3, 4 y 5 líneas cambiantes.",
    result: "Final: 10/10 fragmentos de regla coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Fuente de producción vigente",
    currentStatusNote: "Disponible mediante el selector «Lectura de líneas cambiantes» en Opciones.",
  },
];

const BLOCKS_PT: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: verificação inicial",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 de junho de 2026",
    method:
      "Comparação automatizada campo a campo (verify:hexagram-fidelity) entre o texto extraído do mirror e o texto servido pela app.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo os textos especiais 用九/用六 dos hexagramas 1 e 2 (514 campos no total).",
    result:
      "Final: 514/514 campos correspondentes (100%). Passagens intermédias: 94.94% → 99.81% → 100%; os últimos 6 campos foram completados a partir da edição impressa onde o mirror web tinha lacunas.",
    statusKind: "superseded",
    statusLabel: "Substituída",
    currentStatusNote: "Verificação cruzada histórica contra o mirror web da Universidade de Parma.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: verificação (edição publicada)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 de junho de 2026",
    method:
      "Comparação automatizada campo a campo (verify:hexagram-fidelity) entre o texto extraído de um EPUB local da edição publicada e o texto servido pela app.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "Final: 514/514 campos correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Fonte de produção atual",
    currentStatusNote: "Esta é a referência gold contra a qual a app se verifica hoje.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: verificação inicial",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 de junho de 2026",
    method: "Comparação automatizada campo a campo (verify:hexagram-fidelity) contra esta edição publicada.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result:
      "Final: 514/514 campos correspondentes (100%). Passagem intermédia em 21 de junho: 77.19% → final: 100% após correções do parser e gold, verificados diretamente contra esta edição publicada.",
    statusKind: "superseded",
    statusLabel: "Substituída",
    currentStatusNote: "Verificação cruzada histórica contra a reprodução do Internet Sacred Text Archive.",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: verificação (edição publicada)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 de junho de 2026",
    method:
      "Comparação automatizada campo a campo (verify:hexagram-fidelity) entre o texto extraído de um EPUB local da edição publicada e o texto servido pela app.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "Final: 514/514 campos correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Fonte de produção atual",
    currentStatusNote: "Esta é a referência gold contra a qual a app se verifica hoje.",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: verificação inicial",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 de junho de 2026",
    method:
      "O dataset da app tinha sido construído a partir de uma fonte distinta de ctext.org. Primeira comparação automatizada campo a campo (verify:hexagram-fidelity) que detectou glifos errados e duplicados nesse dataset (hex 31 咸/鹹; colisão de rótulo hex 19). O bundle foi recarregado a partir de ctext.org e re-verificado no mesmo dia.",
    standardCompared: "卦辭, 大象 e as 6 linhas dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result:
      "Final: 514/514 campos correspondentes (100%). Passagem intermédia em 21 de junho: 90.66% → final: 100% após recarga e correção do parser.",
    statusKind: "superseded",
    statusLabel: "Substituída",
    currentStatusNote: "Primeira passagem de qualidade sobre esta fonte.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: segunda verificação",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 de junho de 2026",
    method:
      "Reexecução independente de verify:hexagram-fidelity mais gates de corrupção (scan:zhouyi-corruption, check:hex-glyph-uniqueness) em 22-23 de junho de 2026.",
    standardCompared: "卦辭, 大象 e as 6 linhas dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "514/514 campos correspondentes (100%), com zero indicadores de corrupção.",
    statusKind: "current",
    statusLabel: "Fonte de produção atual",
    currentStatusNote:
      "Segunda passagem independente sobre a mesma fonte; auditorias futuras serão numeradas em sequência (terceira, quarta, …). Chinese Text Project continua sendo a referência gold.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Comentários clássicos: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 de junho de 2026",
    method:
      "Verificação automatizada dos comentários clássicos contra a edição publicada Wilhelm/Baynes (1950), incluindo o comentário próprio de Wilhelm e as Dez Asas de Confúcio.",
    standardCompared:
      "Comentário próprio de Wilhelm e notas das Dez Asas de Confúcio em juízo, imagem e cada linha; bloco Sobre este hexagrama; Words on the Text (apenas hex 1-2); comentário yong (apenas hex 1-2). 64 hexagramas.",
    result: "1920/1920 campos coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Fonte clássica vigente",
    currentStatusNote:
      "Comentários acadêmicos verificados para os 64 hexagramas.",
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
      "Footnotes e notas de Simbolismo menor por linha; imagem do Grande Simbolismo e glosas por linha (Apêndice II). 64 hexagramas.",
    result: "Footnotes e simbolismo do Apêndice II totalmente cobertos; verificação PASS.",
    statusKind: "current",
    statusLabel: "Fonte clássica vigente",
    currentStatusNote:
      "Comentários acadêmicos verificados para os 64 hexagramas.",
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
    statusLabel: "Fonte de produção atual",
    currentStatusNote: "Sistema de linhas mutantes padrão na app.",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regras de linhas mutantes: Zhu Xi (clássico)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 de junho de 2026",
    method:
      "Comparação automatizada das regras de redução clássicas da app contra o texto traduzido das regras.",
    standardCompared: "Os principais casos de regra publicados para 2, 3, 4 e 5 linhas mutantes.",
    result: "Final: 10/10 excertos de regra correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Fonte de produção atual",
    currentStatusNote: "Disponível através do seletor «Leitura de linhas mutantes» em Opções.",
  },
];

const BLOCKS_FR: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: vérification initiale",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 juin 2026",
    method:
      "Comparaison automatisée champ par champ (verify:hexagram-fidelity) entre le texte extrait du mirror et le texte servi par l'app.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris les textes spéciaux 用九/用六 des hexagrammes 1 et 2 (514 champs au total).",
    result:
      "Final : 514/514 champs correspondants (100 %). Passes intermédiaires : 94.94 % → 99.81 % → 100 % ; les 6 derniers champs ont été complétés à partir de l'édition imprimée là où le mirror web avait des lacunes.",
    statusKind: "superseded",
    statusLabel: "Remplacée",
    currentStatusNote: "Vérification croisée historique contre le mirror web de l'Université de Parma.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: vérification (édition publiée)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 juin 2026",
    method:
      "Comparaison automatisée champ par champ (verify:hexagram-fidelity) entre le texte extrait d'un EPUB local de l'édition publiée et le texte servi par l'app.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "Final : 514/514 champs correspondants (100 %).",
    statusKind: "current",
    statusLabel: "Source de production actuelle",
    currentStatusNote: "C'est la référence gold par rapport à laquelle l'app se vérifie aujourd'hui.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: vérification initiale",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 juin 2026",
    method: "Comparaison automatisée champ par champ (verify:hexagram-fidelity) contre cette édition publiée.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result:
      "Final : 514/514 champs correspondants (100 %). Passe intermédiaire le 21 juin : 77.19 % → final : 100 % après corrections du parser et du gold, vérifiés directement contre cette édition publiée.",
    statusKind: "superseded",
    statusLabel: "Remplacée",
    currentStatusNote: "Vérification croisée historique contre la reproduction Internet Sacred Text Archive.",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: vérification (édition publiée)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 juin 2026",
    method:
      "Comparaison automatisée champ par champ (verify:hexagram-fidelity) entre le texte extrait d'un EPUB local de l'édition publiée et le texte servi par l'app.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "Final : 514/514 champs correspondants (100 %).",
    statusKind: "current",
    statusLabel: "Source de production actuelle",
    currentStatusNote: "C'est la référence gold par rapport à laquelle l'app se vérifie aujourd'hui.",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: vérification initiale",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 juin 2026",
    method:
      "Le dataset de l'app avait été construit à partir d'une source autre que ctext.org. Première comparaison automatisée champ par champ (verify:hexagram-fidelity) ayant détecté des glyphes erronés et dupliqués dans ce dataset (hex 31 咸/鹹 ; collision d'étiquette hex 19). Le bundle a été rechargé depuis ctext.org et re-vérifié le même jour.",
    standardCompared: "卦辭, 大象 et les 6 traits des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result:
      "Final : 514/514 champs correspondants (100 %). Passe intermédiaire le 21 juin : 90.66 % → final : 100 % après rechargement et correction du parser.",
    statusKind: "superseded",
    statusLabel: "Remplacée",
    currentStatusNote: "Premier passage qualité sur cette source.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: deuxième vérification",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 juin 2026",
    method:
      "Re-exécution indépendante de verify:hexagram-fidelity plus gates de corruption (scan:zhouyi-corruption, check:hex-glyph-uniqueness) les 22-23 juin 2026.",
    standardCompared: "卦辭, 大象 et les 6 traits des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "Final : 514/514 champs correspondants (100 %), avec zéro indicateur de corruption.",
    statusKind: "current",
    statusLabel: "Source de production actuelle",
    currentStatusNote:
      "Deuxième passe indépendante sur la même source; les audits futurs seront numérotés en séquence (troisième, quatrième, …). Chinese Text Project reste la référence gold.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Commentaires classiques: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 juin 2026",
    method:
      "Vérification automatisée des commentaires classiques par rapport à l'édition publiée Wilhelm/Baynes (1950), y compris le commentaire propre de Wilhelm et les Dix Ailes de Confucius.",
    standardCompared:
      "Commentaire propre de Wilhelm et notes des Dix Ailes de Confucius sur jugement, image et chaque ligne; bloc À propos de cet hexagramme; Words on the Text (hex 1-2 seulement); commentaire yong (hex 1-2 seulement). 64 hexagrammes.",
    result: "1920/1920 champs concordants (100%).",
    statusKind: "current",
    statusLabel: "Source classique actuelle",
    currentStatusNote:
      "Commentaires savants vérifiés pour les 64 hexagrammes.",
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
      "Footnotes et notes de Petit Symbolisme par ligne; image du Grand Symbolisme et gloses par ligne (Appendice II). 64 hexagrammes.",
    result: "Footnotes et symbolisme de l'Appendice II entièrement couverts; vérification PASS.",
    statusKind: "current",
    statusLabel: "Source classique actuelle",
    currentStatusNote:
      "Commentaires savants vérifiés pour les 64 hexagrammes.",
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
    statusLabel: "Source de production actuelle",
    currentStatusNote: "Système de lignes changeantes par défaut dans l'app.",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Règles des lignes changeantes: Zhu Xi (classique)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 juin 2026",
    method:
      "Comparaison automatisée des règles de réduction classiques de l'app par rapport au texte traduit des règles.",
    standardCompared: "Les cas de règle principaux publiés pour 2, 3, 4 et 5 lignes changeantes.",
    result: "Final : 10/10 extraits de règle correspondants (100 %).",
    statusKind: "current",
    statusLabel: "Source de production actuelle",
    currentStatusNote: "Disponible via le sélecteur « Lecture des lignes changeantes » dans Options.",
  },
];

const BLOCKS_DE: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: erste Verifikation",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21. Juni 2026",
    method:
      "Automatisierter Feld-für-Feld-Vergleich (verify:hexagram-fidelity) zwischen dem aus dem Mirror extrahierten Text und dem von der App ausgelieferten Text.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich der Sondertexte 用九/用六 für Hexagramm 1 und 2 (514 Felder insgesamt).",
    result:
      "Final: 514/514 Felder übereinstimmend (100 %). Zwischenstände: 94.94 % → 99.81 % → 100 %; die letzten 6 Felder wurden aus der gedruckten Ausgabe ergänzt, wo der Web-Mirror Lücken hatte.",
    statusKind: "superseded",
    statusLabel: "Abgelöst",
    currentStatusNote: "Historischer Abgleich gegen den Web-Mirror der Universität Parma.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: Verifikation (veröffentlichte Ausgabe)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23. Juni 2026",
    method:
      "Automatisierter Feld-für-Feld-Vergleich (verify:hexagram-fidelity) zwischen aus einem lokalen EPUB der veröffentlichten Ausgabe extrahiertem Text und dem von der App ausgelieferten Text.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "Final: 514/514 Felder übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Aktuelle Produktionsquelle",
    currentStatusNote: "Dies ist die Goldreferenz, gegen die die App sich heute verifiziert.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: erste Verifikation",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21. Juni 2026",
    method: "Automatisierter Feld-für-Feld-Vergleich (verify:hexagram-fidelity) gegen diese veröffentlichte Ausgabe.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result:
      "Final: 514/514 Felder übereinstimmend (100 %). Zwischenstand am 21. Juni: 77.19 % → final: 100 % nach Parser- und Gold-Korrekturen, direkt gegen diese veröffentlichte Ausgabe verifiziert.",
    statusKind: "superseded",
    statusLabel: "Abgelöst",
    currentStatusNote: "Historischer Abgleich gegen die Internet Sacred Text Archive-Reproduktion.",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: Verifikation (veröffentlichte Ausgabe)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23. Juni 2026",
    method:
      "Automatisierter Feld-für-Feld-Vergleich (verify:hexagram-fidelity) zwischen aus einem lokalen EPUB der veröffentlichten Ausgabe extrahiertem Text und dem von der App ausgelieferten Text.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "Final: 514/514 Felder übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Aktuelle Produktionsquelle",
    currentStatusNote: "Dies ist die Goldreferenz, gegen die die App sich heute verifiziert.",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: erste Verifikation",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21. Juni 2026",
    method:
      "Das App-Dataset war zuvor aus einer Nicht-ctext-Quelle aufgebaut worden. Erster automatisierter Feld-für-Feld-Vergleich (verify:hexagram-fidelity), der falsche und doppelte Glyphen in diesem Dataset erkannte (Hex 31 咸/鹹; Bezeichnungskollision Hex 19). Das Bundle wurde aus ctext.org neu geladen und am selben Tag erneut verifiziert.",
    standardCompared: "卦辭, 大象 und die 6 Linien aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result:
      "Final: 514/514 Felder übereinstimmend (100 %). Zwischenstand am 21. Juni: 90.66 % → final: 100 % nach Neuladen und Parser-Korrektur.",
    statusKind: "superseded",
    statusLabel: "Abgelöst",
    currentStatusNote: "Erster Qualitätsdurchlauf für diese Quelle.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: zweite Verifikation",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23. Juni 2026",
    method:
      "Unabhängiger erneuter Lauf von verify:hexagram-fidelity plus Korruptions-Gates (scan:zhouyi-corruption, check:hex-glyph-uniqueness) am 22.-23. Juni 2026.",
    standardCompared: "卦辭, 大象 und die 6 Linien aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "514/514 Felder übereinstimmend (100 %), mit null Korruptionsflags.",
    statusKind: "current",
    statusLabel: "Aktuelle Produktionsquelle",
    currentStatusNote:
      "Zweiter unabhängiger Durchlauf gegen dieselbe Quelle; künftige Audits werden fortlaufend nummeriert (dritte, vierte, …). Chinese Text Project bleibt die Goldreferenz.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Klassische Kommentare: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24. Juni 2026",
    method:
      "Automatisierte Verifikation der klassischen Kommentare gegen die veröffentlichte Ausgabe Wilhelm/Baynes (1950), einschließlich Wilhelms eigener Anmerkungen und Konfuzius' Zehn Flügel.",
    standardCompared:
      "Wilhelms eigener Kommentar und Konfuzius' Zehn-Flügel-Noten zu Urteil, Bild und jeder Linie; Block Über dieses Hexagramm; Words on the Text (nur Hex 1-2); yong-Kommentar (nur Hex 1-2). 64 Hexagramme.",
    result: "1920/1920 Felder übereinstimmend (100%).",
    statusKind: "current",
    statusLabel: "Aktuelle klassische Quelle",
    currentStatusNote:
      "Gelehrte Kommentare für alle 64 Hexagramme verifiziert.",
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
      "Footnotes und Kleinere-Symbolik-Liniennoten; Große-Symbolik-Bild und Linienglossen (Anhang II). 64 Hexagramme.",
    result: "Footnotes und Symbolik des Anhangs II vollständig abgedeckt; Verifikation PASS.",
    statusKind: "current",
    statusLabel: "Aktuelle klassische Quelle",
    currentStatusNote:
      "Gelehrte Kommentare für alle 64 Hexagramme verifiziert.",
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
    statusLabel: "Aktuelle Produktionsquelle",
    currentStatusNote: "Standardsystem für wechselnde Linien in der App.",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regeln für wechselnde Linien: Zhu Xi (klassisch)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22. Juni 2026",
    method:
      "Automatisierter Vergleich der klassischen Reduktionsregeln der App gegen den übersetzten Regeltext.",
    standardCompared: "Die zentralen veröffentlichten Regelfälle für 2, 3, 4 und 5 wechselnde Linien.",
    result: "Final: 10/10 Regelausschnitte übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Aktuelle Produktionsquelle",
    currentStatusNote: "Verfügbar über die Auswahl „Lesart wechselnder Linien“ in den Optionen.",
  },
];

const BLOCKS_IT: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: verifica iniziale",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 giugno 2026",
    method:
      "Confronto automatizzato campo per campo (verify:hexagram-fidelity) tra il testo estratto dal mirror e il testo servito dall'app.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, inclusi i testi speciali 用九/用六 per gli esagrammi 1 e 2 (514 campi totali).",
    result:
      "Final: 514/514 campi corrispondenti (100%), passaggi intermedi: 94.94% → 99.81% → 100%; gli ultimi 6 campi sono stati completati dall'edizione stampata dove il mirror web aveva lacune.",
    statusKind: "superseded",
    statusLabel: "Sostituita",
    currentStatusNote: "Verifica incrociata storica contro il mirror web dell'Università di Parma.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: verifica (edizione pubblicata)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 giugno 2026",
    method:
      "Confronto automatizzato campo per campo (verify:hexagram-fidelity) tra il testo estratto da un EPUB locale dell'edizione pubblicata e il testo servito dall'app.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "Final: 514/514 campi corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Fonte di produzione attuale",
    currentStatusNote: "Questo è il riferimento gold rispetto al quale l'app si verifica oggi.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: verifica iniziale",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 giugno 2026",
    method: "Confronto automatizzato campo per campo (verify:hexagram-fidelity) rispetto a questa edizione pubblicata.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result:
      "Final: 514/514 campi corrispondenti (100%). Passaggio intermedio il 21 giugno: 77.19% → final: 100% dopo correzioni del parser e gold, verificati direttamente rispetto a questa edizione pubblicata.",
    statusKind: "superseded",
    statusLabel: "Sostituita",
    currentStatusNote: "Verifica incrociata storica contro la riproduzione Internet Sacred Text Archive.",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: verifica (edizione pubblicata)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 giugno 2026",
    method:
      "Confronto automatizzato campo per campo (verify:hexagram-fidelity) tra il testo estratto da un EPUB locale dell'edizione pubblicata e il testo servito dall'app.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "Final: 514/514 campi corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Fonte di produzione attuale",
    currentStatusNote: "Questo è il riferimento gold rispetto al quale l'app si verifica oggi.",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: verifica iniziale",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 giugno 2026",
    method:
      "Il dataset dell'app era stato costruito da una fonte diversa da ctext.org. Primo confronto automatizzato campo per campo (verify:hexagram-fidelity) che ha rilevato glifi errati e duplicati in quel dataset (hex 31 咸/鹹; collisione etichetta hex 19). Il bundle è stato ricaricato da ctext.org e ri-verificato lo stesso giorno.",
    standardCompared: "卦辭, 大象 e le 6 linee di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result:
      "Final: 514/514 campi corrispondenti (100%). Passaggio intermedio il 21 giugno: 90.66% → final: 100% dopo ricaricamento e correzione del parser.",
    statusKind: "superseded",
    statusLabel: "Sostituita",
    currentStatusNote: "Primo passaggio qualità su questa fonte.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: seconda verifica",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 giugno 2026",
    method:
      "Riesecuzione indipendente di verify:hexagram-fidelity più gate di corruzione (scan:zhouyi-corruption, check:hex-glyph-uniqueness) il 22-23 giugno 2026.",
    standardCompared: "卦辭, 大象 e le 6 linee di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "514/514 campi corrispondenti (100%), con zero indicatori di corruzione.",
    statusKind: "current",
    statusLabel: "Fonte di produzione attuale",
    currentStatusNote:
      "Secondo passaggio indipendente sulla stessa fonte; gli audit futuri saranno numerati in sequenza (terzo, quarto, …). Chinese Text Project resta il riferimento gold.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "Commenti classici: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 giugno 2026",
    method:
      "Verifica automatizzata dei commenti classici rispetto all'edizione pubblicata Wilhelm/Baynes (1950), inclusi il commento proprio di Wilhelm e le Dieci Ali di Confucio.",
    standardCompared:
      "Commento proprio di Wilhelm e note delle Dieci Ali di Confucio su giudizio, immagine e ogni linea; blocco Informazioni su questo esagramma; Words on the Text (solo hex 1-2); commento yong (solo hex 1-2). 64 esagrammi.",
    result: "1920/1920 campi coincidenti (100%).",
    statusKind: "current",
    statusLabel: "Fonte classica attuale",
    currentStatusNote:
      "Commenti accademici verificati per tutti i 64 esagrammi.",
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
      "Footnotes e note di Simbolismo minore per linea; immagine del Grande Simbolismo e glosse per linea (Appendice II). 64 esagrammi.",
    result: "Footnotes e simbolismo dell'Appendice II completamente coperti; verifica PASS.",
    statusKind: "current",
    statusLabel: "Fonte classica attuale",
    currentStatusNote:
      "Commenti accademici verificati per tutti i 64 esagrammi.",
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
    statusLabel: "Fonte di produzione attuale",
    currentStatusNote: "Sistema di linee mutanti predefinito nell'app.",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "Regole delle linee mutanti: Zhu Xi (classico)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 giugno 2026",
    method:
      "Confronto automatizzato delle regole di riduzione classiche dell'app rispetto al testo tradotto delle regole.",
    standardCompared: "I principali casi di regola pubblicati per 2, 3, 4 e 5 linee mutanti.",
    result: "Final: 10/10 estratti di regola corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Fonte di produzione attuale",
    currentStatusNote: "Disponibile tramite il selettore «Lettura delle linee mutanti» in Opzioni.",
  },
];

const BLOCKS_JA: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: 初回検証",
    source: CITATIONS.wilhelmParma,
    verificationDate: "2026年6月21日",
    method:
      "ミラーから抽出したテキストとアプリが提供するテキストとの間で、自動化されたフィールド単位の比較（verify:hexagram-fidelity）を実施。",
    standardCompared:
      "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、および卦1・卦2の特殊テキスト用九/用六を含む、合計514フィールド。",
    result:
      "最終: 514/514フィールドが一致（100%）。中間結果: 94.94% → 99.81% → 100%; Webミラーに欠けていた最後の6フィールドは印刷版で補完。",
    statusKind: "superseded",
    statusLabel: "置き換え済み",
    currentStatusNote: "パルマ大学Webミラーに対する過去の相互検証。",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: 検証（出版版）",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月23日",
    method:
      "出版版のローカルEPUBから抽出したテキストとアプリが提供するテキストとの間で、自動化されたフィールド単位の比較（verify:hexagram-fidelity）を実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result: "最終: 514/514フィールドが一致（100%）。",
    statusKind: "current",
    statusLabel: "現行の本番ソース",
    currentStatusNote: "これは現在アプリが照合の基準とするゴールドリファレンスです。",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: 初回検証",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "2026年6月21日",
    method: "自動化されたフィールド単位の比較（verify:hexagram-fidelity）を、この出版版に対して実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result:
      "最終: 514/514フィールドが一致（100%）。6月21日の中間結果: 77.19% → 最終: 100%（パーサーとゴールドの修正後、この出版版に直接照合して検証）。",
    statusKind: "superseded",
    statusLabel: "置き換え済み",
    currentStatusNote: "Internet Sacred Text Archiveの複製に対する過去の相互検証。",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: 検証（出版版）",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026年6月23日",
    method:
      "出版版のローカルEPUBから抽出したテキストとアプリが提供するテキストとの間で、自動化されたフィールド単位の比較（verify:hexagram-fidelity）を実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result: "最終: 514/514フィールドが一致（100%）。",
    statusKind: "current",
    statusLabel: "現行の本番ソース",
    currentStatusNote: "これは現在アプリが照合の基準とするゴールドリファレンスです。",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "周易: 初回検証",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月21日",
    method:
      "アプリのデータセットはctext.org以外のソースから構築されていました。初回の自動化されたフィールド単位の比較（verify:hexagram-fidelity）で、そのデータセット内の誤字・重複字形を検出（卦31 咸/鹹; 卦19のラベル衝突）。バンドルをctext.orgから再読み込みし、同日に再検証。",
    standardCompared: "全64卦の卦辭、大象、6本の爻、用九/用六を含む、合計514フィールド。",
    result:
      "最終: 514/514フィールドが一致（100%）。6月21日の中間結果: 90.66% → 最終: 100%（再読み込みとパーサー修正後）。",
    statusKind: "superseded",
    statusLabel: "置き換え済み",
    currentStatusNote: "このソースに対する最初の品質パス。",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "周易: 第二回検証",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月23日",
    method:
      "2026年6月22-23日にverify:hexagram-fidelityの独立再実行と破損ゲート（scan:zhouyi-corruption, check:hex-glyph-uniqueness）を実施。",
    standardCompared: "全64卦の卦辭、大象、6本の爻、用九/用六を含む、合計514フィールド。",
    result: "最終: 514/514フィールドが一致（100%）、破損フラグゼロ。",
    statusKind: "current",
    statusLabel: "現行の本番ソース",
    currentStatusNote: "同一ソースに対する第二回の独立検証。今後の監査は順番に番号付けされる（第三回、第四回…）。Chinese Text Projectはゴールドリファレンスのまま。"
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "古典注釈: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月24日",
    method:
      "古典注釈を、出版版Wilhelm/Baynes（1950）と照合する自動検証。ウィルヘルム自身の注と孔子の十翼注釈を含む。",
    standardCompared:
      "ウィルヘルム自身の注釈と孔子の十翼による卦辞・象辞・各爻への注；この卦についてブロック；Words on the Text（卦1-2のみ）；用の注釈（卦1-2のみ）。64卦。",
    result: "1920/1920フィールド一致（100%）。",
    statusKind: "current",
    statusLabel: "現行の古典注釈ソース",
    currentStatusNote: "64卦すべての学術注釈を検証済み。",
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
      "脚注と小象伝の各爻注；大象伝の象と各爻の解（付録II）。64卦。",
    result: "脚注と付録IIの象伝を完全カバー；検証PASS。",
    statusKind: "current",
    statusLabel: "現行の古典注釈ソース",
    currentStatusNote: "64卦すべての学術注釈を検証済み。",
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
    statusLabel: "現行の本番ソース",
    currentStatusNote: "アプリのデフォルトの変爻体系。",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "変爻ルール: 朱熹（古典）",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "2026年6月22日",
    method: "アプリの古典的な還元ルールを翻訳されたルールテキストと照合する、自動化された比較を実施。",
    standardCompared: "変爻2本、3本、4本、5本に関する主要な公開ルールケース。",
    result: "最終: 10/10のルール抜粋が一致（100%）。",
    statusKind: "current",
    statusLabel: "現行の本番ソース",
    currentStatusNote: "オプション内の「変爻の読み方」セレクターから利用可能。",
  },
];

const BLOCKS_ZH: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "卫礼贤/贝恩斯: 初步验证",
    source: CITATIONS.wilhelmParma,
    verificationDate: "2026年6月21日",
    method: "在从镜像站提取的文本与应用提供的文本之间进行自动化逐字段比对（verify:hexagram-fidelity）。",
    standardCompared:
      "全部64卦的卦辭、象辭，以及6条爻辭，包括卦1、卦2的特殊文本用九/用六（共514个字段）。",
    result:
      "最终: 514/514个字段一致（100%）。中间结果: 94.94% → 99.81% → 100%；最后6个字段从印刷版补全，因网页镜像存在空缺。",
    statusKind: "superseded",
    statusLabel: "已被取代",
    currentStatusNote: "针对帕尔马大学网页镜像的历史交叉核验。",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "卫礼贤/贝恩斯: 验证（出版版）",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月23日",
    method:
      "在出版版本地EPUB提取的文本与应用提供的文本之间进行自动化逐字段比对（verify:hexagram-fidelity）。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "最终: 514/514个字段一致（100%）。",
    statusKind: "current",
    statusLabel: "当前生产来源",
    currentStatusNote: "这是应用目前用于核验的黄金参照。",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "理雅各: 初步验证",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "2026年6月21日",
    method: "针对本出版版进行自动化逐字段比对（verify:hexagram-fidelity）。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result:
      "最终: 514/514个字段一致（100%）。6月21日中间结果: 77.19% → 最终: 100%（经解析器与黄金标准修正后，直接对照该出版版验证）。",
    statusKind: "superseded",
    statusLabel: "已被取代",
    currentStatusNote: "针对 Internet Sacred Text Archive 复刻版的历史交叉核验。",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "理雅各: 验证（出版版）",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026年6月23日",
    method:
      "在出版版本地EPUB提取的文本与应用提供的文本之间进行自动化逐字段比对（verify:hexagram-fidelity）。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "最终: 514/514个字段一致（100%）。",
    statusKind: "current",
    statusLabel: "当前生产来源",
    currentStatusNote: "这是应用目前用于核验的黄金参照。",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "周易: 初步验证",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月21日",
    method:
      "应用数据集此前来自 ctext.org 以外的来源。首次自动化逐字段比对（verify:hexagram-fidelity）在该数据集中发现错误和重复字形（卦31 咸/鹹；卦19标签冲突）。数据集从 ctext.org 重新加载并于同日再验证。",
    standardCompared: "全部64卦的卦辭、大象，以及6条爻辭，包括用九/用六（共514个字段）。",
    result:
      "最终: 514/514个字段一致（100%）。6月21日中间结果: 90.66% → 最终: 100%（重新加载与解析器修正后）。",
    statusKind: "superseded",
    statusLabel: "已被取代",
    currentStatusNote: "针对该来源的首次质量检查。",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "周易: 第二次验证",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月23日",
    method:
      "2026年6月22-23日独立重跑verify:hexagram-fidelity及损坏检测门（scan:zhouyi-corruption, check:hex-glyph-uniqueness）。",
    standardCompared: "全部64卦的卦辭、大象，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "最终: 514/514个字段一致（100%），损坏标记为零。",
    statusKind: "current",
    statusLabel: "当前生产来源",
    currentStatusNote: "对同一来源的第二次独立验证；未来审计将按序编号（第三次、第四次…）。Chinese Text Project 仍是黄金参照。",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "古典注释: 卫礼贤/贝恩斯",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月24日",
    method:
      "将古典注释与出版版卫礼贤/贝恩斯（1950）进行自动化验证，包括卫礼贤本人注释与孔子十翼注释。",
    standardCompared:
      "卫礼贤本人注释与孔子十翼对卦辞、象辞及六爻的注；关于此卦块；Words on the Text（仅第1-2卦）；用九/用六注释（仅第1-2卦）。64卦。",
    result: "1920/1920 字段一致（100%）。",
    statusKind: "current",
    statusLabel: "现行古典注释来源",
    currentStatusNote: "64卦学术注释均已验证。",
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
      "脚注与小象传各爻注；大象传象与各爻解（附录II）。64卦。",
    result: "脚注与附录II象传全覆盖；验证PASS。",
    statusKind: "current",
    statusLabel: "现行古典注释来源",
    currentStatusNote: "64卦学术注释均已验证。",
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
    statusLabel: "当前生产来源",
    currentStatusNote: "应用中默认的变爻体系。",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "变爻规则: 朱熹（古典）",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "2026年6月22日",
    method: "对比应用的古典简化规则与翻译后的规则文本，进行自动化比对。",
    standardCompared: "已发布的核心规则情形，适用于2、3、4、5条变爻。",
    result: "最终: 10/10条规则摘录一致（100%）。",
    statusKind: "current",
    statusLabel: "当前生产来源",
    currentStatusNote: "可通过「选项」中的变爻读法选择器使用。",
  },
];

const BLOCKS_KO: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: 초기 검증",
    source: CITATIONS.wilhelmParma,
    verificationDate: "2026년 6월 21일",
    method: "미러에서 추출한 텍스트와 앱이 제공하는 텍스트 간의 자동화된 필드별 비교(verify:hexagram-fidelity) 수행.",
    standardCompared:
      "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 그리고 괘 1과 2의 특수 텍스트 용구/용육(用九/用六)을 포함한 총 514개 필드.",
    result:
      "최종: 514/514개 필드 일치(100%). 중간 결과: 94.94% → 99.81% → 100%; 웹 미러에 빠져 있던 마지막 6개 필드는 인쇄판으로 보완.",
    statusKind: "superseded",
    statusLabel: "대체됨",
    currentStatusNote: "파르마 대학 웹 미러에 대한 과거의 상호 검증입니다.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: 검증 (출판판)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026년 6월 23일",
    method:
      "출판판 로컬 EPUB에서 추출한 텍스트와 앱이 제공하는 텍스트 간의 자동화된 필드별 비교(verify:hexagram-fidelity) 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "최종: 514/514개 필드 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 운영 출처",
    currentStatusNote: "이것이 오늘날 앱이 대조하는 기준 참조본입니다.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: 초기 검증",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "2026년 6월 21일",
    method: "자동화된 필드별 비교(verify:hexagram-fidelity)를 이 출판판에 대해 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result:
      "최종: 514/514개 필드 일치(100%). 6월 21일 중간 결과: 77.19% → 최종: 100% (파서 및 골드 수정 후, 이 출판판에 직접 대조하여 검증).",
    statusKind: "superseded",
    statusLabel: "대체됨",
    currentStatusNote: "Internet Sacred Text Archive 복제본에 대한 과거의 상호 검증입니다.",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: 검증 (출판판)",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026년 6월 23일",
    method:
      "출판판 로컬 EPUB에서 추출한 텍스트와 앱이 제공하는 텍스트 간의 자동화된 필드별 비교(verify:hexagram-fidelity) 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "최종: 514/514개 필드 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 운영 출처",
    currentStatusNote: "이것이 오늘날 앱이 대조하는 기준 참조본입니다.",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "주역: 초기 검증",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026년 6월 21일",
    method:
      "앱 데이터셋은 ctext.org가 아닌 다른 출처에서 구축되었습니다. 최초 자동화된 필드별 비교(verify:hexagram-fidelity)에서 해당 데이터셋의 잘못된·중복 자형을 검출(괘31 咸/鹹; 괘19 라벨 충돌). 데이터셋을 ctext.org에서 다시 불러와 같은 날 재검증.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 대상(大象), 6개 효, 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result:
      "최종: 514/514개 필드 일치(100%). 6월 21일 중간 결과: 90.66% → 최종: 100% (재로드 및 파서 수정 후).",
    statusKind: "superseded",
    statusLabel: "대체됨",
    currentStatusNote: "이 출처에 대한 첫 품질 검사.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "주역: 두 번째 검증",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026년 6월 23일",
    method:
      "2026년 6월 22-23일 verify:hexagram-fidelity 독립 재실행 및 손상 게이트(scan:zhouyi-corruption, check:hex-glyph-uniqueness) 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 대상(大象), 6개 효, 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "최종: 514/514개 필드 일치(100%), 손상 플래그 0건.",
    statusKind: "current",
    statusLabel: "현재 운영 출처",
    currentStatusNote: "동일 출처에 대한 두 번째 독립 검증. 향후 감사는 순차적으로 번호가 매겨집니다(세 번째, 네 번째, …). Chinese Text Project는 기준 참조본으로 유지됩니다.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "고전 주석: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026년 6월 24일",
    method:
      "고전 주석을 출판판 Wilhelm/Baynes(1950)과 대조하는 자동 검증. Wilhelm 자신의 주석과 공자의 십익 주석 포함.",
    standardCompared:
      "Wilhelm 자신의 주석과 공자 십익의 괘사·상사·각 효 주석; 이 괘에 대하여 블록; Words on the Text(1-2괴만); 용 주석(1-2괴만). 64괴.",
    result: "1920/1920 필드 일치(100%).",
    statusKind: "current",
    statusLabel: "현행 고전 주석 출처",
    currentStatusNote: "64괴 학술 주석 검증 완료.",
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
      "각주와 소상전 효별 주석; 대상전 상과 효별 해(부록 II). 64괴.",
    result: "각주와 부록 II 상전 완전 커버; 검증 PASS.",
    statusKind: "current",
    statusLabel: "현행 고전 주석 출처",
    currentStatusNote: "64괴 학술 주석 검증 완료.",
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
    statusLabel: "현재 운영 출처",
    currentStatusNote: "앱의 기본 변효 체계입니다.",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "변효 규칙: 주희(고전)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "2026년 6월 22일",
    method: "앱의 고전적 축소 규칙을 번역된 규칙 텍스트와 대조한 자동화된 비교 수행.",
    standardCompared: "변효 2, 3, 4, 5개에 대한 핵심 공개 규칙 사례.",
    result: "최종: 10/10 규칙 발췌 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 운영 출처",
    currentStatusNote: "옵션의 「변효 읽기」 선택기를 통해 이용 가능.",
  },
];

const BLOCKS_AR: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: التحقق الأولي",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 يونيو 2026",
    method:
      "مقارنة تلقائية حقل بحقل (verify:hexagram-fidelity) بين النص المستخرج من المرآة والنص الذي يقدمه التطبيق.",
    standardCompared:
      "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك النصوص الخاصة 用九/用六 للهكساغرامين 1 و2 (514 حقلاً إجمالاً).",
    result:
      "نهائي: تطابق 514/514 حقلاً (100%)، مراحل وسيطة: 94.94% → 99.81% → 100%؛ اكتملت الحقول الستة الأخيرة من النسخة المطبوعة حيث كان للمرآة فراغات.",
    statusKind: "superseded",
    statusLabel: "مستبدَل",
    currentStatusNote: "تحقق تاريخي متبادل ضد مرآة الويب لجامعة Parma.",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: التحقق (النسخة المنشورة)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 يونيو 2026",
    method:
      "مقارنة تلقائية حقل بحقل (verify:hexagram-fidelity) بين نص مستخرج من EPUB محلي للنسخة المنشورة والنص الذي يقدمه التطبيق.",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "نهائي: تطابق 514/514 حقلاً (100%).",
    statusKind: "current",
    statusLabel: "مصدر الإنتاج الحالي",
    currentStatusNote: "هذا هو المرجع الذهبي الذي يتحقق التطبيق مقابله اليوم.",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: التحقق الأولي",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 يونيو 2026",
    method: "مقارنة تلقائية حقل بحقل (verify:hexagram-fidelity) مقابل هذه النسخة المنشورة.",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result:
      "نهائي: تطابق 514/514 حقلاً (100%). مرحلة وسيطة في 21 يونيو: 77.19% → نهائي: 100% بعد تصحيحات المحلل والمرجع الذهبي، تم التحقق مباشرة مقابل هذه النسخة المنشورة.",
    statusKind: "superseded",
    statusLabel: "مستبدَل",
    currentStatusNote: "تحقق تاريخي متبادل ضد نسخة Internet Sacred Text Archive.",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: التحقق (النسخة المنشورة)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 يونيو 2026",
    method:
      "مقارنة تلقائية حقل بحقل (verify:hexagram-fidelity) بين نص مستخرج من EPUB محلي للنسخة المنشورة والنص الذي يقدمه التطبيق.",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "نهائي: تطابق 514/514 حقلاً (100%).",
    statusKind: "current",
    statusLabel: "مصدر الإنتاج الحالي",
    currentStatusNote: "هذا هو المرجع الذهبي الذي يتحقق التطبيق مقابله اليوم.",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: التحقق الأولي",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 يونيو 2026",
    method:
      "كانت مجموعة بيانات التطبيق قد بُنيت من مصدر غير ctext.org. أول مقارنة تلقائية حقل بحقل (verify:hexagram-fidelity) كشفت عن حروف خاطئة ومكررة في تلك المجموعة (هكس 31 咸/鹹؛ تصادم تسمية هكس 19). أُعيد تحميل الحزمة من ctext.org وأُعيد التحقق في اليوم نفسه.",
    standardCompared: "卦辭، 大象، والخطوط الستة لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result:
      "نهائي: تطابق 514/514 حقلاً (100%). مرحلة وسيطة في 21 يونيو: 90.66% → نهائي: 100% بعد إعادة التحميل وتصحيح المحلل.",
    statusKind: "superseded",
    statusLabel: "مستبدَل",
    currentStatusNote: "أول مرحلة جودة على هذا المصدر.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: التحقق الثاني",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 يونيو 2026",
    method:
      "إعادة تشغيل مستقلة لـ verify:hexagram-fidelity بالإضافة إلى بوابات الفساد (scan:zhouyi-corruption, check:hex-glyph-uniqueness) في 22-23 يونيو 2026.",
    standardCompared: "卦辭، 大象، والخطوط الستة لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "نهائي: تطابق 514/514 حقلاً (100%)، مع صفر مؤشرات فساد.",
    statusKind: "current",
    statusLabel: "مصدر الإنتاج الحالي",
    currentStatusNote: "المرور الثاني المستقل على نفس المصدر؛ ستُرقَّم عمليات التدقيق المستقبلية بالتسلسل (الثالث، الرابع، …). Chinese Text Project يبقى المرجع الذهبي.",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "شروح تقليدية: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 يونيو 2026",
    method:
      "تحقق آلي من الشروح التقليدية مقابل النسخة المنشورة Wilhelm/Baynes (1950)، بما في ذلك شرح Wilhelm نفسه وشروح العشرة أجنحة لConfucius.",
    standardCompared:
      "شرح Wilhelm نفسه وملاحظات العشرة أجنحة لConfucius على الحكم والصورة وكل خط؛ كتلة حول هذا الHexagram؛ Words on the Text (Hexagram 1-2 فقط)؛ شرح yong (1-2 فقط). 64 hexagram.",
    result: "1920/1920 حقلاً متطابقاً (100%).",
    statusKind: "current",
    statusLabel: "مصدر الشرح التقليدي الحالي",
    currentStatusNote: "شروح أكاديمية مُحققة لجميع الـ64 hexagram.",
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
      "Footnotes وملاحظات الرمزية الصغرى لكل خط؛ صورة الرمزية الكبرى وشروح الخطوط (الملحق II). 64 hexagram.",
    result: "Footnotes ورمزية الملحق II مغطاة بالكامل؛ تحقق PASS.",
    statusKind: "current",
    statusLabel: "مصدر الشرح التقليدي الحالي",
    currentStatusNote: "شروح أكاديمية مُحققة لجميع الـ64 hexagram.",
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
    statusLabel: "مصدر الإنتاج الحالي",
    currentStatusNote: "نظام الخطوط المتغيرة الافتراضي في التطبيق.",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "قواعد الخطوط المتغيرة: Zhu Xi (كلاسيكي)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 يونيو 2026",
    method: "مقارنة تلقائية لقواعد الاختزال الكلاسيكية في التطبيق مقابل نص القواعد المترجم.",
    standardCompared: "حالات القواعد الأساسية المنشورة لـ 2 و3 و4 و5 خطوط متغيرة.",
    result: "نهائي: تطابق 10/10 مقتطفات القواعد (100%).",
    statusKind: "current",
    statusLabel: "مصدر الإنتاج الحالي",
    currentStatusNote: "متاح عبر محدد «قراءة الخطوط المتغيرة» في الخيارات.",
  },
];

const BLOCKS_HI: AuditSourceBlock[] = [
  {
    id: "wilhelm-parma-initial-2026-06-21",
    category: "oracle-text",
    title: "Wilhelm/Baynes: प्रारंभिक सत्यापन",
    source: CITATIONS.wilhelmParma,
    verificationDate: "21 जून 2026",
    method:
      "मिरर से निकाले गए पाठ और ऐप द्वारा परोसे गए पाठ के बीच स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना (verify:hexagram-fidelity)।",
    standardCompared:
      "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें हेक्साग्राम 1 और 2 के विशेष पाठ 用九/用六 शामिल हैं (कुल 514 फ़ील्ड)।",
    result:
      "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)। मध्यवर्ती चरण: 94.94% → 99.81% → 100%; अंतिम 6 फ़ील्ड मुद्रित संस्करण से पूरे किए गए जहाँ वेब मिरर में अंतराल थे।",
    statusKind: "superseded",
    statusLabel: "प्रतिस्थापित",
    currentStatusNote: "Parma विश्वविद्यालय वेब मिरर के विरुद्ध ऐतिहासिक क्रॉस-चेक।",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: सत्यापन (प्रकाशित संस्करण)",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "23 जून 2026",
    method:
      "प्रकाशित संस्करण के स्थानीय EPUB से निकाले गए पाठ और ऐप द्वारा परोसे गए पाठ के बीच स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना (verify:hexagram-fidelity)।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "वर्तमान उत्पादन स्रोत",
    currentStatusNote: "यह वह स्वर्ण संदर्भ है जिसके विरुद्ध ऐप आज सत्यापित होता है।",
  },
  {
    id: "legge-sacred-texts-initial-2026-06-21",
    category: "oracle-text",
    title: "James Legge: प्रारंभिक सत्यापन",
    source: CITATIONS.leggeSacredTexts,
    verificationDate: "21 जून 2026",
    method: "स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना (verify:hexagram-fidelity) इस प्रकाशित संस्करण के विरुद्ध।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result:
      "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)। 21 जून का मध्यवर्ती चरण: 77.19% → अंतिम: 100% पार्सर और गोल्ड सुधार के बाद, इस प्रकाशित संस्करण के विरुद्ध सीधे सत्यापित।",
    statusKind: "superseded",
    statusLabel: "प्रतिस्थापित",
    currentStatusNote: "Internet Sacred Text Archive प्रतिरूप के विरुद्ध ऐतिहासिक क्रॉस-चेक।",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: सत्यापन (प्रकाशित संस्करण)",
    source: CITATIONS.leggeOxford,
    verificationDate: "23 जून 2026",
    method:
      "प्रकाशित संस्करण के स्थानीय EPUB से निकाले गए पाठ और ऐप द्वारा परोसे गए पाठ के बीच स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना (verify:hexagram-fidelity)।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "वर्तमान उत्पादन स्रोत",
    currentStatusNote: "यह वह स्वर्ण संदर्भ है जिसके विरुद्ध ऐप आज सत्यापित होता है।",
  },
  {
    id: "zhouyi-ctext-initial-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: प्रारंभिक सत्यापन",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 जून 2026",
    method:
      "ऐप डेटासेट ctext.org के अलावा किसी अन्य स्रोत से बना था। पहली स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना (verify:hexagram-fidelity) ने उस डेटासेट में गलत और दोहरे अक्षर पाए (hex 31 咸/鹹; hex 19 लेबल टकराव)। बंडल ctext.org से पुनः लोड किया गया और उसी दिन पुनः सत्यापित।",
    standardCompared: "सभी 64 हेक्साग्राम का 卦辭, 大象, और 6 रेखाएँ, जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result:
      "अंतिम: 514/514 फ़ील्ड मेल खाए (100%)। 21 जून का मध्यवर्ती चरण: 90.66% → अंतिम: 100% पुनः लोड और पार्सर सुधार के बाद।",
    statusKind: "superseded",
    statusLabel: "प्रतिस्थापित",
    currentStatusNote: "इस स्रोत पर पहला गुणवत्ता पास।",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: दूसरा सत्यापन",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "23 जून 2026",
    method:
      "22-23 जून 2026 को verify:hexagram-fidelity का स्वतंत्र पुनः-चालन और भ्रष्टाचार गेट (scan:zhouyi-corruption, check:hex-glyph-uniqueness)।",
    standardCompared: "सभी 64 हेक्साग्राम का 卦辭, 大象, और 6 रेखाएँ, जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "अंतिम: 514/514 फ़ील्ड मेल खाए (100%), शून्य भ्रष्टाचार ध्वज।",
    statusKind: "current",
    statusLabel: "वर्तमान उत्पादन स्रोत",
    currentStatusNote:
      "एक ही स्रोत पर दूसरा स्वतंत्र पास; भविष्य के ऑडिट क्रमानुसार नंबर किए जाएँगे (तीसरा, चौथा, …)। Chinese Text Project स्वर्ण संदर्भ बना रहता है।",
  },
  {
    id: "wilhelm-commentary-txt-maestro-2026-06-23",
    category: "library-commentary",
    title: "शास्त्रीय टिप्पणियाँ: Wilhelm/Baynes",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "24 जून 2026",
    method:
      "शास्त्रीय टिप्पणियों का Wilhelm/Baynes (1950) प्रकाशित संस्करण के विरुद्ध स्वचालित सत्यापन, Wilhelm का अपना टीका और Confucius के दस पंख की टिप्पणी सहित।",
    standardCompared:
      "Wilhelm का अपना टीका और Confucius के दस पंख की judgment/image/प्रत्येक रेखा पर टिप्पणियाँ; About this hexagram ब्लॉक; Words on the Text (केवल hex 1-2); yong टीका (1-2)। 64 हेक्साग्राम।",
    result: "1920/1920 फ़ील्ड मेल (100%)।",
    statusKind: "current",
    statusLabel: "वर्तमान शास्त्रीय स्रोत",
    currentStatusNote: "सभी 64 हेक्साग्राम के लिए शास्त्रीय टिप्पणियाँ सत्यापित।",
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
      "Footnotes और Lesser Symbolism रेखा-टिप्पणियाँ; Great Symbolism image और रेखा-ग्लोस (Appendix II)। 64 हेक्साग्राम।",
    result: "Footnotes और Appendix II symbolism पूर्ण कवर; सत्यापन PASS।",
    statusKind: "current",
    statusLabel: "वर्तमान शास्त्रीय स्रोत",
    currentStatusNote: "सभी 64 हेक्साग्राम के लिए शास्त्रीय टिप्पणियाँ सत्यापित।",
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
    statusLabel: "वर्तमान उत्पादन स्रोत",
    currentStatusNote: "ऐप में डिफ़ॉल्ट बदलती-रेखा प्रणाली।",
  },
  {
    id: "zhuxi-adler-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "बदलती-रेखा नियम: Zhu Xi (शास्त्रीय)",
    source: CITATIONS.zhuxiAdler,
    verificationDate: "22 जून 2026",
    method: "ऐप के शास्त्रीय समाहार नियमों की अनुवादित नियम पाठ के विरुद्ध स्वचालित तुलना।",
    standardCompared: "2, 3, 4, और 5 बदलती रेखाओं के लिए मुख्य प्रकाशित नियम मामले।",
    result: "अंतिम: 10/10 नियम अंश मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "वर्तमान उत्पादन स्रोत",
    currentStatusNote: "विकल्पों में «बदलती-रेखा पठन» चयनकर्ता के माध्यम से उपलब्ध।",
  },
];

const EN_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Fidelity Audits",
  oracleTextSectionHeading: "I Ching oracle texts",
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
