import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type AuditReportStatus = "closed" | "monitoring" | "ongoing";

export type AuditReportEntry = {
  id: string;
  date: string;
  title: string;
  summary: string;
  status: AuditReportStatus;
  statusLabel: string;
};

export type AuditsPageUiMessages = {
  title: string;
  lead: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  introHeading: string;
  introBody: string;
  oracleTextsHeading: string;
  oracleTextsBody: string;
  mutationRulesHeading: string;
  mutationRulesIntro: string;
  mutationRulesHuangHeading: string;
  mutationRulesHuangBody: string;
  mutationRulesZhuxiHeading: string;
  mutationRulesZhuxiBody: string;
  methodologyHeading: string;
  methodologyBody: string;
  reportsHeading: string;
  reports: AuditReportEntry[];
  seeAlsoNotes: string;
};

const REPORTS_EN: AuditReportEntry[] = [
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 Jun 2026",
    title: "Oracle texts — Wilhelm & Legge PDF gold",
    summary:
      "Wilhelm/Baynes (Pantheon 1950 PDF): 513/513 gate pass, 512/512 exact match vs bundle. James Legge (SBE XVI OCR): 514/514 gate pass. Zhou Yi (ctext.org): 100% on oracle fields. Tier-0 sources stored locally; automated gates in CI.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 Jun 2026",
    title: "Changing lines — Zhu Xi (Adler trans. Yixue Qimeng ch. IV)",
    summary:
      "10/10 rule snippets verified against Joseph Adler's translation (printed pp. 48–53, notes pp. 64–74). Engine alignment: 8 exact/equivalent, 1 chart rule documented as classical reference (32 diagrams) without runtime lookup.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 Jun 2026",
    title: "Dual line-reading selector (Huang | Zhu Xi)",
    summary:
      "User-selectable mutation system with DB persistence (migration 074). 37 engine regression tests. Prompt gates updated for multi-line and dual-judgment Zhu Xi cases.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 Jun 2026",
    title: "Changing lines — Alfred Huang (Complete I Ching)",
    summary:
      "Full-book PDF verification in progress. Current Huang reduction rules aligned per audit 2026-06-19; book-primary gold extraction pending.",
    status: "ongoing",
    statusLabel: "In progress",
  },
];

const REPORTS_ES: AuditReportEntry[] = [
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 jun 2026",
    title: "Textos del oráculo — Wilhelm y Legge (PDF gold)",
    summary:
      "Wilhelm/Baynes (PDF Pantheon 1950): gate 513/513, coincidencia exacta 512/512 vs bundle. James Legge (SBE XVI OCR): gate 514/514. Zhou Yi (ctext.org): 100% en campos del oráculo. Fuentes Tier-0 locales; gates automatizados.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 jun 2026",
    title: "Líneas cambiantes — Zhu Xi (Adler, Yixue Qimeng cap. IV)",
    summary:
      "10/10 fragmentos de reglas verificados contra la traducción de Joseph Adler (pp. impresas 48–53, notas 64–74). Motor: 8 exactas/equivalentes; regla de 32 diagramas documentada como referencia clásica sin lookup en runtime.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 jun 2026",
    title: "Selector dual de lectura (Huang | Zhu Xi)",
    summary:
      "Sistema de mutación seleccionable por el usuario con persistencia en DB (migración 074). 37 tests de regresión del motor. Gates de prompt actualizados para Zhu Xi multi-línea y doble juicio.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 jun 2026",
    title: "Líneas cambiantes — Alfred Huang (Complete I Ching)",
    summary:
      "Verificación PDF del libro completo en curso. Reglas Huang actuales alineadas según auditoría 2026-06-19; extracción gold book-primary pendiente.",
    status: "ongoing",
    statusLabel: "En curso",
  },
];

