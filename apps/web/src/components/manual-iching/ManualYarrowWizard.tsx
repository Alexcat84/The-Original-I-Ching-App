"use client";

import type { IchingManualLineTuple } from "@/lib/manual-iching-consult";
import type { AppLocale } from "@iching-oracle/i18n";
import { yarrowSumToLine } from "@iching-oracle/iching-engine";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getYarrowWizardMessages } from "./yarrow-wizard-messages";

type Phase1Value = 5 | 9;
type Phase23Value = 4 | 8;

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: (values: IchingManualLineTuple) => void;
  locale: AppLocale;
  questionPreview: string;
};

export function ManualYarrowWizard({ open, onClose, onComplete, locale, questionPreview }: Props) {
  const m = useMemo(() => getYarrowWizardMessages(locale), [locale]);
  const [recorded, setRecorded] = useState<Array<6 | 7 | 8 | 9>>([]);
  const [phase1, setPhase1] = useState<Phase1Value | null>(null);
  const [phase2, setPhase2] = useState<Phase23Value | null>(null);
  const [phase3, setPhase3] = useState<Phase23Value | null>(null);

  useEffect(() => {
    if (!open) {
      setRecorded([]);
      setPhase1(null);
      setPhase2(null);
      setPhase3(null);
    }
  }, [open]);

  const currentValue =
    phase1 !== null && phase2 !== null && phase3 !== null
      ? yarrowSumToLine(phase1, phase2, phase3)
      : null;

  const resetPhases = useCallback(() => {
    setPhase1(null);
    setPhase2(null);
    setPhase3(null);
  }, []);

  const registerLine = useCallback(() => {
    if (currentValue === null) return;
    const nextRecorded = [...recorded, currentValue];
    if (nextRecorded.length === 6) {
      onComplete(nextRecorded as IchingManualLineTuple);
      return;
    }
    setRecorded(nextRecorded);
    resetPhases();
  }, [currentValue, recorded, onComplete, resetPhases]);

  const goBack = useCallback(() => {
    if (phase1 !== null || phase2 !== null || phase3 !== null) {
      resetPhases();
    } else {
      setRecorded((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)));
      resetPhases();
    }
  }, [phase1, phase2, phase3, resetPhases]);

  const jumpToStep = useCallback(
    (step: number) => {
      if (step < 1 || step > 6) return;
      setRecorded((prev) => {
        if (step > prev.length) return prev;
        return prev.slice(0, step - 1);
      });
      resetPhases();
    },
    [resetPhases],
  );

  if (!open) return null;

  const lineNumber = recorded.length + 1;
  const lineStepLabel = m.lineStep.replace("{{n}}", String(lineNumber));
  const rollProgressLabel = m.rollProgress
    .replace("{{current}}", String(lineNumber))
    .replace("{{total}}", "6");

  const caption =
    currentValue === 6
      ? m.caption6
      : currentValue === 7
        ? m.caption7
        : currentValue === 8
          ? m.caption8
          : currentValue === 9
            ? m.caption9
            : null;

  const canRegister = currentValue !== null;
  const canGoBack = recorded.length > 0 || phase1 !== null || phase2 !== null || phase3 !== null;

  return (
    <div className="manual-iching-wizard-backdrop" role="presentation">
      <div
        className="manual-iching-wizard-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-yarrow-wizard-title"
      >
        <div className="manual-iching-wizard-scroll">
          <header className="manual-iching-wizard-header">
            <div className="manual-iching-wizard-header-text">
              <h2 id="manual-yarrow-wizard-title" className="manual-iching-wizard-title">
                {m.title}
              </h2>
              <p className="manual-iching-wizard-question" dir="auto">
                {questionPreview}
              </p>
            </div>
            <button
              type="button"
              className="manual-iching-wizard-close"
              onClick={onClose}
              aria-label={m.closeAria}
            >
              ×
            </button>
          </header>

          {/* Progress strip — same pattern as coin wizard */}
          <div className="manual-iching-wizard-progress-panel">
            <div className="manual-iching-wizard-progress-head" aria-live="polite">
              <span className="manual-iching-wizard-roll-progress">{rollProgressLabel}</span>
              <span className="manual-iching-wizard-step">{lineStepLabel}</span>
            </div>
            <div
              className="manual-iching-wizard-progress-row"
              role="group"
              aria-label={m.progressNavHint}
            >
              {Array.from({ length: 6 }, (_, i) => {
                const step = i + 1;
                const value = recorded[i];
                const isDone = step <= recorded.length;
                const isCurrent = step === lineNumber;
                const isFuture = step > recorded.length + 1;
                return (
                  <button
                    key={step}
                    type="button"
                    className={`manual-iching-wizard-step-pill${isCurrent ? " manual-iching-wizard-step-pill--current" : ""}${isDone ? " manual-iching-wizard-step-pill--done" : ""}${isFuture ? " manual-iching-wizard-step-pill--future" : ""}`}
                    disabled={isFuture || (isCurrent && !isDone)}
                    onClick={() => jumpToStep(step)}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={
                      isDone
                        ? `${m.rollProgress.replace("{{current}}", String(step)).replace("{{total}}", "6")}: ${value}`
                        : isCurrent
                          ? m.rollProgress
                              .replace("{{current}}", String(step))
                              .replace("{{total}}", "6")
                          : `${step}/6`
                    }
                  >
                    {isDone ? String(value) : isCurrent ? "·" : String(step)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Three-phase input */}
          <div className="manual-yarrow-phases">
            {/* Phase 1: residue 5 or 9 */}
            <div className="manual-yarrow-phase">
              <p className="manual-yarrow-phase-label">{m.phase1Label}</p>
              <p className="manual-yarrow-phase-hint">{m.phase1Hint}</p>
              <div className="manual-yarrow-phase-buttons">
                {([5, 9] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`manual-yarrow-residue-btn${phase1 === v ? " manual-yarrow-residue-btn--selected" : ""}`}
                    onClick={() => setPhase1(v)}
                    aria-pressed={phase1 === v}
                    aria-label={m.phase1Aria.replace("{{v}}", String(v))}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Phase 2: residue 4 or 8 */}
            <div className="manual-yarrow-phase">
              <p className="manual-yarrow-phase-label">{m.phase2Label}</p>
              <p className="manual-yarrow-phase-hint">{m.phase2Hint}</p>
              <div className="manual-yarrow-phase-buttons">
                {([4, 8] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`manual-yarrow-residue-btn${phase2 === v ? " manual-yarrow-residue-btn--selected" : ""}`}
                    onClick={() => setPhase2(v)}
                    aria-pressed={phase2 === v}
                    aria-label={m.phase2Aria.replace("{{v}}", String(v))}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Phase 3: residue 4 or 8 */}
            <div className="manual-yarrow-phase">
              <p className="manual-yarrow-phase-label">{m.phase3Label}</p>
              <p className="manual-yarrow-phase-hint">{m.phase3Hint}</p>
              <div className="manual-yarrow-phase-buttons">
                {([4, 8] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`manual-yarrow-residue-btn${phase3 === v ? " manual-yarrow-residue-btn--selected" : ""}`}
                    onClick={() => setPhase3(v)}
                    aria-pressed={phase3 === v}
                    aria-label={m.phase3Aria.replace("{{v}}", String(v))}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result card — same pattern as coin wizard sum card */}
          <div className="manual-iching-sum-card">
            <div className="manual-iching-sum-main">
              <p className="manual-iching-sum-label">{m.resultLabel}</p>
              <p className="manual-iching-sum-value">{currentValue !== null ? currentValue : "—"}</p>
            </div>
            <p className="manual-iching-sum-caption">
              {caption ?? m.awaitingResult}
            </p>
          </div>
        </div>

        <div className="manual-iching-wizard-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={goBack}
            disabled={!canGoBack}
          >
            {m.back}
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={registerLine}
            disabled={!canRegister}
          >
            {recorded.length === 5 ? m.confirmConsult : m.registerLine}
          </button>
        </div>
      </div>
    </div>
  );
}
