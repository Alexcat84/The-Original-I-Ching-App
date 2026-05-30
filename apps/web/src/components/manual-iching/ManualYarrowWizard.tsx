"use client";

import type { IchingManualLineTuple } from "@/lib/manual-iching-consult";
import { getYarrowWizardMessages, type AppLocale } from "@iching-oracle/i18n";
import { yarrowSumToLine } from "@iching-oracle/iching-engine";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [showIntro, setShowIntro] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
  const [recorded, setRecorded] = useState<Array<6 | 7 | 8 | 9>>([]);
  const [phase1, setPhase1] = useState<Phase1Value | null>(null);
  const [phase2, setPhase2] = useState<Phase23Value | null>(null);
  const [phase3, setPhase3] = useState<Phase23Value | null>(null);

  useEffect(() => {
    if (!open) {
      setShowIntro(true);
      setCurrentPhase(1);
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

  const currentPhaseValue =
    currentPhase === 1 ? phase1 : currentPhase === 2 ? phase2 : phase3;

  const handlePhaseValue = useCallback(
    (v: number) => {
      if (currentPhase === 1) setPhase1(v as Phase1Value);
      else if (currentPhase === 2) setPhase2(v as Phase23Value);
      else setPhase3(v as Phase23Value);
    },
    [currentPhase],
  );

  const advancePhase = useCallback(() => {
    if (currentPhase === 1) setCurrentPhase(2);
    else if (currentPhase === 2) setCurrentPhase(3);
  }, [currentPhase]);

  const registerLine = useCallback(() => {
    if (currentValue === null) return;
    const nextRecorded = [...recorded, currentValue];
    if (nextRecorded.length === 6) {
      onComplete(nextRecorded as IchingManualLineTuple);
      return;
    }
    setRecorded(nextRecorded);
    setPhase1(null);
    setPhase2(null);
    setPhase3(null);
    setCurrentPhase(1);
  }, [currentValue, recorded, onComplete]);

  const goBack = useCallback(() => {
    if (currentPhase === 3) {
      setPhase3(null);
      setCurrentPhase(2);
      return;
    }
    if (currentPhase === 2) {
      setPhase2(null);
      setPhase3(null);
      setCurrentPhase(1);
      return;
    }
    // currentPhase === 1
    if (recorded.length > 0) {
      setRecorded((prev) => prev.slice(0, -1));
      setPhase1(null);
      setPhase2(null);
      setPhase3(null);
    } else {
      setShowIntro(true);
    }
  }, [currentPhase, recorded]);

  const jumpToStep = useCallback(
    (step: number) => {
      if (step < 1 || step > 6) return;
      setRecorded((prev) => {
        if (step > prev.length) return prev;
        return prev.slice(0, step - 1);
      });
      setPhase1(null);
      setPhase2(null);
      setPhase3(null);
      setCurrentPhase(1);
    },
    [],
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

  const isLastPhase = currentPhase === 3;
  const showLineSymbol = isLastPhase && currentValue !== null;
  const phaseButtons = currentPhase === 1 ? ([5, 9] as const) : ([4, 8] as const);
  const phaseLabel =
    currentPhase === 1 ? m.phase1Label : currentPhase === 2 ? m.phase2Label : m.phase3Label;
  const phaseHint =
    currentPhase === 1 ? m.phase1Hint : currentPhase === 2 ? m.phase2Hint : m.phase3Hint;
  const phaseAria =
    currentPhase === 1 ? m.phase1Aria : currentPhase === 2 ? m.phase2Aria : m.phase3Aria;

  const canGoBack = !showIntro;

  // Intro screen
  if (showIntro) {
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

            <div className="manual-yarrow-intro">
              <p className="manual-yarrow-intro-warning">{m.physicalWarning}</p>
              <button
                type="button"
                className="primary-btn manual-yarrow-start-btn"
                onClick={() => setShowIntro(false)}
              >
                {m.startButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main wizard screen
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

          {/* Line progress strip */}
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

          {/* Phase pip indicator */}
          <div className="manual-yarrow-phase-indicator" aria-hidden="true">
            {([1, 2, 3] as const).map((p) => (
              <span
                key={p}
                className={`manual-yarrow-phase-pip${currentPhase >= p ? " manual-yarrow-phase-pip--active" : ""}`}
              />
            ))}
          </div>

          {/* Single-phase input body */}
          <div className="manual-yarrow-phase-body">
            <p className="manual-yarrow-phase-label">{phaseLabel}</p>
            <p className="manual-yarrow-phase-hint">{phaseHint}</p>
            <div className="manual-yarrow-phase-buttons manual-yarrow-phase-buttons--large">
              {phaseButtons.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`manual-yarrow-residue-btn manual-yarrow-residue-btn--large${currentPhaseValue === v ? " manual-yarrow-residue-btn--selected" : ""}`}
                  onClick={() => handlePhaseValue(v)}
                  aria-pressed={currentPhaseValue === v}
                  aria-label={phaseAria.replace("{{v}}", String(v))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* G3: line symbol after phase 3 value set */}
          {showLineSymbol && (
            <div
              className="yarrow-line-symbol-wrap"
              key={`yl-${lineNumber}-${phase3}`}
              aria-hidden="true"
            >
              <div className="yarrow-line-symbol">
                <span
                  className={`yarrow-line-glyph ${currentValue === 7 || currentValue === 9 ? "yarrow-line-yang" : "yarrow-line-yin"}`}
                >
                  {currentValue === 7 || currentValue === 9 ? "⚊" : "⚋"}
                </span>
                {currentValue === 9 && (
                  <span className="yarrow-line-marker yarrow-line-marker--yang">✕</span>
                )}
                {currentValue === 6 && (
                  <span className="yarrow-line-marker yarrow-line-marker--yin">○</span>
                )}
              </div>
              <p className="yarrow-line-caption">{caption}</p>
            </div>
          )}

          {/* Awaiting text on phase 3 before value selected */}
          {isLastPhase && !showLineSymbol && (
            <p className="manual-yarrow-awaiting">{m.awaitingResult}</p>
          )}
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
          {isLastPhase ? (
            <button
              type="button"
              className="primary-btn"
              onClick={registerLine}
              disabled={currentValue === null}
            >
              {recorded.length === 5 ? m.confirmConsult : m.registerLine}
            </button>
          ) : (
            <button
              type="button"
              className="primary-btn"
              onClick={advancePhase}
              disabled={currentPhaseValue === null}
            >
              {m.nextPhase}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
