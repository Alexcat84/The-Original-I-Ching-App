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
export type AuditBlockCategory = "oracle-text" | "mutation-rule";

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
  verificationDateIso: string;
  headline: string;
  statusKind: AuditBlockStatusKind;
  statusLabel: string;
  source?: AuditSourceCitation;
  method?: string;
  standardCompared?: string;
  result?: string;
  currentStatusNote?: string;
};

export type AuditsPageUiMessages = {
  /** Page `<title>` / Open Graph only; not rendered in the article body. */
  title: string;
  blockSourceLabel: string;
  blockMethodLabel: string;
  blockStandardLabel: string;
  blockResultLabel: string;
  blockStatusLabel: string;
  timeline: AuditTimelineEntry[];
};

/** Sort metadata keyed by block/report id (ISO date is locale-neutral). */
const TIMELINE_META: Record<string, { verificationDateIso: string; sortOrder: number }> = {
  "library-commentary-2026-06-24": { verificationDateIso: "2026-06-24", sortOrder: 0 },
  "legge-oxford-pdf-2026-06-22": { verificationDateIso: "2026-06-22", sortOrder: 0 },
  "wilhelm-pantheon-pdf-2026-06-22": { verificationDateIso: "2026-06-22", sortOrder: 1 },
  "huang-mutation-pdf-2026-06-22": { verificationDateIso: "2026-06-22", sortOrder: 2 },
  "zhuxi-adler-mutation-pdf-2026-06-22": { verificationDateIso: "2026-06-22", sortOrder: 3 },
  "zhouyi-ctext-2026-06-21": { verificationDateIso: "2026-06-23", sortOrder: 0 },
  "wilhelm-parma-initial-2026-06-21": { verificationDateIso: "2026-06-21", sortOrder: 0 },
  "legge-sacred-texts-initial-2026-06-21": { verificationDateIso: "2026-06-21", sortOrder: 1 },
  "line-reading-selector-2026-06-20": { verificationDateIso: "2026-06-20", sortOrder: 0 },
};

function timelineMetaFor(id: string): { verificationDateIso: string; sortOrder: number } {
  const meta = TIMELINE_META[id];
  if (!meta) {
    throw new Error(`Missing TIMELINE_META for audit entry "${id}"`);
  }
  return meta;
}

function blockToTimelineEntry(block: AuditSourceBlock): AuditTimelineEntry & { sortOrder: number } {
  const { verificationDateIso, sortOrder } = timelineMetaFor(block.id);
  return {
    id: block.id,
    kind: "verification",
    verificationDateIso,
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

function reportToTimelineEntry(report: AuditReportEntry): AuditTimelineEntry & { sortOrder: number } {
  const { verificationDateIso, sortOrder } = timelineMetaFor(report.id);
  return {
    id: report.id,
    kind: "release",
    verificationDateIso,
    sortOrder,
    headline: report.title,
    statusKind: "current",
    statusLabel: report.statusLabel,
    result: report.summary,
    currentStatusNote: report.summary,
  };
}

function buildTimeline(
  blocks: AuditSourceBlock[],
  reports: AuditReportEntry[],
): AuditTimelineEntry[] {
  return [...blocks.map(blockToTimelineEntry), ...reports.map(reportToTimelineEntry)]
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
    citation: "Zhu Xi. (n.d.). ",
    title: "Yixue Qimeng",
    rest: " [易學啟蒙] (J. A. Adler, Trans., as Introduction to the study of the classic of change). Global Scholarly Publications, 2002. (Original work published ca. 1186).",
  },
} satisfies Record<string, AuditSourceCitation>;

const REPORTS_EN: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 Jun 2026",
    title: "Library: classical commentary and accordion UI",
    summary:
      "Feature release: optional classical commentary (Wilhelm and Legge) in the Hexagram Library, shown as an expandable \"+\" next to the Judgment, the Image, and each line. Result: pass. Library-only, never sent to the AI during a consultation.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 Jun 2026",
    title: "Dual line-reading systems (Huang or Zhu Xi)",
    summary:
      "Feature release: user-selectable Huang or Zhu Xi changing-line reading. Result: pass. Both systems available in the app.",
    status: "closed",
    statusLabel: "Closed",
  },
];

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
      "514/514 fields matched (100%), after two rounds of extractor correction (94.94% → 99.81% → 100%, completing with the printed edition the 6 fields the web mirror did not include).",
    statusKind: "superseded",
    statusLabel: "Superseded",
    currentStatusNote:
      "Historical cross-check. Since 22 Jun 2026 the production source is the printed edition (see the next entry).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: printed edition",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "22 Jun 2026",
    method:
      "Automated field-by-field comparison (verify:hexagram-fidelity) between OCR text from the printed edition and the text served by the app.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "514/514 fields matched (100%).",
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
    method: "Automated field-by-field comparison (verify:hexagram-fidelity).",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result:
      "514/514 fields matched (100%), after re-extracting directly from this source (an initial pass using a different scrape matched 77.19%).",
    statusKind: "superseded",
    statusLabel: "Superseded",
    currentStatusNote:
      "Historical cross-check. Since 22 Jun 2026 the production source is the Sacred Books of the East Oxford scan (see the next entry).",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: Sacred Books of the East scan",
    source: CITATIONS.leggeOxford,
    verificationDate: "22 Jun 2026",
    method: "Automated field-by-field comparison against an Oxford-scanned PDF of the original edition.",
    standardCompared:
      "Judgment (卦辭), Image (象辭), and the 6 lines (爻辭) of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "514/514 fields matched (100%).",
    statusKind: "current",
    statusLabel: "Current production source",
    currentStatusNote: "This is the gold reference the app verifies against today.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: classical Chinese text",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 Jun 2026 (re-confirmed 22-23 Jun 2026)",
    method: "Automated field-by-field comparison against the text served by ctext.org's API and HTML pages.",
    standardCompared:
      "卦辭, 大象, and the 6 lines of all 64 hexagrams, including 用九/用六 (514 fields total).",
    result: "514/514 fields matched (100%).",
    statusKind: "permanent",
    statusLabel: "Permanent production source",
    currentStatusNote:
      "Chinese Text Project is the permanent gold reference for the Zhou Yi: the classical text is verified against this scholarly digital archive rather than a printed scan, by design.",
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
    result: "9/9 rule cases matched.",
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
    result: "Core rule cases matched.",
    statusKind: "current",
    statusLabel: "Current production source",
    currentStatusNote: "Available via the Changing-line reading selector in Options.",
  },
];

