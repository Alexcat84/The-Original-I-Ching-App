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
  locale?: string;
};

function formatConsultRef(id: string): string {
  const compact = id.replace(/-/g, "");
  const core = compact.slice(0, 10).toUpperCase();
  return core.length >= 8 ? `${core.slice(0, 4)}·${core.slice(4, 8)}` : id.slice(0, 8);
}

function mutationRuleLabel(rule: string, isSpanish: boolean): string {
  const mapEs: Record<MutationRule, string> = {
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
  const mapEn: Record<MutationRule, string> = {
    NO_CHANGING: "No changing lines",
    ONE_CHANGING: "One changing line",
    TWO_YIN_YANG: "Two lines: yin and yang changing",
    TWO_SAME_LOWER: "Two changing lines (lower trigram)",
    THREE_MIDDLE: "Three middle lines in play",
    FOUR_LOWEST_STABLE: "Four lines: lowest remains stable",
    FIVE_ONLY_STABLE: "Five changing; one stable",
    SIX_ALL_CHANGING: "All six lines change",
    QIAN_ALL_NINE: "Qian — all nines",
    KUN_ALL_SIX: "Kun — all sixes",
  };
  const map = isSpanish ? mapEs : mapEn;
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
  locale = "es",
}: Props) {
  if (oracleType === "oracle_bones") return null;
  const localeKey = locale.slice(0, 2).toLowerCase();
  const labels = {
    es: {
      panel: "Identificador de tirada",
      summary: "Resumen de tirada",
      trace: "Trazado recibido:",
      rule: "Regla de lectura:",
      thread: "En este hilo:",
      reading: "Tirada",
      question: "Pregunta asociada",
      dateLocale: "es",
    },
    en: {
      panel: "Reading identifier",
      summary: "Reading summary",
      trace: "Received trace:",
      rule: "Reading rule:",
      thread: "In this thread:",
      reading: "Reading",
      question: "Associated question",
      dateLocale: "en",
    },
    pt: {
      panel: "Identificador da tiragem",
      summary: "Resumo da tiragem",
      trace: "Traçado recebido:",
      rule: "Regra de leitura:",
      thread: "Neste fio:",
      reading: "Tiragem",
      question: "Pergunta associada",
      dateLocale: "pt",
    },
    fr: {
      panel: "Identifiant du tirage",
      summary: "Résumé du tirage",
      trace: "Tracé reçu :",
      rule: "Règle de lecture :",
      thread: "Dans ce fil :",
      reading: "Tirage",
      question: "Question associée",
      dateLocale: "fr",
    },
    de: {
      panel: "Orakel-ID",
      summary: "Zusammenfassung",
      trace: "Empfangenes Muster:",
      rule: "Leseregel:",
      thread: "In diesem Thread:",
      reading: "Lesung",
      question: "Zugehörige Frage",
      dateLocale: "de",
    },
    it: {
      panel: "Identificatore del lancio",
      summary: "Riepilogo del lancio",
      trace: "Traccia ricevuta:",
      rule: "Regola di lettura:",
      thread: "In questo thread:",
      reading: "Lettura",
      question: "Domanda associata",
      dateLocale: "it",
    },
    ja: {
      panel: "占い識別子",
      summary: "占いサマリー",
      trace: "受け取った卦:",
      rule: "読解ルール:",
      thread: "このスレッド:",
      reading: "占い",
      question: "関連する質問",
      dateLocale: "ja",
    },
    zh: {
      panel: "占卜标识",
      summary: "占卜摘要",
      trace: "接收卦象：",
      rule: "解读规则：",
      thread: "本线程：",
      reading: "占卜",
      question: "关联问题",
      dateLocale: "zh",
    },
    ko: {
      panel: "리딩 식별자",
      summary: "리딩 요약",
      trace: "받은 괘:",
      rule: "해석 규칙:",
      thread: "이 스레드:",
      reading: "리딩",
      question: "연결된 질문",
      dateLocale: "ko",
    },
  }[(localeKey in { es:1,en:1,pt:1,fr:1,de:1,it:1,ja:1,zh:1,ko:1 } ? localeKey : "en") as "es" | "en" | "pt" | "fr" | "de" | "it" | "ja" | "zh" | "ko"];

  const dateStr = new Date().toLocaleDateString(labels.dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const trace =
    transformedHexagram != null
      ? `#${primaryHexagram} ${primaryHexagramChinese} → #${transformedHexagram} (之卦)`
      : `#${primaryHexagram} ${primaryHexagramChinese}`;

  return (
    <aside className="consultation-record" aria-label={labels.panel}>
      <h4 className="consultation-record-title">{labels.panel}</h4>
      <p className="consultation-record-ref-code" translate="no">
        {formatConsultRef(consultationId)}
      </p>
      <div className="consultation-record-grid" role="group" aria-label={labels.summary}>
        <p className="consultation-record-row">
          <span className="consultation-record-key">{labels.trace}</span>
          <span className="consultation-record-value" lang="zh">
            {trace}
          </span>
        </p>
        <p className="consultation-record-row">
          <span className="consultation-record-key">{labels.rule}</span>
          <span className="consultation-record-value">{mutationRuleLabel(mutationRule, labels.dateLocale === "es")}</span>
        </p>
        <p className="consultation-record-row">
          <span className="consultation-record-key">{labels.thread}</span>
          <span className="consultation-record-value">
            {labels.reading} {sessionPosition} · {dateStr}
          </span>
        </p>
      </div>
      <p className="consultation-record-question">
        <span className="consultation-record-question-label">{labels.question}</span>
        {question.length > 160 ? `${question.slice(0, 160)}…` : question}
      </p>
    </aside>
  );
}
