"use client";

import type { MutationRule } from "@iching-oracle/iching-engine";

type Props = {
  consultationId: string;
  question: string;
  sessionPosition: number;
  primaryHexagram: number;
  primaryHexagramChinese: string;
  transformedHexagram: number | null;
  mutationRule: string;
  oracleType?: "iching" | "oracle_bones";
};

function formatConsultRef(id: string): string {
  const compact = id.replace(/-/g, "");
  const core = compact.slice(0, 10).toUpperCase();
  return core.length >= 8 ? `${core.slice(0, 4)}·${core.slice(4, 8)}` : id.slice(0, 8);
}

function mutationRuleLabelEs(rule: string): string {
  const map: Record<MutationRule, string> = {
    NO_CHANGING: "Sin líneas mutantes",
    ONE_CHANGING: "Una línea en mutación",
    TWO_YIN_YANG: "Dos líneas: yin y yang en cambio",
    TWO_SAME_LOWER: "Dos líneas mutantes (trigrama inferior)",
    THREE_MIDDLE: "Tres líneas centrales en juego",
    FOUR_LOWEST_STABLE: "Cuatro líneas: la inferior estable",
    FIVE_ONLY_STABLE: "Cinco mutando; una estable",
    SIX_ALL_CHANGING: "Las seis líneas mutan",
    QIAN_ALL_NINE: "Qian — nueve al novenario",
    KUN_ALL_SIX: "Kun — seis al senario",
  };
  return map[rule as MutationRule] ?? rule;
}

export function ConsultationRecordCard({
  consultationId,
  question,
  sessionPosition,
  primaryHexagram,
  primaryHexagramChinese,
  transformedHexagram,
  mutationRule,
  oracleType = "iching",
}: Props) {
  if (oracleType === "oracle_bones") return null;

  const dateStr = new Date().toLocaleDateString("es", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const trace =
    transformedHexagram != null
      ? `#${primaryHexagram} ${primaryHexagramChinese} → #${transformedHexagram} (之卦)`
      : `#${primaryHexagram} ${primaryHexagramChinese}`;

  return (
    <aside className="consultation-record" aria-label="Identificador de tirada">
      <h4 className="consultation-record-title">Identificador de tirada</h4>
      <p className="consultation-record-ref-code" translate="no">
        {formatConsultRef(consultationId)}
      </p>
      <div className="consultation-record-grid" role="group" aria-label="Resumen de tirada">
        <p className="consultation-record-row">
          <span className="consultation-record-key">Trazado recibido:</span>
          <span className="consultation-record-value" lang="zh">
            {trace}
          </span>
        </p>
        <p className="consultation-record-row">
          <span className="consultation-record-key">Regla de lectura:</span>
          <span className="consultation-record-value">{mutationRuleLabelEs(mutationRule)}</span>
        </p>
        <p className="consultation-record-row">
          <span className="consultation-record-key">En este hilo:</span>
          <span className="consultation-record-value">
            Tirada {sessionPosition} · {dateStr}
          </span>
        </p>
      </div>
      <p className="consultation-record-question">
        <span className="consultation-record-question-label">Pregunta asociada</span>
        {question.length > 160 ? `${question.slice(0, 160)}…` : question}
      </p>
    </aside>
  );
}
