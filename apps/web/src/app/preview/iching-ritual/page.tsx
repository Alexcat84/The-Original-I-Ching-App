"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ichingRitualProcessingBudgetMs,
  ichingRitualRevealTimingFromBudget,
} from "@/lib/iching-ritual-timing";

type RitualLine = {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  value: 6 | 7 | 8 | 9;
  isChanging: boolean;
};

const RENDER_ORDER: Array<RitualLine["position"]> = [6, 5, 4, 3, 2, 1];

const DEMO_LINES: RitualLine[] = [
  { position: 1, value: 9, isChanging: true },
  { position: 2, value: 8, isChanging: false },
  { position: 3, value: 7, isChanging: false },
  { position: 4, value: 6, isChanging: true },
  { position: 5, value: 8, isChanging: false },
  { position: 6, value: 7, isChanging: false },
];

type RitualPhase = "question" | "consult" | "shape" | "seal";

const STATUS_COPY: Record<RitualPhase, string> = {
  question: "Tomando tu pregunta…",
  consult: "Llevándola al oráculo…",
  shape: "El oráculo está consultando…",
  seal: "Sellando la lectura…",
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function IChingRitualPreviewPage() {
  const [ritualRevealTick, setRitualRevealTick] = useState(0);
  const [ritualFinale, setRitualFinale] = useState(false);
  const [statusPhase, setStatusPhase] = useState<RitualPhase>("question");
  const [running, setRunning] = useState(false);

  const revealTiming = useMemo(
    () =>
      ichingRitualRevealTimingFromBudget(ichingRitualProcessingBudgetMs(null)),
    [],
  );
  const orderedLines = useMemo(() => [...DEMO_LINES].sort((a, b) => a.position - b.position), []);
  const [previewParticles, setPreviewParticles] = useState<
    Array<{ id: number; left: string; top: string; size: string; duration: string; delay: string }>
  >([]);

  useEffect(() => {
    setPreviewParticles(
      Array.from({ length: 72 }, (_, i) => {
        const left = `${Math.floor(Math.random() * 100)}%`;
        const top = `${Math.floor(Math.random() * 100)}%`;
        const size = `${1.8 + Math.random() * 3.2}px`;
        const duration = `${16 + Math.random() * 20}s`;
        const delay = `${Math.random() * 12}s`;
        return { id: i, left, top, size, duration, delay };
      }),
    );
  }, []);

  const runPreview = async () => {
    if (running) return;
    setRunning(true);
    setRitualFinale(false);
    setRitualRevealTick(0);
    setStatusPhase("question");
    await sleep(900);
    setStatusPhase("consult");
    await sleep(900);
    setStatusPhase("shape");

    for (let t = 1; t <= 12; t += 1) {
      setRitualRevealTick(t);
      await sleep(revealTiming.tickDelayMs);
    }

    setStatusPhase("seal");
    setRitualFinale(true);
    await sleep(1200);
    setRunning(false);
  };

  return (
    <main className="ritual-preview-shell">
      <section className="coins-stage ritual-coins-stage ritual-preview-stage" style={{ width: "min(100%, 36rem)", position: "static" }}>
        <div className="ritual-preview-particles" aria-hidden="true">
          {previewParticles.map((particle) => (
            <span
              key={particle.id}
              className="ritual-preview-particle"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animationDuration: particle.duration,
                animationDelay: `-${particle.delay}`,
              }}
            />
          ))}
        </div>
        <div className="ritual-preview-content">
          <p className="coins-title ritual-status-line ritual-preview-status">{STATUS_COPY[statusPhase]}</p>

          {!ritualFinale ? (
            <div className="ritual-lines-grid">
              {RENDER_ORDER.map((lineNum, i) => {
                const lineData = orderedLines.find((line) => line.position === lineNum) ?? null;
                const sourceVisible = ritualRevealTick >= lineNum * 2 - 1;
                const transformedVisible = ritualRevealTick >= lineNum * 2;
                const sourceYang = lineData ? lineData.value === 7 || lineData.value === 9 : lineNum % 2 === 0;
                const transformedValue = lineData?.value === 6 ? 7 : lineData?.value === 9 ? 8 : lineData?.value;
                const transformedYang = transformedValue ? transformedValue === 7 : lineNum % 2 !== 0;
                const isChanging = Boolean(lineData?.isChanging);

                return (
                  <div key={lineNum} className="ritual-line-row" aria-hidden="true">
                    <div
                      className={`ritual-line-slot ritual-line-slot--source ${sourceVisible ? "is-visible" : ""} ${
                        isChanging ? "is-changing" : ""
                      }`}
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      {sourceVisible ? (
                        sourceYang ? (
                          <span className="ritual-hex-line ritual-hex-line--yang" />
                        ) : (
                          <span className="ritual-hex-line ritual-hex-line--yin">
                            <span />
                            <span />
                          </span>
                        )
                      ) : null}
                    </div>
                    <div className={`ritual-arrow-slot ${sourceVisible ? "is-visible" : ""}`}>
                      <span className="ritual-arrow">→</span>
                    </div>
                    <div
                      className={`ritual-line-slot ritual-line-slot--transformed ${transformedVisible ? "is-visible" : ""} ${
                        isChanging ? "is-changing" : ""
                      }`}
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      {transformedVisible ? (
                        transformedYang ? (
                          <span className="ritual-hex-line ritual-hex-line--yang" />
                        ) : (
                          <span className="ritual-hex-line ritual-hex-line--yin">
                            <span />
                            <span />
                          </span>
                        )
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ritual-final-focus" aria-hidden="true">
              {RENDER_ORDER.map((lineNum, i) => {
                const lineData = orderedLines.find((line) => line.position === lineNum) ?? null;
                const transformedValue = lineData?.value === 6 ? 7 : lineData?.value === 9 ? 8 : lineData?.value;
                const transformedYang = transformedValue ? transformedValue === 7 : true;
                const isChanging = Boolean(lineData?.isChanging);
                return (
                  <div
                    key={`final-${lineNum}`}
                    className={`ritual-final-line ${isChanging ? "is-changing" : ""}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    {transformedYang ? (
                      <span className="ritual-hex-line ritual-hex-line--yang" />
                    ) : (
                      <span className="ritual-hex-line ritual-hex-line--yin">
                        <span />
                        <span />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="ritual-preview-cta">
            <button type="button" onClick={() => void runPreview()} disabled={running} className="primary-btn">
              {running ? "Reproduciendo…" : "Reproducir animación"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
