import type { SessionContext, ConsultationSummary } from "@iching-oracle/context-engine";

export type ResponseMode = "directo" | "ritual" | "profundizar";

type HistoryLabels = {
  prior: string;
  priorOracleBones: string;
  hex: string;
  mutatedTo: string;
  changingLines: string;
  question: string;
  verdict: string;
};

const LANG_LABELS: Record<string, HistoryLabels> = {
  en: {
    prior: "Historical consultation",
    priorOracleBones: "Historical consultation (oracle bones 甲骨文)",
    hex: "Hexagram",
    mutatedTo: "→",
    changingLines: "Changing lines",
    question: "Question",
    verdict: "Verdict",
  },
  es: {
    prior: "Consulta histórica",
    priorOracleBones: "Consulta histórica (甲骨文 · huesos de oráculo)",
    hex: "Hexagrama",
    mutatedTo: "→",
    changingLines: "Líneas en mutación",
    question: "Pregunta",
    verdict: "Veredicto",
  },
  pt: {
    prior: "Consulta histórica",
    priorOracleBones: "Consulta histórica (甲骨文 · ossos do oráculo)",
    hex: "Hexagrama",
    mutatedTo: "→",
    changingLines: "Linhas de mutação",
    question: "Pergunta",
    verdict: "Veredicto",
  },
  fr: {
    prior: "Consultation historique",
    priorOracleBones: "Consultation historique (甲骨文 · os de l'oracle)",
    hex: "Hexagramme",
    mutatedTo: "→",
    changingLines: "Traits changeants",
    question: "Question",
    verdict: "Verdict",
  },
  de: {
    prior: "Historische Konsultation",
    priorOracleBones: "Historische Konsultation (甲骨文 · Orakelknochen)",
    hex: "Hexagramm",
    mutatedTo: "→",
    changingLines: "Wandlungslinien",
    question: "Frage",
    verdict: "Urteil",
  },
  it: {
    prior: "Consultazione storica",
    priorOracleBones: "Consultazione storica (甲骨文 · ossa oracolari)",
    hex: "Esagramma",
    mutatedTo: "→",
    changingLines: "Linee mutanti",
    question: "Domanda",
    verdict: "Verdetto",
  },
  ja: {
    prior: "過去の相談",
    priorOracleBones: "過去の相談（甲骨文）",
    hex: "卦",
    mutatedTo: "→",
    changingLines: "変爻",
    question: "質問",
    verdict: "判断",
  },
  zh: {
    prior: "历史占卜",
    priorOracleBones: "历史占卜（甲骨文）",
    hex: "卦",
    mutatedTo: "→",
    changingLines: "变爻",
    question: "问题",
    verdict: "判断",
  },
  ko: {
    prior: "과거 상담",
    priorOracleBones: "과거 상담 (갑골문 甲骨文)",
    hex: "괘",
    mutatedTo: "→",
    changingLines: "변효",
    question: "질문",
    verdict: "판단",
  },
  ar: {
    prior: "استشارة سابقة",
    priorOracleBones: "استشارة سابقة (عظام الأوراكل 甲骨文)",
    hex: "هيكساغرام",
    mutatedTo: "→",
    changingLines: "خطوط متحولة",
    question: "سؤال",
    verdict: "حكم",
  },
  hi: {
    prior: "पिछला परामर्श",
    priorOracleBones: "पिछला परामर्श (甲骨文 · ओरेकल हड्डियाँ)",
    hex: "षट्रेखा",
    mutatedTo: "→",
    changingLines: "परिवर्तनशील रेखाएं",
    question: "प्रश्न",
    verdict: "निर्णय",
  },
};

/**
 * Builds the compact user-turn block for a historical consultation in the V2 structure.
 * Sent as real user/assistant pairs rather than embedded flat text.
 */