const REPORTS_ES: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 jun 2026",
    title: "Biblioteca: comentario clásico e interfaz de acordeón",
    summary:
      "Lanzamiento de funcionalidad: comentario clásico opcional (Wilhelm y Legge) en la Biblioteca de hexagramas, mostrado como un \"+\" desplegable junto al Juicio, la Imagen y cada línea. Resultado: aprobado. Solo en la Biblioteca, nunca se envía a la IA durante una consulta.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 jun 2026",
    title: "Dos sistemas de lectura (Huang o Zhu Xi)",
    summary:
      "Lanzamiento de función: lectura Huang o Zhu Xi seleccionable por el usuario. Resultado: aprobado. Ambos sistemas disponibles en la app.",
    status: "closed",
    statusLabel: "Cerrada",
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
      "514/514 campos coincidentes (100%), tras dos rondas de corrección del extractor (94.94% → 99.81% → 100%, completando con la edición impresa los 6 campos que el mirror web no incluía).",
    statusKind: "superseded",
    statusLabel: "Reemplazada",
    currentStatusNote:
      "Verificación cruzada histórica. Desde el 22 jun 2026 la fuente de producción es la edición impresa (ver la siguiente entrada).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: edición impresa",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "22 jun 2026",
    method:
      "Comparación automatizada campo por campo (verify:hexagram-fidelity) entre el texto OCR de la edición impresa y el texto que sirve la app.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "514/514 campos coincidentes (100%).",
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
    method: "Comparación automatizada campo por campo (verify:hexagram-fidelity).",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result:
      "514/514 campos coincidentes (100%), tras re-extraer directamente desde esta fuente (una primera pasada con otro scraping coincidía en 77.19%).",
    statusKind: "superseded",
    statusLabel: "Reemplazada",
    currentStatusNote:
      "Verificación cruzada histórica. Desde el 22 jun 2026 la fuente de producción es el escaneo de Sacred Books of the East de Oxford (ver la siguiente entrada).",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: escaneo Sacred Books of the East",
    source: CITATIONS.leggeOxford,
    verificationDate: "22 jun 2026",
    method: "Comparación automatizada campo por campo contra un PDF escaneado por Oxford de la edición original.",
    standardCompared:
      "Juicio (卦辭), Imagen (象辭) y las 6 líneas (爻辭) de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "514/514 campos coincidentes (100%).",
    statusKind: "current",
    statusLabel: "Fuente de producción vigente",
    currentStatusNote: "Esta es la referencia gold contra la que la app se verifica hoy.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: texto en chino clásico",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 jun 2026 (reconfirmado 22-23 jun 2026)",
    method:
      "Comparación automatizada campo por campo contra el texto que sirve la API y las páginas HTML de ctext.org.",
    standardCompared: "卦辭, 大象 y las 6 líneas de los 64 hexagramas, incluido 用九/用六 (514 campos en total).",
    result: "514/514 campos coincidentes (100%).",
    statusKind: "permanent",
    statusLabel: "Fuente de producción permanente",
    currentStatusNote:
      "Chinese Text Project es la referencia gold permanente para el Zhou Yi: el texto clásico se verifica contra este archivo digital académico en vez de un escaneo impreso, de forma deliberada.",
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
    result: "9/9 casos de regla coincidentes.",
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
    result: "Casos de regla principales coincidentes.",
    statusKind: "current",
    statusLabel: "Fuente de producción vigente",
    currentStatusNote: "Disponible mediante el selector «Lectura de líneas cambiantes» en Opciones.",
  },
];

const REPORTS_PT: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 jun 2026",
    title: "Biblioteca: comentário clássico e interface em acordeão",
    summary:
      "Lançamento de funcionalidade: comentário clássico opcional (Wilhelm e Legge) na Biblioteca de hexagramas, mostrado como um \"+\" expansível junto ao Julgamento, à Imagem e a cada linha. Resultado: aprovado. Apenas na Biblioteca, nunca enviado à IA durante uma consulta.",
    status: "closed",
    statusLabel: "Encerrada",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 jun 2026",
    title: "Dois sistemas de leitura (Huang ou Zhu Xi)",
    summary:
      "Lançamento de funcionalidade: leitura Huang ou Zhu Xi selecionável pelo utilizador. Resultado: aprovado. Ambos os sistemas disponíveis na app.",
    status: "closed",
    statusLabel: "Encerrada",
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
      "514/514 campos correspondentes (100%), após duas rondas de correção do extrator (94.94% → 99.81% → 100%, completando com a edição impressa os 6 campos que o mirror web não incluía).",
    statusKind: "superseded",
    statusLabel: "Substituída",
    currentStatusNote:
      "Verificação cruzada histórica. Desde 22 de junho de 2026 a fonte de produção é a edição impressa (ver a entrada seguinte).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: edição impressa",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "22 de junho de 2026",
    method:
      "Comparação automatizada campo a campo (verify:hexagram-fidelity) entre o texto OCR da edição impressa e o texto servido pela app.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "514/514 campos correspondentes (100%).",
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
    method: "Comparação automatizada campo a campo (verify:hexagram-fidelity).",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result:
      "514/514 campos correspondentes (100%), após reextrair diretamente desta fonte (uma primeira passagem com outro scraping correspondia a 77.19%).",
    statusKind: "superseded",
    statusLabel: "Substituída",
    currentStatusNote:
      "Verificação cruzada histórica. Desde 22 de junho de 2026 a fonte de produção é a digitalização da Sacred Books of the East de Oxford (ver a entrada seguinte).",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: digitalização Sacred Books of the East",
    source: CITATIONS.leggeOxford,
    verificationDate: "22 de junho de 2026",
    method: "Comparação automatizada campo a campo contra um PDF digitalizado por Oxford da edição original.",
    standardCompared:
      "Julgamento (卦辭), Imagem (象辭) e as 6 linhas (爻辭) dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "514/514 campos correspondentes (100%).",
    statusKind: "current",
    statusLabel: "Fonte de produção atual",
    currentStatusNote: "Esta é a referência gold contra a qual a app se verifica hoje.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: texto em chinês clássico",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 de junho de 2026 (reconfirmado em 22-23 de junho de 2026)",
    method: "Comparação automatizada campo a campo contra o texto servido pela API e pelas páginas HTML de ctext.org.",
    standardCompared: "卦辭, 大象 e as 6 linhas dos 64 hexagramas, incluindo 用九/用六 (514 campos no total).",
    result: "514/514 campos correspondentes (100%).",
    statusKind: "permanent",
    statusLabel: "Fonte de produção permanente",
    currentStatusNote:
      "Chinese Text Project é a referência gold permanente para o Zhou Yi: o texto clássico é verificado contra este arquivo digital académico em vez de uma digitalização impressa, de forma deliberada.",
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
    result: "9/9 casos de regra correspondentes.",
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
    result: "Principais casos de regra correspondentes.",
    statusKind: "current",
    statusLabel: "Fonte de produção atual",
    currentStatusNote: "Disponível através do seletor «Leitura de linhas mutantes» em Opções.",
  },
];

