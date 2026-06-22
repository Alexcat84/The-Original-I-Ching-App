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
  reportsHeading: string;
  reports: AuditReportEntry[];
  seeAlsoNotes: string;
};

const REPORTS_EN: AuditReportEntry[] = [
  {
    id: "zhouyi-freizl-xian-correction-2026-06-21",
    date: "21 Jun 2026",
    title: "Zhou Yi — 咸/鹹 glyph correction",
    summary:
      "Found and fixed a dataset error from our earlier upstream source (freizl/yijing): hex 31 (Xian / Influence) used 鹹 (salty) instead of 咸. The same wrong glyph also appeared in hex 19 line text, so one character could appear for two hexagrams in the library. freizl/yijing still contains this error today; we re-ingested from the Chinese Text Project (ctext.org), which has 咸 correctly. Result: pass — 514/514 verified vs ctext; corruption scan 0.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 Jun 2026",
    title: "Oracle texts — Wilhelm, Legge & Zhou Yi",
    summary:
      "Audited against Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882), and the Zhou Yi (Chinese Text Project). Result: pass — all oracle fields verified.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 Jun 2026",
    title: "Changing lines — Alfred Huang",
    summary:
      "Audited against The Complete I Ching — 10th Anniversary Edition (Taoist Master Alfred Huang, 2010). Result: pass — published changing-line rules verified.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 Jun 2026",
    title: "Changing lines — Zhu Xi (Adler translation)",
    summary:
      "Audited against Zhu Xi, Yixue Qimeng ch. IV — Joseph Adler translation (Bilingual Texts in Chinese History). Result: pass — core changing-line rules verified.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 Jun 2026",
    title: "Dual line-reading systems (Huang | Zhu Xi)",
    summary:
      "Feature release: user-selectable Huang or Zhu Xi changing-line reading. Result: pass — both systems available in the app.",
    status: "closed",
    statusLabel: "Closed",
  },
];

const REPORTS_ES: AuditReportEntry[] = [
  {
    id: "zhouyi-freizl-xian-correction-2026-06-21",
    date: "21 jun 2026",
    title: "Zhou Yi — corrección de glifo 咸/鹹",
    summary:
      "Detectado y corregido un error del dataset intermedio anterior (freizl/yijing): el hex 31 (Influencia / 咸) usaba 鹹 (salado) en lugar de 咸. El mismo glifo erróneo aparecía en líneas del hex 19, de modo que un carácter podía mostrarse en dos hexagramas en la biblioteca. freizl/yijing sigue conteniendo ese error hoy; re-ingestamos desde Chinese Text Project (ctext.org), que tiene 咸 correcto. Resultado: aprobado — 514/514 verificados vs ctext; escáner de corrupción 0.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 jun 2026",
    title: "Textos del oráculo — Wilhelm, Legge y Zhou Yi",
    summary:
      "Auditado contra Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882) y el Zhou Yi (Chinese Text Project). Resultado: aprobado — todos los campos del oráculo verificados.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 jun 2026",
    title: "Líneas cambiantes — Alfred Huang",
    summary:
      "Auditado contra The Complete I Ching — 10th Anniversary Edition (Taoist Master Alfred Huang, 2010). Resultado: aprobado — reglas publicadas de líneas cambiantes verificadas.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 jun 2026",
    title: "Líneas cambiantes — Zhu Xi (traducción Adler)",
    summary:
      "Auditado contra Zhu Xi, Yixue Qimeng cap. IV — traducción de Joseph Adler (Bilingual Texts in Chinese History). Resultado: aprobado — reglas núcleo de líneas cambiantes verificadas.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 jun 2026",
    title: "Dos sistemas de lectura (Huang | Zhu Xi)",
    summary:
      "Lanzamiento de función: lectura Huang o Zhu Xi seleccionable por el usuario. Resultado: aprobado — ambos sistemas disponibles en la app.",
    status: "closed",
    statusLabel: "Cerrada",
  },
];

const EN_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Fidelity Audits",
  lead:
    "We verify oracle texts and changing-line rules against named classical editions. This page lists audit dates, sources, and outcomes.",
  lastUpdatedLabel: "Last updated",
  lastUpdated: "22 June 2026",
  introHeading: "What we publish here",
  introBody:
    "Each entry records when we audited, which edition or translation we used as reference, and whether the app passed. Detailed methodology and engineering reports are kept internally — not on this page.",
  oracleTextsHeading: "Oracle texts (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Last verified: 22 June 2026. Reference editions: Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project / ctext.org). Result: pass. We disclose material dataset findings: an earlier Zhou Yi intermediate source (freizl/yijing) had 鹹 instead of 咸 for hex 31 — corrected by re-ingest from ctext (see audit log entry 21 Jun 2026).",
  mutationRulesHeading: "Changing-line reading rules",
  mutationRulesIntro:
    "The app offers two classical systems. Each is checked against its named source book.",
  mutationRulesHuangHeading: "Alfred Huang — The Complete I Ching",
  mutationRulesHuangBody:
    "Last verified: 22 June 2026. Reference: 10th Anniversary Edition (2010). Result: pass.",
  mutationRulesZhuxiHeading: "Zhu Xi — Yixue Qimeng (trans. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Last verified: 22 June 2026. Reference: ch. IV, Joseph Adler translation. Result: pass.",
  reportsHeading: "Audit log",
  seeAlsoNotes:
    "For historical context of the casting methods, see Method Notes. For how to use the app, see the User Guide.",
};