export function buildV2HistoricalUserBlock(
  consultation: ConsultationSummary,
  language: string,
): string {
  const L = LANG_LABELS[language] ?? LANG_LABELS["en"]!;

  if (consultation.oracleType === "oracle_bones" && consultation.oracleBones) {
    const ob = consultation.oracleBones;
    return `[${L.priorOracleBones} #${consultation.position}]
${L.question}: "${consultation.question.slice(0, 120)}"
${L.verdict}: ${ob.verdict} · ${ob.medium} · pattern ${ob.pattern_id}`;
  }

  const hexChain = consultation.transformedHexagramName
    ? `#${consultation.primaryHexagramNumber} ${consultation.primaryHexagramName} (${consultation.primaryHexagramChinese}) ${L.mutatedTo} ${consultation.transformedHexagramName}${consultation.changingLines.length > 0 ? ` · ${L.changingLines}: [${consultation.changingLines.join(", ")}]` : ""}`
    : `#${consultation.primaryHexagramNumber} ${consultation.primaryHexagramName} (${consultation.primaryHexagramChinese})${consultation.changingLines.length > 0 ? ` · ${L.changingLines}: [${consultation.changingLines.join(", ")}]` : ""}`;

  return `[${L.prior} #${consultation.position}]
${L.question}: "${consultation.question.slice(0, 120)}"
${L.hex}: ${hexChain}`;
}

export function buildHistoricalContext(
  consultations: SessionContext["previousConsultations"],
  language: string,
  _mode: ResponseMode
): string {
  if (consultations.length === 0) return "";
  
  const lang = language === "es" ? "es" : "en";
  const labels = lang === "es" ? {
    prior: "Consulta histórica",
    hex: "Hexagrama",
    mutated: "Transformado en",
    summary: "Interpretación anterior (resumen)",
    question: "Pregunta",
    changingLines: "Líneas en mutación",
    noTransform: "Sin transformación",
  } : {
    prior: "Historical consultation",
    hex: "Hexagram",
    mutated: "Transformed into",
    summary: "Previous interpretation (summary)",
    question: "Question",
    changingLines: "Changing lines",
    noTransform: "No transformation",
  };

  let block = "";
  for (const c of consultations) {
    if (c.oracleType === "oracle_bones" && c.oracleBones) {
      const ob = c.oracleBones;
      const obLabel = lang === "es" ? "Consulta histórica (甲骨文 · huesos de oráculo)" : "Historical consultation (oracle bones 甲骨文)";
      const verdictLabel = lang === "es"
        ? { auspicious_clear: "claramente auspicioso 吉", auspicious_moderate: "favorable moderado 吉", inauspicious_moderate: "desfavorable moderado 凶", inauspicious_clear: "claramente inauspicioso 凶" }[ob.verdict] ?? ob.verdict
        : { auspicious_clear: "clearly auspicious 吉", auspicious_moderate: "moderately auspicious 吉", inauspicious_moderate: "moderately inauspicious 凶", inauspicious_clear: "clearly inauspicious 凶" }[ob.verdict] ?? ob.verdict;
      block += `${obLabel} #${c.position}:
  ${labels.question}: "${c.question.slice(0, 120)}"
  Veredicto: ${verdictLabel} · Medio: ${ob.medium} · Patrón: ${ob.pattern_id}
  ${labels.summary}: "${c.interpretationSummary}"\n\n`;
    } else {
      const hexChain = c.transformedHexagramName
        ? `#${c.primaryHexagramNumber} ${c.primaryHexagramName} (${c.primaryHexagramChinese}) → ${c.transformedHexagramName}${c.changingLines.length > 0 ? ` · ${labels.changingLines}: [${c.changingLines.join(", ")}]` : ""}`
        : `#${c.primaryHexagramNumber} ${c.primaryHexagramName} (${c.primaryHexagramChinese})${c.changingLines.length > 0 ? ` · ${labels.changingLines}: [${c.changingLines.join(", ")}]` : ""}`;
      block += `${labels.prior} #${c.position}:
  ${labels.question}: "${c.question.slice(0, 120)}"
  ${labels.hex}: ${hexChain}
  ${labels.summary}: "${c.interpretationSummary}"\n\n`;
    }
  }
  return block;
}