const EN_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Fidelity Audits",
  lead:
    "Independent verification of oracle texts and changing-line rules. We publish methodology and results so readers can trust — and challenge — what the app delivers.",
  lastUpdatedLabel: "Last updated",
  lastUpdated: "22 June 2026",
  introHeading: "Why we publish audits",
  introBody:
    "The Original I Ching App treats classical texts as primary sources, not raw material for AI invention. These audits document line-by-line checks against printed and digital editions, plus rule-by-rule verification of how changing lines are read. Internal engineering reports live in our repository; this page is the public summary for practitioners and scholars.",
  oracleTextsHeading: "Oracle text fidelity (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Last audit: 22 June 2026. Texts were compared line by line against Tier-0 sources: Wilhelm/Baynes (Richard Wilhelm & Cary Baynes, Pantheon Books 1950 — local PDF gold), James Legge (Sacred Books of the East XVI, Oxford 1882 — OCR from physical scan), and the canonical Zhou Yi (Chinese Text Project, ctext.org). Wilhelm PDF gold: 513/513 automated gate pass; 512/512 exact match vs production bundle. Legge SBE OCR gold: 514/514 gate pass. Zhou Yi oracle fields: 100%. Where a web mirror omits a passage, we fall back to the printed edition with page-verified citations (documented in the translator fidelity audit).",
  mutationRulesHeading: "Changing-line reading rules",
  mutationRulesIntro:
    "Two classical systems are available in the app: Alfred Huang's modern reduction method (default) and Zhu Xi's Song-dynasty rules (易學啟蒙, ch. IV). Each system is verified against its stated source book.",
  mutationRulesHuangHeading: "Alfred Huang — The Complete I Ching",
  mutationRulesHuangBody:
    "Huang's reduction rules (0–6 changing lines, 用九/用六) are the app default. Alignment confirmed against Huang's published method (audit 2026-06-19). Full PDF book-primary verification is in progress (June 2026).",
  mutationRulesZhuxiHeading: "Zhu Xi — Yixue Qimeng (trans. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Verified 22 June 2026 against Adler's English translation, ch. IV «Examining the Prognostications» (printed pp. 48–53; footnotes 128–150, pp. 64–74). All ten core rule statements match the PDF extract. Engine implements: both lines when two change (upper primary); both judgments when three change (operational equivalent to Adler's first-ten/latter-ten chart rule); two stable lines of the transformed hex when four change (lower primary); Qian/Kun all-changing with 用九/用六 plus both hexagram judgments and their interrelationship. The 32-diagram chart line-source rule is documented as classical reference — not runtime lookup.",
  methodologyHeading: "Methodology",
  methodologyBody:
    "Gold sources are stored locally (PDF/EPUB, gitignored) with a committed manifest. Extraction scripts produce normalized JSON; automated gates compare bundle data to gold. Mutation rules are tested with fixed line vectors per rule code. Prompt quality gates (H1–H5) enforce that interpretations cite only the texts selected by the active rule. Re-audits are dated below; older FAQ answers redirect here.",
  reportsHeading: "Audit log",
  seeAlsoNotes:
    "For historical and cultural context of the casting methods, see Method Notes. For usage, see the User Guide.",
};