const ES_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Auditorías de fidelidad",
  lead:
    "Verificamos textos del oráculo y reglas de líneas cambiantes contra ediciones clásicas nombradas. Esta página lista fechas, fuentes y resultados.",
  lastUpdatedLabel: "Última actualización",
  lastUpdated: "22 de junio de 2026",
  introHeading: "Qué publicamos aquí",
  introBody:
    "Cada entrada indica cuándo auditamos, qué edición o traducción usamos como referencia y si la app aprobó. La metodología detallada y los informes de ingeniería son internos — no aparecen en esta página.",
  oracleTextsHeading: "Textos del oráculo (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Última verificación: 22 de junio de 2026. Ediciones de referencia: Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project / ctext.org). Resultado: aprobado. Divulgamos hallazgos materiales del dataset: una fuente intermedia anterior del Zhou Yi (freizl/yijing) tenía 鹹 en lugar de 咸 en el hex 31 — corregido por re-ingesta desde ctext (ver entrada del registro, 21 jun 2026).",
  mutationRulesHeading: "Reglas de lectura de líneas cambiantes",
  mutationRulesIntro:
    "La app ofrece dos sistemas clásicos. Cada uno se contrasta con su libro fuente indicado.",
  mutationRulesHuangHeading: "Alfred Huang — The Complete I Ching",
  mutationRulesHuangBody:
    "Última verificación: 22 de junio de 2026. Referencia: edición 10.º aniversario (2010). Resultado: aprobado.",
  mutationRulesZhuxiHeading: "Zhu Xi — Yixue Qimeng (trad. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Última verificación: 22 de junio de 2026. Referencia: cap. IV, traducción de Joseph Adler. Resultado: aprobado.",
  reportsHeading: "Registro de auditorías",
  seeAlsoNotes:
    "Para contexto histórico de los métodos de tirada, ver Notas de métodos. Para uso de la app, ver la Guía de uso.",
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
    introHeading: "O que publicamos aqui",
    oracleTextsHeading: "Textos do oráculo (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "Regras de linhas mutantes",
    reportsHeading: "Registo de auditorias",
  }),
  fr: cloneEn({
    title: "Audits de fidélité",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "22 juin 2026",
    introHeading: "Ce que nous publions ici",
    oracleTextsHeading: "Textes de l'oracle (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "Règles de lignes changeantes",
    reportsHeading: "Journal des audits",
  }),
  de: cloneEn({
    title: "Fidelitätsprüfungen",
    lastUpdatedLabel: "Zuletzt aktualisiert",
    lastUpdated: "22. Juni 2026",
    introHeading: "Was wir hier veröffentlichen",
    oracleTextsHeading: "Orakeltexte (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "Regeln für wechselnde Linien",
    reportsHeading: "Prüfprotokoll",
  }),
  it: cloneEn({
    title: "Audit di fedeltà",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdated: "22 giugno 2026",
    introHeading: "Cosa pubblichiamo qui",
    oracleTextsHeading: "Testi dell'oracolo (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "Regole delle linee mutanti",
    reportsHeading: "Registro audit",
  }),
  ja: cloneEn({
    title: "忠実度監査",
    lastUpdatedLabel: "最終更新",
    lastUpdated: "2026年6月22日",
    introHeading: "ここに掲載する内容",
    oracleTextsHeading: "神託文（Wilhelm、Legge、周易）",
    mutationRulesHeading: "変爻の読み方ルール",
    reportsHeading: "監査ログ",
  }),
  zh: cloneEn({
    title: "保真审计",
    lastUpdatedLabel: "最后更新",
    lastUpdated: "2026年6月22日",
    introHeading: "本页发布内容",
    oracleTextsHeading: "神谕文本（卫礼贤、理雅各、周易）",
    mutationRulesHeading: "变爻阅读规则",
    reportsHeading: "审计记录",
  }),
  ko: cloneEn({
    title: "충실도 감사",
    lastUpdatedLabel: "최종 업데이트",
    lastUpdated: "2026년 6월 22일",
    introHeading: "여기에 게시하는 내용",
    oracleTextsHeading: "신탁문(Wilhelm, Legge, 주역)",
    mutationRulesHeading: "변효 읽기 규칙",
    reportsHeading: "감사 로그",
  }),
  ar: cloneEn({
    title: "تدقيقات المطابقة",
    lastUpdatedLabel: "آخر تحديث",
    lastUpdated: "22 يونيو 2026",
    introHeading: "ما ننشره هنا",
    oracleTextsHeading: "نصوص الأوراكل (Wilhelm، Legge، Zhou Yi)",
    mutationRulesHeading: "قواعد الخطوط المتغيرة",
    reportsHeading: "سجل التدقيق",
  }),
  hi: cloneEn({
    title: "निष्ठा ऑडिट",
    lastUpdatedLabel: "अंतिम अपडेट",
    lastUpdated: "22 जून 2026",
    introHeading: "हम यहाँ क्या प्रकाशित करते हैं",
    oracleTextsHeading: "Oracle पाठ (Wilhelm, Legge, Zhou Yi)",
    mutationRulesHeading: "बदलती रेखाओं के नियम",
    reportsHeading: "ऑडिट लॉग",
  }),
};

export function getAuditsPageUiMessages(locale: AppLocale): AuditsPageUiMessages {
  return AUDITS_PAGE_UI[locale] ?? AUDITS_PAGE_UI[DEFAULT_LOCALE];
}