const REPORTS_FR: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 juin 2026",
    title: "Bibliothèque : commentaire classique et interface en accordéon",
    summary:
      "Sortie de fonctionnalité : commentaire classique optionnel (Wilhelm et Legge) dans la Bibliothèque des hexagrammes, affiché comme un \"+\" dépliable près du Jugement, de l'Image et de chaque trait. Résultat : réussi. Réservé à la Bibliothèque, jamais envoyé à l'IA pendant une consultation.",
    status: "closed",
    statusLabel: "Clos",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 juin 2026",
    title: "Deux systèmes de lecture (Huang ou Zhu Xi)",
    summary:
      "Sortie de fonctionnalité : lecture Huang ou Zhu Xi sélectionnable par l'utilisateur. Résultat : réussi. Les deux systèmes sont disponibles dans l'app.",
    status: "closed",
    statusLabel: "Clos",
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
      "514/514 champs correspondants (100 %), après deux séries de correction de l'extracteur (94.94 % → 99.81 % → 100 %, complétant avec l'édition imprimée les 6 champs que le mirror web n'incluait pas).",
    statusKind: "superseded",
    statusLabel: "Remplacée",
    currentStatusNote:
      "Vérification croisée historique. Depuis le 22 juin 2026, la source de production est l'édition imprimée (voir l'entrée suivante).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: édition imprimée",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "22 juin 2026",
    method:
      "Comparaison automatisée champ par champ (verify:hexagram-fidelity) entre le texte OCR de l'édition imprimée et le texte servi par l'app.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "514/514 champs correspondants (100 %).",
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
    method: "Comparaison automatisée champ par champ (verify:hexagram-fidelity).",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result:
      "514/514 champs correspondants (100 %), après ré-extraction directe depuis cette source (un premier passage utilisant un autre scraping correspondait à 77.19 %).",
    statusKind: "superseded",
    statusLabel: "Remplacée",
    currentStatusNote:
      "Vérification croisée historique. Depuis le 22 juin 2026, la source de production est le scan Sacred Books of the East d'Oxford (voir l'entrée suivante).",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: scan Sacred Books of the East",
    source: CITATIONS.leggeOxford,
    verificationDate: "22 juin 2026",
    method: "Comparaison automatisée champ par champ contre un PDF scanné par Oxford de l'édition originale.",
    standardCompared:
      "Jugement (卦辭), Image (象辭) et les 6 traits (爻辭) des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "514/514 champs correspondants (100 %).",
    statusKind: "current",
    statusLabel: "Source de production actuelle",
    currentStatusNote: "C'est la référence gold par rapport à laquelle l'app se vérifie aujourd'hui.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: texte en chinois classique",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 juin 2026 (reconfirmé 22-23 juin 2026)",
    method:
      "Comparaison automatisée champ par champ contre le texte servi par l'API et les pages HTML de ctext.org.",
    standardCompared: "卦辭, 大象 et les 6 traits des 64 hexagrammes, y compris 用九/用六 (514 champs au total).",
    result: "514/514 champs correspondants (100 %).",
    statusKind: "permanent",
    statusLabel: "Source de production permanente",
    currentStatusNote:
      "Chinese Text Project est la référence gold permanente pour le Zhou Yi : le texte classique est vérifié par rapport à cette archive numérique savante plutôt qu'un scan imprimé, de façon délibérée.",
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
    result: "9/9 cas de règle correspondants.",
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
    result: "Cas de règle principaux correspondants.",
    statusKind: "current",
    statusLabel: "Source de production actuelle",
    currentStatusNote: "Disponible via le sélecteur « Lecture des lignes changeantes » dans Options.",
  },
];

