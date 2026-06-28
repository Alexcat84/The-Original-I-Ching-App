"use client";

import Link from "next/link";
import {
  getConsultationRecordUiMessages,
  getIchingMutationRuleLabel,
  getManualWizardMessages,
  parseAppLocale,
} from "@iching-oracle/i18n";

type OracleBonesCardData = {
  verdictStr: string;
  medium: "turtle" | "ox";
  verdict: string;
};

type Props = {
  consultationId: string;
  question: string;
  sessionPosition: number;
  primaryHexagram: number;
  primaryHexagramChinese: string;
  transformedHexagram: number | null;
  transformedHexagramChinese?: string | null;
  mutationRule: string;
  castIndex?: number;
  changingLines?: number[];
  verifyRulesLocked?: boolean;
  translator?: "wilhelm" | "legge" | "zhouyi" | "master_combined";
  lineReadingSystem?: "huang" | "zhuxi" | null;
  oracleType?: "iching" | "oracle_bones";
  locale?: string;
  createdAt?: number;
  oracleBones?: OracleBonesCardData;
};

function formatConsultRef(id: string): string {
  const compact = id.replace(/-/g, "");
  const core = compact.slice(0, 10).toUpperCase();
  return core.length >= 8 ? `${core.slice(0, 4)}·${core.slice(4, 8)}` : id.slice(0, 8);
}

export function ConsultationRecordCard({
  consultationId,
  question,
  sessionPosition,
  primaryHexagram,
  primaryHexagramChinese,
  transformedHexagram,
  transformedHexagramChinese,
  mutationRule,
  castIndex,
  changingLines,
  verifyRulesLocked = false,
  translator,
  lineReadingSystem,
  oracleType = "iching",
  locale = "es",
  createdAt,
  oracleBones,
}: Props) {
  const ruleLocale = parseAppLocale(locale.slice(0, 2).toLowerCase());
  const labels = getConsultationRecordUiMessages(ruleLocale);
  const wizardLabels = getManualWizardMessages(ruleLocale);
  const lineReadingSystemName =
    lineReadingSystem === "zhuxi"
      ? wizardLabels.lineReadingSystemZhuxiShort
      : wizardLabels.lineReadingSystemHuangShort;

  const translatorDisplayName: Record<string, string> = {
    wilhelm: "Wilhelm / Baynes",
    legge: "James Legge",
    zhouyi: "Zhou Yi",
    master_combined: "Wilhelm · Legge · Zhou Yi",
  };

  const dateObj = createdAt ? new Date(createdAt) : new Date();
  const dateStr = dateObj.toLocaleDateString(labels.dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (oracleType === "oracle_bones" && oracleBones) {
    const mediumLabel = oracleBones.medium === "turtle" ? labels.turtle : labels.ox;
    const chargeLabel = oracleBones.verdict.startsWith("auspicious")
      ? labels.chargePositive
      : labels.chargeNegative;
    return (
      <aside className="consultation-record" aria-label={labels.panel}>
        <h4 className="consultation-record-title">{labels.panel}</h4>
        <p className="consultation-record-ref-code" translate="no">
          {formatConsultRef(consultationId)}
        </p>
        <div className="consultation-record-grid" role="group" aria-label={labels.summary}>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{labels.verdict}</span>
            <span className="consultation-record-value">{oracleBones.verdictStr}</span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{labels.medium}</span>
            <span className="consultation-record-value">{mediumLabel}</span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{labels.charge}</span>
            <span className="consultation-record-value">{chargeLabel}</span>
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

  const trace =
    transformedHexagram != null
      ? `#${primaryHexagram} ${primaryHexagramChinese} → #${transformedHexagram} ${transformedHexagramChinese ?? ""}`
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
          <span className="consultation-record-value">
            {getIchingMutationRuleLabel(ruleLocale, mutationRule)}
          </span>
        </p>
        {castIndex != null ? (
          <p className="consultation-record-row">
            <span className="consultation-record-key">{labels.verificationCode}</span>
            <span className="consultation-record-value" translate="no">
              {castIndex}
            </span>
          </p>
        ) : null}
        {changingLines != null ? (
          <p className="consultation-record-row">
            <span className="consultation-record-key">{labels.changingLinesLabel}</span>
            <span className="consultation-record-value" translate="no">
              {changingLines.length > 0
                ? changingLines.join(", ")
                : labels.changingLinesNone}
            </span>
          </p>
        ) : null}
        {castIndex != null ? (
          <p className="consultation-record-row consultation-record-verify-row">
            {verifyRulesLocked ? (
              <span
                className="consultation-record-verify-link consultation-record-verify-link--locked"
                aria-disabled="true"
                title={labels.verifyRulesLockedHint}
              >
                {labels.verifyRulesLink}
              </span>
            ) : (
              <Link
                href={`/mutation-explorer?cid=${encodeURIComponent(consultationId)}`}
                className="consultation-record-verify-link"
              >
                {labels.verifyRulesLink}
              </Link>
            )}
          </p>
        ) : null}
        {translator && translatorDisplayName[translator] ? (
          <p className="consultation-record-row">
            <span className="consultation-record-key">{labels.translatorLabel}</span>
            <span className="consultation-record-value">{translatorDisplayName[translator]}</span>
          </p>
        ) : null}
        <p className="consultation-record-row">
          <span className="consultation-record-key">{labels.lineReading}</span>
          <span className="consultation-record-value">{lineReadingSystemName}</span>
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