const ES_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Auditorías de fidelidad",
  lead:
    "Verificación independiente de textos del oráculo y reglas de líneas cambiantes. Publicamos metodología y resultados para que puedas confiar — y contrastar — lo que entrega la app.",
  lastUpdatedLabel: "Última actualización",
  lastUpdated: "22 de junio de 2026",
  introHeading: "Por qué publicamos auditorías",
  introBody:
    "The Original I Ching App trata los textos clásicos como fuentes primarias, no como materia prima para invención de IA. Estas auditorías documentan contrastes línea por línea con ediciones impresas y digitales, más la verificación regla por regla de cómo se leen las líneas en movimiento. Los informes de ingeniería internos viven en el repositorio; esta página es el resumen público para practicantes y estudiosos.",
  oracleTextsHeading: "Fidelidad de textos del oráculo (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Última auditoría: 22 de junio de 2026. Los textos se contrastaron línea por línea con fuentes Tier-0: Wilhelm/Baynes (Richard Wilhelm y Cary Baynes, Pantheon 1950 — PDF gold local), James Legge (Sacred Books of the East XVI, Oxford 1882 — OCR del escaneo físico) y el Zhou Yi canónico (Chinese Text Project, ctext.org). Wilhelm PDF gold: gate 513/513; coincidencia exacta 512/512 vs bundle de producción. Legge SBE OCR gold: gate 514/514. Campos del oráculo Zhou Yi: 100%. Cuando un mirror web omite un pasaje, usamos la edición impresa con cita verificada por página.",
  mutationRulesHeading: "Reglas de lectura de líneas cambiantes",
  mutationRulesIntro:
    "En la app hay dos sistemas clásicos: el método de reducción moderno de Alfred Huang (predeterminado) y las reglas de Zhu Xi de la dinastía Song (易學啟蒙, cap. IV). Cada sistema se verifica contra su libro fuente.",
  mutationRulesHuangHeading: "Alfred Huang — The Complete I Ching",
  mutationRulesHuangBody:
    "Las reglas de reducción de Huang (0–6 líneas cambiantes, 用九/用六) son el default de la app. Alineación confirmada con el método publicado por Huang (auditoría 2026-06-19). Verificación PDF book-primary del libro completo en curso (junio 2026).",
  mutationRulesZhuxiHeading: "Zhu Xi — Yixue Qimeng (trad. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Verificado el 22 de junio de 2026 contra la traducción al inglés de Adler, cap. IV «Examining the Prognostications» (pp. impresas 48–53; notas al pie 128–150, pp. 64–74). Las diez reglas núcleo coinciden con el extracto PDF. El motor implementa: ambas líneas con dos cambios (superior primaria); ambos juicios con tres cambios (equivalente operativo a la regla primeros diez/últimos diez de Adler); dos líneas estables del hexagrama transformado con cuatro cambios (inferior primaria); Qian/Kun con mutación total: 用九/用六 más ambos juicios e interrelación. La regla de los 32 diagramas queda documentada como referencia clásica — sin lookup en runtime.",
  methodologyHeading: "Metodología",
  methodologyBody:
    "Las fuentes gold se almacenan localmente (PDF/EPUB, gitignored) con un manifest versionado. Scripts de extracción producen JSON normalizado; gates automatizados comparan el bundle con el gold. Las reglas de mutación se prueban con vectores de líneas fijos por código de regla. Los gates de calidad del prompt (H1–H5) exigen que las interpretaciones citen solo los textos seleccionados por la regla activa. Las re-auditorías se fechan abajo; las respuestas antiguas del FAQ remiten aquí.",
  reportsHeading: "Registro de auditorías",
  seeAlsoNotes:
    "Para contexto histórico y cultural de los métodos de tirada, ver Notas de métodos. Para uso de la app, ver la Guía de uso.",
};

function withReports(
  base: Omit<AuditsPageUiMessages, "reports">,
  reports: AuditReportEntry[],
): AuditsPageUiMessages {
  return { ...base, reports };
}

function cloneEn(overrides: Partial<Omit<AuditsPageUiMessages, "reports">>, reports = REPORTS_EN): AuditsPageUiMessages {
  return withReports({ ...EN_BASE, ...overrides }, reports);
}