const REPORTS_DE: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24. Juni 2026",
    title: "Bibliothek: klassischer Kommentar und Akkordeon-Oberfläche",
    summary:
      "Feature-Release: optionaler klassischer Kommentar (Wilhelm und Legge) in der Hexagramm-Bibliothek, gezeigt als aufklappbares \"+\" neben dem Urteil, dem Bild und jeder Linie. Ergebnis: bestanden. Nur in der Bibliothek, nie an die KI während einer Beratung gesendet.",
    status: "closed",
    statusLabel: "Abgeschlossen",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20. Juni 2026",
    title: "Zwei Lesesysteme (Huang oder Zhu Xi)",
    summary:
      "Feature-Release: vom Nutzer wählbare Huang- oder Zhu-Xi-Lesart wechselnder Linien. Ergebnis: bestanden. Beide Systeme in der App verfügbar.",
    status: "closed",
    statusLabel: "Abgeschlossen",
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
      "514/514 Felder übereinstimmend (100 %), nach zwei Korrekturrunden des Extraktors (94.94 % → 99.81 % → 100 %, wobei die 6 Felder, die der Web-Mirror nicht enthielt, mit der gedruckten Ausgabe ergänzt wurden).",
    statusKind: "superseded",
    statusLabel: "Abgelöst",
    currentStatusNote:
      "Historischer Abgleich. Seit dem 22. Juni 2026 ist die gedruckte Ausgabe die Produktionsquelle (siehe den nächsten Eintrag).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: gedruckte Ausgabe",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "22. Juni 2026",
    method:
      "Automatisierter Feld-für-Feld-Vergleich (verify:hexagram-fidelity) zwischen dem OCR-Text der gedruckten Ausgabe und dem von der App ausgelieferten Text.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "514/514 Felder übereinstimmend (100 %).",
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
    method: "Automatisierter Feld-für-Feld-Vergleich (verify:hexagram-fidelity).",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result:
      "514/514 Felder übereinstimmend (100 %), nach erneuter direkter Extraktion aus dieser Quelle (ein erster Durchlauf mit einem anderen Scraping stimmte zu 77.19 % überein).",
    statusKind: "superseded",
    statusLabel: "Abgelöst",
    currentStatusNote:
      "Historischer Abgleich. Seit dem 22. Juni 2026 ist der Oxford-Scan der Sacred Books of the East die Produktionsquelle (siehe den nächsten Eintrag).",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: Sacred Books of the East-Scan",
    source: CITATIONS.leggeOxford,
    verificationDate: "22. Juni 2026",
    method: "Automatisierter Feld-für-Feld-Vergleich gegen ein von Oxford gescanntes PDF der Originalausgabe.",
    standardCompared:
      "Urteil (卦辭), Bild (象辭) und die 6 Linien (爻辭) aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "514/514 Felder übereinstimmend (100 %).",
    statusKind: "current",
    statusLabel: "Aktuelle Produktionsquelle",
    currentStatusNote: "Dies ist die Goldreferenz, gegen die die App sich heute verifiziert.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: klassischer chinesischer Text",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21. Juni 2026 (erneut bestätigt am 22.-23. Juni 2026)",
    method:
      "Automatisierter Feld-für-Feld-Vergleich gegen den von der API und den HTML-Seiten von ctext.org ausgelieferten Text.",
    standardCompared: "卦辭, 大象 und die 6 Linien aller 64 Hexagramme, einschließlich 用九/用六 (514 Felder insgesamt).",
    result: "514/514 Felder übereinstimmend (100 %).",
    statusKind: "permanent",
    statusLabel: "Permanente Produktionsquelle",
    currentStatusNote:
      "Chinese Text Project ist die permanente Goldreferenz für den Zhou Yi: Der klassische Text wird bewusst gegen dieses wissenschaftliche digitale Archiv verifiziert statt gegen einen gedruckten Scan.",
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
    result: "9/9 Regelfälle übereinstimmend.",
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
    result: "Zentrale Regelfälle übereinstimmend.",
    statusKind: "current",
    statusLabel: "Aktuelle Produktionsquelle",
    currentStatusNote: "Verfügbar über die Auswahl „Lesart wechselnder Linien“ in den Optionen.",
  },
];

const REPORTS_IT: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 giugno 2026",
    title: "Biblioteca: commento classico e interfaccia ad accordion",
    summary:
      "Rilascio funzionalità: commento classico opzionale (Wilhelm e Legge) nella Biblioteca degli esagrammi, mostrato come un \"+\" espandibile accanto al Giudizio, all'Immagine e a ciascuna linea. Risultato: superato. Solo nella Biblioteca, mai inviato all'IA durante una consultazione.",
    status: "closed",
    statusLabel: "Chiusa",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 giu 2026",
    title: "Due sistemi di lettura (Huang o Zhu Xi)",
    summary:
      "Rilascio funzionalità: lettura Huang o Zhu Xi selezionabile dall'utente. Risultato: superato. Entrambi i sistemi disponibili nell'app.",
    status: "closed",
    statusLabel: "Chiusa",
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
      "514/514 campi corrispondenti (100%), dopo due cicli di correzione dell'estrattore (94.94% → 99.81% → 100%, completando con l'edizione stampata i 6 campi che il mirror web non includeva).",
    statusKind: "superseded",
    statusLabel: "Sostituita",
    currentStatusNote:
      "Verifica incrociata storica. Dal 22 giugno 2026 la fonte di produzione è l'edizione stampata (vedi la voce successiva).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: edizione stampata",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "22 giugno 2026",
    method:
      "Confronto automatizzato campo per campo (verify:hexagram-fidelity) tra il testo OCR dell'edizione stampata e il testo servito dall'app.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "514/514 campi corrispondenti (100%).",
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
    method: "Confronto automatizzato campo per campo (verify:hexagram-fidelity).",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result:
      "514/514 campi corrispondenti (100%), dopo una nuova estrazione diretta da questa fonte (un primo passaggio con uno scraping diverso corrispondeva al 77.19%).",
    statusKind: "superseded",
    statusLabel: "Sostituita",
    currentStatusNote:
      "Verifica incrociata storica. Dal 22 giugno 2026 la fonte di produzione è la scansione Sacred Books of the East di Oxford (vedi la voce successiva).",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: scansione Sacred Books of the East",
    source: CITATIONS.leggeOxford,
    verificationDate: "22 giugno 2026",
    method: "Confronto automatizzato campo per campo contro un PDF scansionato da Oxford dell'edizione originale.",
    standardCompared:
      "Giudizio (卦辭), Immagine (象辭) e le 6 linee (爻辭) di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "514/514 campi corrispondenti (100%).",
    statusKind: "current",
    statusLabel: "Fonte di produzione attuale",
    currentStatusNote: "Questo è il riferimento gold rispetto al quale l'app si verifica oggi.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: testo in cinese classico",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 giugno 2026 (riconfermato il 22-23 giugno 2026)",
    method: "Confronto automatizzato campo per campo contro il testo servito dall'API e dalle pagine HTML di ctext.org.",
    standardCompared: "卦辭, 大象 e le 6 linee di tutti i 64 esagrammi, incluso 用九/用六 (514 campi totali).",
    result: "514/514 campi corrispondenti (100%).",
    statusKind: "permanent",
    statusLabel: "Fonte di produzione permanente",
    currentStatusNote:
      "Chinese Text Project è il riferimento gold permanente per lo Zhou Yi: il testo classico è verificato rispetto a questo archivio digitale accademico invece di una scansione stampata, di proposito.",
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
    result: "9/9 casi di regola corrispondenti.",
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
    result: "Principali casi di regola corrispondenti.",
    statusKind: "current",
    statusLabel: "Fonte di produzione attuale",
    currentStatusNote: "Disponibile tramite il selettore «Lettura delle linee mutanti» in Opzioni.",
  },
];