export function buildCurrentContext(
  context: SessionContext,
  currentConsultation: SessionContext["previousConsultations"][0] | undefined,
  language: string,
  mode: ResponseMode
): string {
  const lang = language === "es" ? "es" : "en";
  const labels = lang === "es" ? {
    session: "CONTEXTO DE SESIÓN TEMÁTICA",
    prior: "Consulta INMEDIATAMENTE anterior",
    hex: "Hexagrama",
    mutated: "Transformado en",
    summary: "Interpretación anterior (resumen)",
    patterns: "PATRONES HISTÓRICOS",
    question: "Pregunta",
    changingLines: "Líneas en mutación",
    noTransform: "Sin transformación",
  } : {
    session: "THEMATIC SESSION CONTEXT",
    prior: "IMMEDIATELY prior consultation",
    hex: "Hexagram",
    mutated: "Transformed into",
    summary: "Previous interpretation (summary)",
    patterns: "HISTORICAL PATTERNS",
    question: "Question",
    changingLines: "Changing lines",
    noTransform: "No transformation",
  };

  let block = `═══════════════════════════════════\n${labels.session}: "${context.theme}"\n═══════════════════════════════════\n\n`;

  if (currentConsultation) {
    const c = currentConsultation;
    if (c.oracleType === "oracle_bones" && c.oracleBones) {
      const ob = c.oracleBones;
      const obLabel = lang === "es" ? "Consulta INMEDIATAMENTE anterior (甲骨文 · huesos de oráculo)" : "IMMEDIATELY prior consultation (oracle bones 甲骨文)";
      const verdictLabel = lang === "es"
        ? { auspicious_clear: "claramente auspicioso 吉", auspicious_moderate: "favorable moderado 吉", inauspicious_moderate: "desfavorable moderado 凶", inauspicious_clear: "claramente inauspicioso 凶" }[ob.verdict] ?? ob.verdict
        : { auspicious_clear: "clearly auspicious 吉", auspicious_moderate: "moderately auspicious 吉", inauspicious_moderate: "moderately inauspicious 凶", inauspicious_clear: "clearly inauspicious 凶" }[ob.verdict] ?? ob.verdict;
      block += `${obLabel} #${c.position}:
  ${labels.question}: "${c.question.slice(0, 120)}"
  Veredicto: ${verdictLabel} · Medio: ${ob.medium} · Patrón: ${ob.pattern_id}
  ${labels.summary}: "${c.interpretationSummary}"\n\n`;
    } else {
      const hexChain = c.transformedHexagramName
        ? `#${c.primaryHexagramNumber} ${c.primaryHexagramName} (${c.primaryHexagramChinese}) → ${c.transformedHexagramName}${c.changingLines.length > 0 ? ` · ${labels.changingLines}: [${c.changingLines.join(", ")}]` : ""}`
        : `#${c.primaryHexagramNumber} ${c.primaryHexagramName} (${c.primaryHexagramChinese})${c.changingLines.length > 0 ? ` · ${labels.changingLines}: [${c.changingLines.join(", ")}]` : ""}`;
      block += `${labels.prior} #${c.position}:
  ${labels.question}: "${c.question.slice(0, 120)}"
  ${labels.hex}: ${hexChain}
  ${labels.summary}: "${c.interpretationSummary}"\n\n`;
    }
  }

  if (context.patternHints) {
    block += `${labels.patterns}:\n${context.patternHints}\n`;
  }

  const es = language === "es";
  const continuity = mode === "profundizar"
    ? es
      ? `CONTINUIDAD (modo profundizar):
- Como mucho UNA oración puede nombrar la consulta anterior o su hexagrama; no vuelvas a resumir su interpretación.
- El cuerpo debe aportar información nueva respecto a la tirada actual.`
      : `CONTINUITY (deepen mode):
- At most ONE sentence may name the prior question or hexagram; do not re-summarize its interpretation.
- The rest must add new insight from THIS cast only.`
    : mode === "ritual"
      ? es
        ? `CONTINUIDAD (modo ritual):
- Menciona SIEMPRE al menos una oración de hilo (hexagrama anterior y su mensaje clave), aunque la nueva tirada sea sobre un aspecto diferente de la misma preocupación.
- No arrastres detalles incidentales ni repitas interpretaciones largas; una referencia concreta y personal es suficiente.`
        : `CONTINUITY (ritual mode):
- ALWAYS include at least one thread sentence (prior hexagram and its key message), even if the new cast covers a different aspect of the same concern.
- Do not carry incidental details or repeat long interpretations; one concrete, personal reference is enough.`
      : es
        ? `CONTINUIDAD: referencias breves a consultas previas (máximo 1–2 oraciones en toda la respuesta).`
        : `CONTINUITY: brief references to prior consultations (max 1–2 sentences total).`;

  block += `═══════════════════════════════════\n${continuity}\n═══════════════════════════════════\n`;
  return block;
}
