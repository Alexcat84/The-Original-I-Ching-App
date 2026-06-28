"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAllHexagramRecords } from "@iching-oracle/iching-data";
import {
  applyMaskToPrimary,
  changingLinesFromMask,
  decodeCastIndex,
  deriveChangingLinesFromHexPair,
  encodeCastIndex,
  exploreMutation,
  maskFromChangingLines,
  MutationExploreError,
  type LineReadingSystem,
  type MutationExploreResult,
} from "@iching-oracle/iching-engine";
import {
  getIchingMutationRuleLabel,
  getMutationExplorerUiMessages,
  parseAppLocale,
  type MutationExplorerUiMessages,
} from "@iching-oracle/i18n";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  buildOracleTextBlocks,
  formatConsultRef,
  runExploreFromConsultation,
  type ConsultationExploreContext,
  type OracleTextBlock,
} from "@/lib/mutation-explorer/explore-mutation";

type InputMode = "code" | "hex" | "interactive";
type TranslatorTab = "wilhelm" | "legge" | "zhouyi";

interface Props {
  locale: string;
}

function HexLine({
  isYang,
  isChanging,
  position,
  interactive,
  onToggle,
  labels,
}: {
  isYang: boolean;
  isChanging: boolean;
  position: number;
  interactive: boolean;
  onToggle?: () => void;
  labels: MutationExplorerUiMessages;
}) {
  const bar = isYang ? (
    <span className="ritual-hex-line ritual-hex-line--yang" aria-hidden />
  ) : (
    <span className="ritual-hex-line ritual-hex-line--yin" aria-hidden>
      <span />
    </span>
  );

  const className = [
    "mutation-explorer-line",
    isChanging ? "is-changing" : "",
    interactive ? "is-interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (interactive && onToggle) {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={isChanging}
        aria-label={`${labels.lineToggleLabel(position)} — ${
          isChanging ? labels.lineMutating : labels.lineStable
        }`}
        onClick={onToggle}
      >
        {bar}
        <span className="mutation-explorer-line__label">
          {labels.lineToggleLabel(position)}
        </span>
      </button>
    );
  }

  return (
    <div className={className} aria-label={labels.lineToggleLabel(position)}>
      {bar}
    </div>
  );
}