const REPORTS_JA: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "2026年6月24日",
    title: "図書館：古典注釈とアコーディオンUI",
    summary:
      "機能リリース：易経図書館における任意の古典注釈（ヴィルヘルムとレッグ）。判断・象・各爻の横の展開可能な「+」で表示。結果：合格。図書館内のみで、相談中にAIへ送信されることはありません。",
    status: "closed",
    statusLabel: "完了",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "2026年6月20日",
    title: "2つの読み方体系（ホアンまたは朱熹）",
    summary:
      "機能リリース: ユーザーが選択可能なホアンまたは朱熹の変爻読み方。結果: 合格。両体系がアプリで利用可能。",
    status: "closed",
    statusLabel: "完了",
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
      "514/514フィールドが一致（100%）。抽出器を2回修正した後の結果（94.94% → 99.81% → 100%。Webミラーに含まれていなかった6フィールドは印刷版で補完）。",
    statusKind: "superseded",
    statusLabel: "置き換え済み",
    currentStatusNote:
      "過去の相互検証。2026年6月22日以降、本番ソースは印刷版です（次の項目を参照）。",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: 印刷版",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月22日",
    method:
      "印刷版のOCRテキストとアプリが提供するテキストとの間で、自動化されたフィールド単位の比較（verify:hexagram-fidelity）を実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result: "514/514フィールドが一致（100%）。",
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
    method: "自動化されたフィールド単位の比較（verify:hexagram-fidelity）を実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result:
      "514/514フィールドが一致（100%）。この出典から直接再抽出した後の結果（別のスクレイピングを使用した最初の試行では77.19%の一致）。",
    statusKind: "superseded",
    statusLabel: "置き換え済み",
    currentStatusNote:
      "過去の相互検証。2026年6月22日以降、本番ソースはオックスフォードによるSacred Books of the Eastのスキャンです（次の項目を参照）。",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: Sacred Books of the Eastのスキャン",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026年6月22日",
    method: "オックスフォードがスキャンした原版のPDFと比較する、自動化されたフィールド単位の比較を実施。",
    standardCompared: "全64卦の判断（卦辭）、象（象辭）、6本の爻（爻辭）、用九/用六を含む、合計514フィールド。",
    result: "514/514フィールドが一致（100%）。",
    statusKind: "current",
    statusLabel: "現行の本番ソース",
    currentStatusNote: "これは現在アプリが照合の基準とするゴールドリファレンスです。",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "周易: 古典中国語テキスト",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月21日（2026年6月22日-23日に再確認）",
    method: "ctext.orgのAPIおよびHTMLページが提供するテキストと比較する、自動化されたフィールド単位の比較を実施。",
    standardCompared: "全64卦の卦辭、大象、6本の爻、用九/用六を含む、合計514フィールド。",
    result: "514/514フィールドが一致（100%）。",
    statusKind: "permanent",
    statusLabel: "永続的な本番ソース",
    currentStatusNote:
      "Chinese Text Projectは周易の永続的なゴールドリファレンスです。意図的に、印刷スキャンではなくこの学術的デジタルアーカイブと照合して古典テキストを検証しています。",
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
    result: "9/9のルールケースが一致。",
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
    result: "主要なルールケースが一致。",
    statusKind: "current",
    statusLabel: "現行の本番ソース",
    currentStatusNote: "オプション内の「変爻の読み方」セレクターから利用可能。",
  },
];

const REPORTS_ZH: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "2026年6月24日",
    title: "图书馆：古典注释与折叠式界面",
    summary:
      "功能发布：易经图书馆中可选的古典注释（威廉与理雅各），以判断、象和每条爻旁可展开的「+」显示。结果：通过。仅限图书馆内，咨询过程中绝不会发送给AI。",
    status: "closed",
    statusLabel: "已结案",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "2026年6月20日",
    title: "双重读法体系（黄忠天或朱熹）",
    summary:
      "功能发布：用户可选择黄忠天或朱熹变爻读法。结果：通过。两种体系均已在应用中提供。",
    status: "closed",
    statusLabel: "已结案",
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
      "514/514个字段一致（100%），经过两轮提取器修正后达成（94.94% → 99.81% → 100%，用印刷版补全了网页镜像未包含的6个字段）。",
    statusKind: "superseded",
    statusLabel: "已被取代",
    currentStatusNote: "历史交叉核验。自2026年6月22日起，生产来源为印刷版（见下一条目）。",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "卫礼贤/贝恩斯: 印刷版",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026年6月22日",
    method: "在印刷版的OCR文本与应用提供的文本之间进行自动化逐字段比对（verify:hexagram-fidelity）。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "514/514个字段一致（100%）。",
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
    method: "进行自动化逐字段比对（verify:hexagram-fidelity）。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "514/514个字段一致（100%），系直接从该来源重新提取后达成（最初使用另一种抓取方式的结果为77.19%一致）。",
    statusKind: "superseded",
    statusLabel: "已被取代",
    currentStatusNote: "历史交叉核验。自2026年6月22日起，生产来源为牛津的Sacred Books of the East扫描版（见下一条目）。",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "理雅各: Sacred Books of the East扫描版",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026年6月22日",
    method: "与牛津扫描的原版PDF进行自动化逐字段比对。",
    standardCompared: "全部64卦的卦辭、象辭，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "514/514个字段一致（100%）。",
    statusKind: "current",
    statusLabel: "当前生产来源",
    currentStatusNote: "这是应用目前用于核验的黄金参照。",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "周易: 古典中文文本",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026年6月21日（2026年6月22-23日再次确认）",
    method: "与ctext.org的API及HTML页面提供的文本进行自动化逐字段比对。",
    standardCompared: "全部64卦的卦辭、大象，以及6条爻辭，包括用九/用六（共514个字段）。",
    result: "514/514个字段一致（100%）。",
    statusKind: "permanent",
    statusLabel: "永久生产来源",
    currentStatusNote:
      "Chinese Text Project是周易的永久黄金参照：经典文本特意对照这一学术性数字档案库进行核验，而非印刷扫描版。",
  },
  {
    id: "huang-mutation-pdf-2026-06-22",
    category: "mutation-rule",
    title: "变爻规则: Alfred Huang",
    source: CITATIONS.huang,
    verificationDate: "2026年6月22日",
    method: "逐条对比应用的简化规则与已发布的规则文本，进行自动化比对。",
    standardCompared: "已发布的9种规则情形，用于将变爻简化为单一的主导爻文本（0至6条变爻，加上用九/用六）。",
    result: "9/9个规则情形一致。",
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
    result: "核心规则情形一致。",
    statusKind: "current",
    statusLabel: "当前生产来源",
    currentStatusNote: "可通过「选项」中的变爻读法选择器使用。",
  },
];