const AUDITS_PAGE_UI: Record<AppLocale, AuditsPageUiMessages> = {
  en: withReports(EN_BASE, REPORTS_EN),
  es: withReports(ES_BASE, REPORTS_ES),
  pt: cloneEn({
    title: "Auditorias de fidelidade",
    lastUpdatedLabel: "Última atualização",
    lastUpdated: "22 de junho de 2026",
    introHeading: "Por que publicamos auditorias",
    oracleTextsHeading: "Fidelidade dos textos do oráculo (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "Regras de linhas mutantes",
    methodologyHeading: "Metodologia",
    reportsHeading: "Registo de auditorias",
  }),
  fr: cloneEn({
    title: "Audits de fidélité",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "22 juin 2026",
    introHeading: "Pourquoi nous publions des audits",
    oracleTextsHeading: "Fidélité des textes de l'oracle (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "Règles de lignes changeantes",
    methodologyHeading: "Méthodologie",
    reportsHeading: "Journal des audits",
  }),
  de: cloneEn({
    title: "Fidelitätsprüfungen",
    lastUpdatedLabel: "Zuletzt aktualisiert",
    lastUpdated: "22. Juni 2026",
    introHeading: "Warum wir Prüfungen veröffentlichen",
    oracleTextsHeading: "Texttreue der Orakeltexte (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "Regeln für wechselnde Linien",
    methodologyHeading: "Methodik",
    reportsHeading: "Prüfprotokoll",
  }),
  it: cloneEn({
    title: "Audit di fedeltà",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdated: "22 giugno 2026",
    introHeading: "Perché pubblichiamo gli audit",
    oracleTextsHeading: "Fedeltà dei testi dell'oracolo (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "Regole delle linee mutanti",
    methodologyHeading: "Metodologia",
    reportsHeading: "Registro audit",
  }),
  ja: cloneEn({
    title: "忠実度監査",
    lastUpdatedLabel: "最終更新",
    lastUpdated: "2026年6月22日",
    introHeading: "監査を公開する理由",
    oracleTextsHeading: "神託文の忠実度（Wilhelm、Legge、周易）",
    mutationRulesHeading: "変爻の読み方ルール",
    methodologyHeading: "方法論",
    reportsHeading: "監査ログ",
  }),
  zh: cloneEn({
    title: "保真审计",
    lastUpdatedLabel: "最后更新",
    lastUpdated: "2026年6月22日",
    introHeading: "为何发布审计",
    oracleTextsHeading: "神谕文本保真（卫礼贤、理雅各、周易）",
    mutationRulesHeading: "变爻阅读规则",
    methodologyHeading: "方法论",
    reportsHeading: "审计记录",
  }),
  ko: cloneEn({
    title: "충실도 감사",
    lastUpdatedLabel: "최종 업데이트",
    lastUpdated: "2026년 6월 22일",
    introHeading: "감사를 공개하는 이유",
    oracleTextsHeading: "신탁문 충실도(Wilhelm, Legge, 주역)",
    mutationRulesHeading: "변효 읽기 규칙",
    methodologyHeading: "방법론",
    reportsHeading: "감사 로그",
  }),
  ar: cloneEn({
    title: "تدقيقات المطابقة",
    lastUpdatedLabel: "آخر تحديث",
    lastUpdated: "22 يونيو 2026",
    introHeading: "لماذا ننشر التدقيقات",
    oracleTextsHeading: "مطابقة نصوص الأوراكل (Wilhelm، Legge، Zhou Yi)",
    mutationRulesHeading: "قواعد الخطوط المتغيرة",
    methodologyHeading: "المنهجية",
    reportsHeading: "سجل التدقيق",
  }),
  hi: cloneEn({
    title: "निष्ठा ऑडिट",
    lastUpdatedLabel: "अंतिम अपडेट",
    lastUpdated: "22 जून 2026",
    introHeading: "हम ऑडिट क्यों प्रकाशित करते हैं",
    oracleTextsHeading: "Oracle पाठ निष्ठा (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "बदलती रेखाओं के नियम",
    methodologyHeading: "कार्यप्रणाली",
    reportsHeading: "ऑडिट लॉग",
  }),
};

export function getAuditsPageUiMessages(locale: AppLocale): AuditsPageUiMessages {
  return AUDITS_PAGE_UI[locale] ?? AUDITS_PAGE_UI[DEFAULT_LOCALE];
}
