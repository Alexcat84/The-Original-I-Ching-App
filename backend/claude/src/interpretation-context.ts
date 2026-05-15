import type { SessionContext } from "@iching-oracle/context-engine";

export type ResponseMode = "directo" | "ritual" | "profundizar";

export function buildHistoricalContext(
  consultations: SessionContext["previousConsultations"],
  language: string,
  mode: ResponseMode
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
      const obLabel = lang === "es" ? "Consulta histórica (甲骨文 · huesos)" : "Historical consultation (oracle bones)";
      block += `${obLabel} #${c.position}:
  Tema consultado (resumen): "${c.question.slice(0, 120)}"
  Cargo negativo: "${ob.negative_charge}"
  Medio: ${ob.medium} · Patrón: ${ob.pattern_id} · Veredicto: ${ob.verdict}
  ${labels.summary}: "${c.interpretationSummary}..."\n\n`;
    } else {
      block += `${labels.prior} #${c.position}:
  Tema consultado (resumen): "${c.question.slice(0, 120)}"
  ${labels.hex}: #${c.primaryHexagramNumber} ${c.primaryHexagramName} (${c.primaryHexagramChinese})
  ${c.transformedHexagramName ? `${labels.mutated}: ${c.transformedHexagramName}` : labels.noTransform}
  ${labels.changingLines}: [${c.changingLines.join(", ")}]
  ${labels.summary}: "${c.interpretationSummary}..."\n\n`;
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
      const obLabel = lang === "es" ? "Consulta INMEDIATAMENTE anterior (甲骨文 · huesos)" : "IMMEDIATELY prior consultation (oracle bones)";
      block += `${obLabel} #${c.position}:
  Tema consultado (resumen): "${c.question.slice(0, 120)}"
  Cargo negativo: "${ob.negative_charge}"
  Medio: ${ob.medium} · Patrón: ${ob.pattern_id} · Veredicto: ${ob.verdict}
  ${labels.summary}: "${c.interpretationSummary}..."\n\n`;
    } else {
      block += `${labels.prior} #${c.position}:
  Tema consultado (resumen): "${c.question.slice(0, 120)}"
  ${labels.hex}: #${c.primaryHexagramNumber} ${c.primaryHexagramName} (${c.primaryHexagramChinese})
  ${c.transformedHexagramName ? `${labels.mutated}: ${c.transformedHexagramName}` : labels.noTransform}
  ${labels.changingLines}: [${c.changingLines.join(", ")}]
  ${labels.summary}: "${c.interpretationSummary}..."\n\n`;
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
- Incluye una memoria breve de hilo (hexagramas previos y su dirección), sin arrastrar detalles incidentales que no aparezcan en la pregunta actual.
- Si un dato previo no está explícitamente relacionado con la nueva pregunta, no lo uses para encuadrar el caso.`
        : `CONTINUITY (ritual mode):
- Include a brief thread memory (prior hexagrams and trajectory), without carrying incidental details not present in the current question.
- If a prior detail is not explicitly relevant to the new question, do not use it to frame the case.`
      : es
        ? `CONTINUIDAD: referencias breves a consultas previas (máximo 1–2 oraciones en toda la respuesta).`
        : `CONTINUITY: brief references to prior consultations (max 1–2 sentences total).`;

  block += `═══════════════════════════════════\n${continuity}\n═══════════════════════════════════\n`;
  return block;
}