const REPORTS_KO: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "2026년 6월 24일",
    title: "도서관: 고전 주석 및 아코디언 UI",
    summary:
      "기능 출시: 괘사, 상, 각 효 옆에 펼칠 수 있는 \"+\"로 표시되는 헥사그램 도서관의 선택적 고전 주석(빌헬름과 레그). 결과: 통과. 도서관 전용이며 상담 중 AI로 전송되지 않습니다.",
    status: "closed",
    statusLabel: "종료",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "2026년 6월 20일",
    title: "이중 변효 읽기 체계(Huang 또는 주희)",
    summary:
      "기능 출시: 사용자가 선택 가능한 Huang 또는 주희 변효 읽기. 결과: 통과. 두 체계 모두 앱에서 사용 가능.",
    status: "closed",
    statusLabel: "종료",
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
      "514/514개 필드 일치(100%), 추출기 보정 두 차례를 거쳐 달성(94.94% → 99.81% → 100%, 웹 미러에 포함되지 않았던 6개 필드는 인쇄판으로 보완).",
    statusKind: "superseded",
    statusLabel: "대체됨",
    currentStatusNote: "과거의 상호 검증입니다. 2026년 6월 22일부터 운영 출처는 인쇄판입니다 (다음 항목을 참조하세요).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: 인쇄판",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "2026년 6월 22일",
    method: "인쇄판의 OCR 텍스트와 앱이 제공하는 텍스트 간의 자동화된 필드별 비교(verify:hexagram-fidelity) 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "514/514개 필드 일치(100%).",
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
    method: "자동화된 필드별 비교(verify:hexagram-fidelity) 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "514/514개 필드 일치(100%), 이 출처에서 직접 재추출한 후 달성(다른 스크래핑 방식을 사용한 최초 시도는 77.19% 일치).",
    statusKind: "superseded",
    statusLabel: "대체됨",
    currentStatusNote:
      "과거의 상호 검증입니다. 2026년 6월 22일부터 운영 출처는 옥스퍼드의 Sacred Books of the East 스캔본입니다 (다음 항목을 참조하세요).",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: Sacred Books of the East 스캔본",
    source: CITATIONS.leggeOxford,
    verificationDate: "2026년 6월 22일",
    method: "옥스퍼드가 스캔한 원본 PDF와 대조한 자동화된 필드별 비교 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 상(象辭), 6개 효(爻辭), 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "514/514개 필드 일치(100%).",
    statusKind: "current",
    statusLabel: "현재 운영 출처",
    currentStatusNote: "이것이 오늘날 앱이 대조하는 기준 참조본입니다.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "주역: 고전 중국어 텍스트",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "2026년 6월 21일(2026년 6월 22-23일 재확인)",
    method: "ctext.org의 API 및 HTML 페이지가 제공하는 텍스트와 대조한 자동화된 필드별 비교 수행.",
    standardCompared: "64개 괘 전체의 괘사(卦辭), 대상(大象), 6개 효, 용구/용육(用九/用六) 포함, 총 514개 필드.",
    result: "514/514개 필드 일치(100%).",
    statusKind: "permanent",
    statusLabel: "영구 운영 출처",
    currentStatusNote:
      "Chinese Text Project는 주역의 영구적인 기준 참조본입니다. 고전 텍스트는 의도적으로 인쇄 스캔본이 아닌 이 학술적 디지털 아카이브와 대조하여 검증됩니다.",
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
    result: "9/9개 규칙 사례 일치.",
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
    result: "핵심 규칙 사례 일치.",
    statusKind: "current",
    statusLabel: "현재 운영 출처",
    currentStatusNote: "옵션의 「변효 읽기」 선택기를 통해 이용 가능.",
  },
];

