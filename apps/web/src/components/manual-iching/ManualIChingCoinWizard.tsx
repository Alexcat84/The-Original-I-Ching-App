"use client";

import type { IchingManualLineTuple } from "@/lib/manual-iching-consult";
import { getManualWizardMessages, type AppLocale } from "@iching-oracle/i18n";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IChingCashCoin } from "./IChingCashCoin";

type CoinFace = "H" | "T";

function lineValueFromCoins(coins: CoinFace[]): 6 | 7 | 8 | 9 {
  const sum = coins.reduce((s, c) => s + (c === "H" ? 3 : 2), 0);
  return sum as 6 | 7 | 8 | 9;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: (values: IchingManualLineTuple) => void;
  locale: AppLocale;
  questionPreview: string;
};

export function ManualIChingCoinWizard({ open, onClose, onComplete, locale, questionPreview }: Props) {
  const m = useMemo(() => getManualWizardMessages(locale), [locale]);
  const [showIntro, setShowIntro] = useState(true);
  const [recorded, setRecorded] = useState<Array<6 | 7 | 8 | 9>>([]);
  const [coins, setCoins] = useState<CoinFace[]>(["H", "H", "H"]);

  useEffect(() => {
    if (!open) {
      setShowIntro(true);
      setRecorded([]);
      setCoins(["H", "H", "H"]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key;
      if (k === "1" || k === "2" || k === "3") {
        const idx = Number(k) - 1;
        setCoins((prev) => {
          const next = [...prev] as CoinFace[];
          next[idx] = next[idx] === "H" ? "T" : "H";
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const currentValue = lineValueFromCoins(coins);
  const caption =
    currentValue === 6 ? m.caption6 : currentValue === 7 ? m.caption7 : currentValue === 8 ? m.caption8 : m.caption9;

  const registerLine = useCallback(() => {
    const v = lineValueFromCoins(coins);
    const nextRecorded = [...recorded, v];
    if (nextRecorded.length === 6) {
      onComplete(nextRecorded as IchingManualLineTuple);
      return;
    }
    setRecorded(nextRecorded);
    setCoins(["H", "H", "H"]);
  }, [coins, recorded, onComplete]);

  const goBack = useCallback(() => {
    setRecorded((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)));
    setCoins(["H", "H", "H"]);
  }, []);

  const jumpToStep = useCallback((step: number) => {
    if (step < 1 || step > 6) return;
    setRecorded((prev) => {
      if (step > prev.length) return prev;
      return prev.slice(0, step - 1);
    });
    setCoins(["H", "H", "H"]);
  }, []);

  if (!open) return null;

  // Intro screen — shown before the first line is cast
  if (showIntro) {
    return (
      <div className="manual-iching-wizard-backdrop" role="presentation">
        <div
          className="manual-iching-wizard-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-iching-wizard-title"
        >
          <div className="manual-iching-wizard-scroll">
            <header className="manual-iching-wizard-header">
              <div className="manual-iching-wizard-header-text">
                <h2 id="manual-iching-wizard-title" className="manual-iching-wizard-title">
                  {m.title}
                </h2>
                <p className="manual-iching-wizard-question" dir="auto">
                  {questionPreview}
                </p>
              </div>
              <button type="button" className="manual-iching-wizard-close" onClick={onClose} aria-label={m.closeAria}>
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

  const lineNumber = recorded.length + 1;
  const lineStepLabel = m.lineStep.replace("{{n}}", String(lineNumber));
  const rollProgressLabel = m.rollProgress.replace("{{current}}", String(lineNumber)).replace("{{total}}", "6");

  return (
    <div className="manual-iching-wizard-backdrop" role="presentation">
      <div
        className="manual-iching-wizard-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-iching-wizard-title"
      >
        <div className="manual-iching-wizard-scroll">
          <header className="manual-iching-wizard-header">
            <div className="manual-iching-wizard-header-text">
              <h2 id="manual-iching-wizard-title" className="manual-iching-wizard-title">
                {m.title}
              </h2>
              <p className="manual-iching-wizard-question" dir="auto">
                {questionPreview}
              </p>
            </div>
            <button type="button" className="manual-iching-wizard-close" onClick={onClose} aria-label={m.closeAria}>
              ×
            </button>
          </header>
          <div className="manual-iching-wizard-progress-panel">
            <div className="manual-iching-wizard-progress-head" aria-live="polite">
              <span className="manual-iching-wizard-roll-progress">{rollProgressLabel}</span>
              <span className="manual-iching-wizard-step">{lineStepLabel}</span>
            </div>
            <div className="manual-iching-wizard-progress-row" role="group" aria-label={m.progressNavHint}>
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
                    className={`manual-iching-wizard-step-pill ${
                      isCurrent ? "manual-iching-wizard-step-pill--current" : ""
                    } ${isDone ? "manual-iching-wizard-step-pill--done" : ""} ${
                      isFuture ? "manual-iching-wizard-step-pill--future" : ""
                    }`}
                    disabled={isFuture || (isCurrent && !isDone)}
                    onClick={() => jumpToStep(step)}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={
                      isDone
                        ? `${m.rollProgress.replace("{{current}}", String(step)).replace("{{total}}", "6")}: ${value}`
                        : isCurrent
                          ? m.rollProgress.replace("{{current}}", String(step)).replace("{{total}}", "6")
                          : `${step}/6`
                    }
                  >
                    {isDone ? String(value) : isCurrent ? "·" : String(step)}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="manual-iching-wizard-hint manual-iching-wizard-hint--inline">{m.coinHint}</p>
          <div className="manual-iching-coins-row" dir="ltr">
            {coins.map((side, i) => (
              <button
                key={i}
                type="button"
                className={`manual-iching-coin manual-iching-coin--${side === "H" ? "heads" : "tails"}`}
                onClick={() =>
                  setCoins((prev) => {
                    const next = [...prev] as CoinFace[];
                    next[i] = next[i] === "H" ? "T" : "H";
                    return next;
                  })
                }
                aria-label={`${m.headsAria.replace("{{i}}", String(i + 1))} / ${m.tailsAria.replace("{{i}}", String(i + 1))}`}
              >
                <IChingCashCoin face={side === "H" ? "yang" : "yin"} />
              </button>
            ))}
          </div>
          <div className="manual-iching-sum-card">
            <div className="manual-iching-sum-main">
              <p className="manual-iching-sum-label">{m.rollSumLabel}</p>
              <p className="manual-iching-sum-value">{currentValue}</p>
            </div>
            <p className="manual-iching-sum-caption">{caption}</p>
          </div>
        </div>
        <div className="manual-iching-wizard-actions">
          <button type="button" className="secondary-btn" onClick={goBack} disabled={recorded.length === 0}>
            {m.back}
          </button>
          <button type="button" className="primary-btn" onClick={registerLine}>
            {recorded.length === 5 ? m.confirmConsult : m.registerLine}
          </button>
        </div>
      </div>
    </div>
  );
}