export function MutationExplorer({ locale }: Props) {
  const ui = getMutationExplorerUiMessages(parseAppLocale(locale.slice(0, 2).toLowerCase()));
  const searchParams = useSearchParams();
  const cid = searchParams.get("cid");

  const hexOptions = useMemo(
    () =>
      getAllHexagramRecords({ translator: "wilhelm" }).map((h) => ({
        number: h.number,
        label: `#${h.number} ${h.chineseName} · ${h.name}`,
      })),
    [],
  );

  const [consultation, setConsultation] = useState<ConsultationExploreContext | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("hex");
  const [primaryNumber, setPrimaryNumber] = useState(9);
  const [transformedNumber, setTransformedNumber] = useState(54);
  const [mask, setMask] = useState(60);
  const [castIndexInput, setCastIndexInput] = useState("573");
  const [lineReadingSystem, setLineReadingSystem] = useState<LineReadingSystem>("zhuxi");
  const [result, setResult] = useState<MutationExploreResult | null>(null);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [tab, setTab] = useState<TranslatorTab>("wilhelm");

  const isConsultationMode = Boolean(cid);

  const syncFromMask = useCallback((primary: number, nextMask: number) => {
    setMask(nextMask);
    setPrimaryNumber(primary);
    const transformed = applyMaskToPrimary(primary, nextMask);
    setTransformedNumber(transformed);
    setCastIndexInput(String(encodeCastIndex(primary, nextMask)));
  }, []);

  const runExplore = useCallback(
    (system: LineReadingSystem) => {
      setExploreError(null);
      try {
        if (consultation && isConsultationMode) {
          setResult(runExploreFromConsultation(consultation, system));
          return;
        }
        const castIndex = Number(castIndexInput);
        const explored = exploreMutation({
          primaryNumber,
          castIndex: Number.isFinite(castIndex) ? castIndex : undefined,
          mask,
          lineReadingSystem: system,
        });
        setResult(explored);
      } catch (err) {
        if (err instanceof MutationExploreError) {
          setExploreError(
            err.code === "invalid_cast_index"
              ? ui.castIndexOutOfRange
              : ui.invalidHexPair,
          );
        } else {
          setExploreError(ui.invalidHexPair);
        }
        setResult(null);
      }
    },
    [
      castIndexInput,
      consultation,
      isConsultationMode,
      mask,
      primaryNumber,
      ui.castIndexOutOfRange,
      ui.invalidHexPair,
    ],
  );

  useEffect(() => {
    if (!cid) return;
    let cancelled = false;

    async function load() {
      if (!cid) return;
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch(
          `/api/mutation-explorer/consultation?cid=${encodeURIComponent(cid)}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: "no-store",
          },
        );
        if (!res.ok) {
          if (!cancelled) setLoadError(ui.consultationNotFound);
          return;
        }
        const ctx = (await res.json()) as ConsultationExploreContext;
        if (cancelled) return;
        setConsultation(ctx);
        setLineReadingSystem(ctx.lineReadingSystem);
        syncFromMask(ctx.primaryHexagram, maskFromChangingLines(ctx.changingLines));
        setResult(runExploreFromConsultation(ctx, ctx.lineReadingSystem));
      } catch {
        if (!cancelled) setLoadError(ui.consultationNotFound);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [cid, syncFromMask, ui.consultationNotFound]);

  useEffect(() => {
    if (isConsultationMode && consultation) {
      setResult(runExploreFromConsultation(consultation, lineReadingSystem));
    }
  }, [consultation, isConsultationMode, lineReadingSystem]);

  const primaryRecord = hexOptions.find((h) => h.number === primaryNumber);
  const changingLines = changingLinesFromMask(mask);
  const stableLines = [1, 2, 3, 4, 5, 6].filter((p) => !changingLines.includes(p));
  const displayPrimaryBinary = getAllHexagramRecords({ translator: "wilhelm" }).find(
    (h) => h.number === (result?.primaryNumber ?? primaryNumber),
  )?.binaryTopFirst;

  const oracleBlocks: OracleTextBlock[] = result
    ? buildOracleTextBlocks(result, tab, ui)
    : [];

  const otherSystem: LineReadingSystem =
    lineReadingSystem === "huang" ? "zhuxi" : "huang";

  return (
    <div className="mutation-explorer">
      {isConsultationMode && consultation ? (
        <section className="mutation-explorer-banner">
          <p>
            {ui.fromConsultationBanner} · {ui.consultationRef}{" "}
            <span translate="no">{formatConsultRef(consultation.consultationId)}</span>
            {" · "}
            {new Date(consultation.createdAt).toLocaleDateString(locale)}
          </p>
          <Link href="/" className="mutation-explorer-back-link">
            {ui.backToThread}
          </Link>
          {consultation.translator === "master_combined" ? (
            <p className="mutation-explorer-note">{ui.masterCombinedNote}</p>
          ) : null}
        </section>
      ) : null}

      {loadError ? <p className="mutation-explorer-error">{loadError}</p> : null}

      {!isConsultationMode ? (
        <section className="mutation-explorer-panel">
          <h2>{ui.manualTitle}</h2>
          <div className="mutation-explorer-tabs" role="tablist">
            {(
              [
                ["code", ui.inputModeCode],
                ["hex", ui.inputModeHexPair],
                ["interactive", ui.inputModeInteractive],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={inputMode === mode}
                className={inputMode === mode ? "is-active" : ""}
                onClick={() => setInputMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>

          {inputMode === "code" ? (
            <label className="mutation-explorer-field">
              <span>{ui.castIndexLabel}</span>
              <input
                type="number"
                min={1}
                max={4096}
                value={castIndexInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setCastIndexInput(value);
                  const n = Number(value);
                  if (Number.isFinite(n) && n >= 1 && n <= 4096) {
                    const decoded = decodeCastIndex(n);
                    syncFromMask(decoded.primary, decoded.mask);
                  }
                }}
                placeholder={ui.castIndexPlaceholder}
              />
            </label>
          ) : null}

          {inputMode === "hex" || inputMode === "code" ? (
            <div className="mutation-explorer-hex-row">
              <label className="mutation-explorer-field">
                <span>{ui.primaryHexLabel}</span>
                <select
                  value={primaryNumber}
                  onChange={(e) => {
                    const primary = Number(e.target.value);
                    syncFromMask(primary, mask);
                  }}
                >
                  {hexOptions.map((h) => (
                    <option key={h.number} value={h.number}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mutation-explorer-field">
                <span>{ui.transformedHexLabel}</span>
                <select
                  value={transformedNumber}
                  onChange={(e) => {
                    const transformed = Number(e.target.value);
                    try {
                      const { changingLines: derived } = deriveChangingLinesFromHexPair(
                        primaryNumber,
                        transformed,
                      );
                      syncFromMask(primaryNumber, maskFromChangingLines(derived));
                    } catch {
                      setExploreError(ui.invalidHexPair);
                    }
                  }}
                >
                  {hexOptions.map((h) => (
                    <option key={h.number} value={h.number}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {inputMode === "interactive" ? (
            <>
              <label className="mutation-explorer-field">
                <span>{ui.primaryHexLabel}</span>
                <select
                  value={primaryNumber}
                  onChange={(e) => syncFromMask(Number(e.target.value), mask)}
                >
                  {hexOptions.map((h) => (
                    <option key={h.number} value={h.number}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mutation-explorer-hint">{ui.interactiveHint}</p>
              <div className="mutation-explorer-diagram">
                {[6, 5, 4, 3, 2, 1].map((position) => {
                  const idx = 6 - position;
                  const isYang = displayPrimaryBinary?.[idx] === "1";
                  const isChanging = changingLines.includes(position);
                  return (
                    <HexLine
                      key={position}
                      position={position}
                      isYang={isYang}
                      isChanging={isChanging}
                      interactive
                      labels={ui}
                      onToggle={() => {
                        const nextMask = isChanging
                          ? mask & ~(1 << (position - 1))
                          : mask | (1 << (position - 1));
                        syncFromMask(primaryNumber, nextMask);
                      }}
                    />
                  );
                })}
              </div>
            </>
          ) : null}

          <fieldset className="mutation-explorer-field">
            <legend>{ui.lineReadingSystemLabel}</legend>
            <label>
              <input
                type="radio"
                name="lineReadingSystem"
                checked={lineReadingSystem === "huang"}
                onChange={() => setLineReadingSystem("huang")}
              />
              {ui.lineReadingHuang}
            </label>
            <label>
              <input
                type="radio"
                name="lineReadingSystem"
                checked={lineReadingSystem === "zhuxi"}
                onChange={() => setLineReadingSystem("zhuxi")}
              />
              {ui.lineReadingZhuxi}
            </label>
          </fieldset>

          <button
            type="button"
            className="mutation-explorer-verify-btn"
            onClick={() => runExplore(lineReadingSystem)}
          >
            {ui.verifyButton}
          </button>
        </section>
      ) : (
        <fieldset className="mutation-explorer-field mutation-explorer-field--readonly">
          <legend>{ui.lineReadingSystemLabel}</legend>
          <label>
            <input
              type="radio"
              name="lineReadingSystem"
              checked={lineReadingSystem === "huang"}
              onChange={() => setLineReadingSystem("huang")}
            />
            {ui.lineReadingHuang}
          </label>
          <label>
            <input
              type="radio"
              name="lineReadingSystem"
              checked={lineReadingSystem === "zhuxi"}
              onChange={() => setLineReadingSystem("zhuxi")}
            />
            {ui.lineReadingZhuxi}
          </label>
        </fieldset>
      )}

      {exploreError ? <p className="mutation-explorer-error">{exploreError}</p> : null}

      {result ? (
        <section className="mutation-explorer-results">
          <div className="mutation-explorer-meta">
            <p>
              <strong>{ui.verificationCodeLabel}:</strong>{" "}
              <span translate="no">{result.castIndex}</span>
            </p>
            <p>
              <strong>{primaryRecord?.label ?? `#${result.primaryNumber}`}</strong>
              {" → "}
              <strong>#${result.transformedNumber}</strong>
            </p>
            <p>
              <strong>{ui.ruleApplied}:</strong>{" "}
              {getIchingMutationRuleLabel(
                parseAppLocale(locale.slice(0, 2).toLowerCase()),
                result.mutationRule,
              )}
            </p>
            <p>
              <strong>{ui.changingLines}:</strong>{" "}
              {result.changingLines.length > 0
                ? result.changingLines.join(", ")
                : "—"}
            </p>
            <p>
              <strong>{ui.stableLines}:</strong>{" "}
              {stableLines.length > 0 ? stableLines.join(", ") : "—"}
            </p>
            <button
              type="button"
              className="mutation-explorer-compare-btn"
              onClick={() => {
                setLineReadingSystem(otherSystem);
                runExplore(otherSystem);
              }}
            >
              {ui.compareOtherSystem} ({otherSystem === "huang" ? ui.lineReadingHuang : ui.lineReadingZhuxi})
            </button>
          </div>

          {result ? (
            <div className="mutation-explorer-diagram mutation-explorer-diagram--readonly">
              {[6, 5, 4, 3, 2, 1].map((position) => {
                const idx = 6 - position;
                const isYang = displayPrimaryBinary?.[idx] === "1";
                return (
                  <HexLine
                    key={position}
                    position={position}
                    isYang={isYang}
                    isChanging={result.changingLines.includes(position)}
                    interactive={false}
                    labels={ui}
                  />
                );
              })}
            </div>
          ) : null}

          <h3>{ui.oracleTexts}</h3>
          <div className="mutation-explorer-translator-tabs" role="tablist">
            {(
              [
                ["wilhelm", ui.tabWilhelm],
                ["legge", ui.tabLegge],
                ["zhouyi", ui.tabZhouyi],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={tab === id ? "is-active" : ""}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mutation-explorer-oracle-blocks">
            {oracleBlocks.map((block) => (
              <article key={block.id} className="mutation-explorer-oracle-block">
                <h4>
                  {block.heading}
                  {block.emphasis === "primary" ? (
                    <span className="mutation-explorer-badge">{ui.primaryEmphasis}</span>
                  ) : null}
                  {block.emphasis === "secondary" ? (
                    <span className="mutation-explorer-badge">{ui.secondaryEmphasis}</span>
                  ) : null}
                </h4>
                <blockquote>{block.text}</blockquote>
              </article>
            ))}
          </div>
        </section>
      ) : (
        !loadError && <p className="mutation-explorer-hint">{ui.noResultsYet}</p>
      )}
    </div>
  );
}