const REPORTS_AR: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 يونيو 2026",
    title: "المكتبة: تعليق كلاسيكي وواجهة أكورديون",
    summary:
      "إصدار ميزة: تعليق كلاسيكي اختياري (ويلهلم وليج) في مكتبة الهكساغرامات، يظهر كعلامة \"+\" قابلة للتوسيع بجانب الحكم والصورة وكل خط. النتيجة: نجاح. خاص بالمكتبة فقط، ولا يُرسل إلى الذكاء الاصطناعي أثناء الاستشارة.",
    status: "closed",
    statusLabel: "مغلقة",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 يونيو 2026",
    title: "نظاما قراءة مزدوجان (Huang أو Zhu Xi)",
    summary:
      "إصدار ميزة: قراءة خطوط متغيرة قابلة للاختيار من المستخدم بين Huang وZhu Xi. النتيجة: نجاح. كلا النظامين متاحان في التطبيق.",
    status: "closed",
    statusLabel: "مغلقة",
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
      "تطابق 514/514 حقلاً (100%)، بعد جولتين من تصحيح المستخرج (94.94% → 99.81% → 100%، مع إكمال الحقول الستة التي لم تتضمنها المرآة بالاعتماد على النسخة المطبوعة).",
    statusKind: "superseded",
    statusLabel: "مستبدَل",
    currentStatusNote: "تحقق تاريخي متبادل. منذ 22 يونيو 2026 أصبح مصدر الإنتاج هو النسخة المطبوعة (انظر الإدخال التالي).",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: النسخة المطبوعة",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "22 يونيو 2026",
    method:
      "مقارنة تلقائية حقل بحقل (verify:hexagram-fidelity) بين نص OCR للنسخة المطبوعة والنص الذي يقدمه التطبيق.",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "تطابق 514/514 حقلاً (100%).",
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
    method: "مقارنة تلقائية حقل بحقل (verify:hexagram-fidelity).",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result:
      "تطابق 514/514 حقلاً (100%)، بعد إعادة الاستخراج مباشرة من هذا المصدر (تطابقت محاولة أولية باستخدام طريقة استخراج مختلفة بنسبة 77.19%).",
    statusKind: "superseded",
    statusLabel: "مستبدَل",
    currentStatusNote:
      "تحقق تاريخي متبادل. منذ 22 يونيو 2026 أصبح مصدر الإنتاج هو نسخة Sacred Books of the East الممسوحة من أكسفورد (انظر الإدخال التالي).",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: نسخة Sacred Books of the East الممسوحة",
    source: CITATIONS.leggeOxford,
    verificationDate: "22 يونيو 2026",
    method: "مقارنة تلقائية حقل بحقل مقابل ملف PDF ممسوح من أكسفورد للنسخة الأصلية.",
    standardCompared: "الحكم (卦辭)، الصورة (象辭)، والخطوط الستة (爻辭) لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "تطابق 514/514 حقلاً (100%).",
    statusKind: "current",
    statusLabel: "مصدر الإنتاج الحالي",
    currentStatusNote: "هذا هو المرجع الذهبي الذي يتحقق التطبيق مقابله اليوم.",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: النص الصيني الكلاسيكي",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 يونيو 2026 (أُعيد التأكيد في 22-23 يونيو 2026)",
    method: "مقارنة تلقائية حقل بحقل مقابل النص الذي تقدمه واجهة برمجة التطبيقات وصفحات HTML الخاصة بـ ctext.org.",
    standardCompared: "卦辭، 大象، والخطوط الستة لجميع الـ64 هكساغرام، بما في ذلك 用九/用六 (514 حقلاً إجمالاً).",
    result: "تطابق 514/514 حقلاً (100%).",
    statusKind: "permanent",
    statusLabel: "مصدر الإنتاج الدائم",
    currentStatusNote:
      "يُعد Chinese Text Project المرجع الذهبي الدائم لـ Zhou Yi: يتم التحقق من النص الكلاسيكي مقابل هذا الأرشيف الرقمي العلمي عمداً، بدلاً من نسخة مطبوعة ممسوحة.",
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
    result: "تطابق 9/9 حالات القواعد.",
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
    result: "تطابق حالات القواعد الأساسية.",
    statusKind: "current",
    statusLabel: "مصدر الإنتاج الحالي",
    currentStatusNote: "متاح عبر محدد «قراءة الخطوط المتغيرة» في الخيارات.",
  },
];

const REPORTS_HI: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 जून 2026",
    title: "लाइब्रेरी: शास्त्रीय टिप्पणी और अकॉर्डियन UI",
    summary:
      "फ़ीचर रिलीज़: हेक्साग्राम लाइब्रेरी में वैकल्पिक शास्त्रीय टिप्पणी (विल्हेम और लेग), जो निर्णय, छवि और हर रेखा के पास विस्तार योग्य \"+\" के रूप में दिखती है। परिणाम: उत्तीर्ण। केवल लाइब्रेरी के लिए, परामर्श के दौरान कभी AI को नहीं भेजी जाती।",
    status: "closed",
    statusLabel: "बंद",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 जून 2026",
    title: "दोहरी पठन प्रणालियाँ (Huang या Zhu Xi)",
    summary:
      "फ़ीचर रिलीज़: उपयोगकर्ता द्वारा चयन योग्य Huang या Zhu Xi बदलती-रेखा पठन। परिणाम: पास। ऐप में दोनों प्रणालियाँ उपलब्ध।",
    status: "closed",
    statusLabel: "बंद",
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
      "514/514 फ़ील्ड मेल खाए (100%), एक्सट्रैक्टर सुधार के दो चरणों के बाद (94.94% → 99.81% → 100%, वेब मिरर में शामिल न किए गए 6 फ़ील्ड को मुद्रित संस्करण से पूरा किया गया)।",
    statusKind: "superseded",
    statusLabel: "प्रतिस्थापित",
    currentStatusNote: "ऐतिहासिक क्रॉस-चेक। 22 जून 2026 से उत्पादन स्रोत मुद्रित संस्करण है (अगली प्रविष्टि देखें)।",
  },
  {
    id: "wilhelm-pantheon-pdf-2026-06-22",
    category: "oracle-text",
    title: "Wilhelm/Baynes: मुद्रित संस्करण",
    source: CITATIONS.wilhelmPantheon,
    verificationDate: "22 जून 2026",
    method:
      "मुद्रित संस्करण के OCR पाठ और ऐप द्वारा परोसे गए पाठ के बीच स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना (verify:hexagram-fidelity)।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "514/514 फ़ील्ड मेल खाए (100%)।",
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
    method: "स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना (verify:hexagram-fidelity)।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result:
      "514/514 फ़ील्ड मेल खाए (100%), इस स्रोत से सीधे पुनः-निष्कर्षण के बाद (एक अलग स्क्रैपिंग का उपयोग करने वाला प्रारंभिक प्रयास 77.19% मेल खाया था)।",
    statusKind: "superseded",
    statusLabel: "प्रतिस्थापित",
    currentStatusNote:
      "ऐतिहासिक क्रॉस-चेक। 22 जून 2026 से उत्पादन स्रोत ऑक्सफ़ोर्ड का Sacred Books of the East स्कैन है (अगली प्रविष्टि देखें)।",
  },
  {
    id: "legge-oxford-pdf-2026-06-22",
    category: "oracle-text",
    title: "James Legge: Sacred Books of the East स्कैन",
    source: CITATIONS.leggeOxford,
    verificationDate: "22 जून 2026",
    method: "मूल संस्करण के ऑक्सफ़ोर्ड-स्कैन किए गए PDF के विरुद्ध स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना।",
    standardCompared: "सभी 64 हेक्साग्राम का निर्णय (卦辭), छवि (象辭), और 6 रेखाएँ (爻辭), जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "514/514 फ़ील्ड मेल खाए (100%)।",
    statusKind: "current",
    statusLabel: "वर्तमान उत्पादन स्रोत",
    currentStatusNote: "यह वह स्वर्ण संदर्भ है जिसके विरुद्ध ऐप आज सत्यापित होता है।",
  },
  {
    id: "zhouyi-ctext-2026-06-21",
    category: "oracle-text",
    title: "Zhou Yi: शास्त्रीय चीनी पाठ",
    source: CITATIONS.zhouyiCtext,
    verificationDate: "21 जून 2026 (22-23 जून 2026 को पुनः पुष्टि की गई)",
    method: "ctext.org के API और HTML पृष्ठों द्वारा परोसे गए पाठ के विरुद्ध स्वचालित फ़ील्ड-दर-फ़ील्ड तुलना।",
    standardCompared: "सभी 64 हेक्साग्राम का 卦辭, 大象, और 6 रेखाएँ, जिसमें 用九/用六 शामिल है (कुल 514 फ़ील्ड)।",
    result: "514/514 फ़ील्ड मेल खाए (100%)।",
    statusKind: "permanent",
    statusLabel: "स्थायी उत्पादन स्रोत",
    currentStatusNote:
      "Chinese Text Project, Zhou Yi के लिए स्थायी स्वर्ण संदर्भ है: शास्त्रीय पाठ को जानबूझकर मुद्रित स्कैन के बजाय इस विद्वत्तापूर्ण डिजिटल संग्रह के विरुद्ध सत्यापित किया जाता है।",
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
    result: "9/9 नियम मामले मेल खाए।",
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
    result: "मुख्य नियम मामले मेल खाए।",
    statusKind: "current",
    statusLabel: "वर्तमान उत्पादन स्रोत",
    currentStatusNote: "विकल्पों में «बदलती-रेखा पठन» चयनकर्ता के माध्यम से उपलब्ध।",
  },
];

const EN_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Fidelity Audits",
  blockSourceLabel: "Source",
  blockMethodLabel: "Method",
  blockStandardLabel: "Standard compared",
  blockResultLabel: "Result",
  blockStatusLabel: "Status",
};

const ES_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Auditorías de fidelidad",
  blockSourceLabel: "Fuente",
  blockMethodLabel: "Método",
  blockStandardLabel: "Estándar comparado",
  blockResultLabel: "Resultado",
  blockStatusLabel: "Estado",
};

const PT_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Auditorias de fidelidade",
  blockSourceLabel: "Fonte",
  blockMethodLabel: "Método",
  blockStandardLabel: "Padrão comparado",
  blockResultLabel: "Resultado",
  blockStatusLabel: "Estado",
};

const FR_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Audits de fidélité",
  blockSourceLabel: "Source",
  blockMethodLabel: "Méthode",
  blockStandardLabel: "Norme comparée",
  blockResultLabel: "Résultat",
  blockStatusLabel: "Statut",
};

const DE_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Fidelitätsprüfungen",
  blockSourceLabel: "Quelle",
  blockMethodLabel: "Methode",
  blockStandardLabel: "Verglichener Standard",
  blockResultLabel: "Ergebnis",
  blockStatusLabel: "Status",
};

const IT_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "Audit di fedeltà",
  blockSourceLabel: "Fonte",
  blockMethodLabel: "Metodo",
  blockStandardLabel: "Standard confrontato",
  blockResultLabel: "Risultato",
  blockStatusLabel: "Stato",
};

const JA_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "忠実度監査",
  blockSourceLabel: "出典",
  blockMethodLabel: "方法",
  blockStandardLabel: "比較基準",
  blockResultLabel: "結果",
  blockStatusLabel: "状態",
};

const ZH_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "保真审计",
  blockSourceLabel: "来源",
  blockMethodLabel: "方法",
  blockStandardLabel: "比对标准",
  blockResultLabel: "结果",
  blockStatusLabel: "状态",
};

const KO_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "충실도 감사",
  blockSourceLabel: "출처",
  blockMethodLabel: "방법",
  blockStandardLabel: "비교 기준",
  blockResultLabel: "결과",
  blockStatusLabel: "상태",
};

const AR_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "تدقيقات المطابقة",
  blockSourceLabel: "المصدر",
  blockMethodLabel: "الطريقة",
  blockStandardLabel: "المعيار المُقارَن",
  blockResultLabel: "النتيجة",
  blockStatusLabel: "الحالة",
};

const HI_BASE: Omit<AuditsPageUiMessages, "timeline"> = {
  title: "निष्ठा ऑडिट",
  blockSourceLabel: "स्रोत",
  blockMethodLabel: "विधि",
  blockStandardLabel: "तुलना मानक",
  blockResultLabel: "परिणाम",
  blockStatusLabel: "स्थिति",
};

function withTimeline(
  base: Omit<AuditsPageUiMessages, "timeline">,
  reports: AuditReportEntry[],
  sourceBlocks: AuditSourceBlock[],
): AuditsPageUiMessages {
  return { ...base, timeline: buildTimeline(sourceBlocks, reports) };
}

const AUDITS_PAGE_UI: Record<AppLocale, AuditsPageUiMessages> = {
  en: withTimeline(EN_BASE, REPORTS_EN, BLOCKS_EN),
  es: withTimeline(ES_BASE, REPORTS_ES, BLOCKS_ES),
  pt: withTimeline(PT_BASE, REPORTS_PT, BLOCKS_PT),
  fr: withTimeline(FR_BASE, REPORTS_FR, BLOCKS_FR),
  de: withTimeline(DE_BASE, REPORTS_DE, BLOCKS_DE),
  it: withTimeline(IT_BASE, REPORTS_IT, BLOCKS_IT),
  ja: withTimeline(JA_BASE, REPORTS_JA, BLOCKS_JA),
  zh: withTimeline(ZH_BASE, REPORTS_ZH, BLOCKS_ZH),
  ko: withTimeline(KO_BASE, REPORTS_KO, BLOCKS_KO),
  ar: withTimeline(AR_BASE, REPORTS_AR, BLOCKS_AR),
  hi: withTimeline(HI_BASE, REPORTS_HI, BLOCKS_HI),
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
