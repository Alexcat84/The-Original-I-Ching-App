"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAllHexagramRecords, getHexagramRecordByNumber } from "@iching-oracle/iching-data";
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
  getManualWizardMessages,
  getMutationExplorerUiMessages,
  parseAppLocale,
  type MutationExplorerUiMessages,
} from "@iching-oracle/i18n";
import { formatMutationRuleForUi } from "@/lib/mutation-rule-display";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  buildOracleTextBlocks,
  formatConsultRef,
  runExploreFromConsultation,
  type ConsultationExploreContext,
} from "@/lib/mutation-explorer/explore-mutation";
import { CastRitualDiagram } from "@/components/mutation-explorer/CastRitualDiagram";
import { OracleTextBlocksList } from "@/components/mutation-explorer/OracleTextBlocksList";

type InputMode = "code" | "hex" | "interactive";
type TranslatorTab = "wilhelm" | "legge" | "zhouyi";

interface Props {
  locale: string;
}

const TRANSLATOR_DISPLAY: Record<
  ConsultationExploreContext["translator"],
  string
> = {
  wilhelm: "Wilhelm / Baynes",
  legge: "James Legge",
  zhouyi: "Zhou Yi",
  master_combined: "Wilhelm · Legge · Zhou Yi",
};

function translatorsForConsultation(
  translator: ConsultationExploreContext["translator"],
): TranslatorTab[] {
  if (translator === "master_combined") return ["wilhelm", "legge", "zhouyi"];
  if (translator === "legge") return ["legge"];
  if (translator === "zhouyi") return ["zhouyi"];
  return ["wilhelm"];
}

function translatorTabLabel(ui: MutationExplorerUiMessages, tab: TranslatorTab): string {
  if (tab === "wilhelm") return ui.tabWilhelm;
  if (tab === "legge") return ui.tabLegge;
  return ui.tabZhouyi;
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

function ReadingRulesSection({
  ui,
  ruleLocale,
  result,
}: {
  ui: MutationExplorerUiMessages;
  ruleLocale: ReturnType<typeof parseAppLocale>;
  result: MutationExploreResult;
}) {
  const { originalEn, translation } = formatMutationRuleForUi({
    mutationRule: result.mutationRule,
    lineReadingSystem: result.lineReadingSystem,
    locale: ruleLocale,
  });
  if (!originalEn) return null;

  return (
    <section className="mutation-explorer-reading-rules-section">
      <h2 className="mutation-explorer-section-title">{ui.readingRulesSectionTitle}</h2>
      <p lang="en" className="mutation-explorer-reading-rules-detail">
        {originalEn}
      </p>
      {translation ? (
        <p className="mutation-explorer-reading-rules-detail mutation-explorer-reading-rules-detail--muted">
          {translation}
        </p>
      ) : null}
    </section>
  );
}

export function MutationExplorer({ locale }: Props) {
  const ruleLocale = parseAppLocale(locale.slice(0, 2).toLowerCase());
  const ui = getMutationExplorerUiMessages(ruleLocale);
  const wizardLabels = getManualWizardMessages(ruleLocale);
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
        const initialTab = translatorsForConsultation(ctx.translator)[0] ?? "wilhelm";
        setTab(initialTab);
      } catch {
        if (!cancelled) setLoadError(ui.consultationNotFound);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [cid, syncFromMask, ui.consultationNotFound]);

  const changingLines = changingLinesFromMask(mask);
  const stableLines = [1, 2, 3, 4, 5, 6].filter((p) => !changingLines.includes(p));
  const displayPrimaryBinary = getAllHexagramRecords({ translator: "wilhelm" }).find(
    (h) => h.number === (result?.primaryNumber ?? primaryNumber),
  )?.binaryTopFirst;

  const consultationTranslators = consultation
    ? translatorsForConsultation(consultation.translator)
    : [];
  const activeTranslator = isConsultationMode && consultation
    ? consultationTranslators.length === 1
      ? consultationTranslators[0]!
      : tab
    : tab;

  const oracleBlocks = result ? buildOracleTextBlocks(result, activeTranslator, ui) : [];

  const otherSystem: LineReadingSystem =
    lineReadingSystem === "huang" ? "zhuxi" : "huang";

  const consultationPrimaryHex = consultation
    ? getHexagramRecordByNumber(consultation.primaryHexagram, { translator: "wilhelm" })
    : null;
  const consultationTransformedHex =
    consultation?.transformedHexagram != null
      ? getHexagramRecordByNumber(consultation.transformedHexagram, { translator: "wilhelm" })
      : null;

  const consultationLineReadingLabel =
    consultation?.lineReadingSystem === "zhuxi"
      ? wizardLabels.lineReadingSystemZhuxiShort
      : wizardLabels.lineReadingSystemHuangShort;

  const resultChangingLines = result?.changingLines ?? [];
  const resultStableLines = [1, 2, 3, 4, 5, 6].filter(
    (p) => !resultChangingLines.includes(p),
  );

  if (isConsultationMode) {
    if (loadError) {
      return (
        <div className="mutation-explorer mutation-explorer--consultation">
          <p className="mutation-explorer-error">{loadError}</p>
          <p className="mutation-explorer-footer-nav">
            <Link href="/" className="consultation-record-verify-link">
              {ui.backToThread}
            </Link>
          </p>
        </div>
      );
    }
    if (!consultation || !result) {
      return (
        <div className="mutation-explorer mutation-explorer--consultation">
          <p className="mutation-explorer-hint">{ui.loading}</p>
        </div>
      );
    }

    return (
      <div className="mutation-explorer mutation-explorer--consultation">
        <p className="mutation-explorer-consult-lead">
          {ui.fromConsultationBanner} · {ui.consultationRef}{" "}
          <span translate="no">{formatConsultRef(consultation.consultationId)}</span>
          {" · "}
          {new Date(consultation.createdAt).toLocaleDateString(locale)}
        </p>

        <section
          className="coins-stage ritual-coins-stage mutation-explorer-cast-stage"
          aria-label={ui.fromConsultationBanner}
        >
          <CastRitualDiagram
            lines={consultation.lines}
            primaryHeader={
              consultationPrimaryHex
                ? {
                    number: consultationPrimaryHex.number,
                    chineseName: consultationPrimaryHex.chineseName,
                    name: consultationPrimaryHex.name,
                  }
                : null
            }
            transformedHeader={
              consultationTransformedHex
                ? {
                    number: consultationTransformedHex.number,
                    chineseName: consultationTransformedHex.chineseName,
                    name: consultationTransformedHex.name,
                  }
                : null
            }
          />
        </section>

        <div
          className="consultation-record-grid mutation-explorer-meta-grid"
          role="group"
          aria-label={ui.fromConsultationBanner}
        >
          <p className="consultation-record-row">
            <span className="consultation-record-key">{ui.verificationCodeLabel}:</span>
            <span className="consultation-record-value" translate="no">
              {result.castIndex}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{ui.changingLines}:</span>
            <span className="consultation-record-value" translate="no">
              {resultChangingLines.length > 0 ? resultChangingLines.join(", ") : "—"}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{ui.stableLines}:</span>
            <span className="consultation-record-value" translate="no">
              {resultStableLines.length > 0 ? resultStableLines.join(", ") : "—"}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{ui.lineReadingSystemLabel}:</span>
            <span className="consultation-record-value">{consultationLineReadingLabel}</span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{ui.translatorAppliedLabel}</span>
            <span className="consultation-record-value">
              {TRANSLATOR_DISPLAY[consultation.translator]}
            </span>
          </p>
        </div>

        <ReadingRulesSection
          ui={ui}
          ruleLocale={ruleLocale}
          result={result}
        />

        <section className="mutation-explorer-oracle-section">
          <h2 className="mutation-explorer-section-title">{ui.oracleTexts}</h2>
          {consultationTranslators.length === 1 ? (
            <OracleTextBlocksList blocks={oracleBlocks} ui={ui} />
          ) : (
            consultationTranslators.map((translatorId) => (
              <div key={translatorId} className="mutation-explorer-translator-section">
                <h3 className="mutation-explorer-translator-heading">
                  {translatorTabLabel(ui, translatorId)}
                </h3>
                <OracleTextBlocksList
                  blocks={buildOracleTextBlocks(result, translatorId, ui)}
                  ui={ui}
                />
              </div>
            ))
          )}
        </section>

        <p className="mutation-explorer-footer-nav">
          <Link href="/" className="consultation-record-verify-link">
            {ui.backToThread}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mutation-explorer">
      {loadError ? <p className="mutation-explorer-error">{loadError}</p> : null}

      {!isConsultationMode ? (
        <section className="mutation-explorer-panel">
          <h2>{ui.manualTitle}</h2>
          <div className="library-tablist mutation-explorer-mode-tabs" role="tablist">
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
                className={`library-tab${inputMode === mode ? " library-tab--active" : ""}`}
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

          <fieldset className="mutation-explorer-field mutation-explorer-fieldset">
            <legend>{ui.lineReadingSystemLabel}</legend>
            <div className="mutation-explorer-radio-row">
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
            </div>
          </fieldset>

          <button
            type="button"
            className="composer-reading-pill mutation-explorer-verify-btn"
            onClick={() => runExplore(lineReadingSystem)}
          >
            {ui.verifyButton}
          </button>
        </section>
      ) : null}

      {exploreError ? <p className="mutation-explorer-error">{exploreError}</p> : null}

      {result && !isConsultationMode ? (
        <section className="mutation-explorer-results">
          <div className="consultation-record-grid mutation-explorer-meta-grid">
            <p className="consultation-record-row">
              <span className="consultation-record-key">{ui.verificationCodeLabel}:</span>
              <span className="consultation-record-value" translate="no">
                {result.castIndex}
              </span>
            </p>
            <p className="consultation-record-row">
              <span className="consultation-record-key">{ui.changingLines}:</span>
              <span className="consultation-record-value" translate="no">
                {result.changingLines.length > 0 ? result.changingLines.join(", ") : "—"}
              </span>
            </p>
            <p className="consultation-record-row">
              <span className="consultation-record-key">{ui.stableLines}:</span>
              <span className="consultation-record-value" translate="no">
                {stableLines.length > 0 ? stableLines.join(", ") : "—"}
              </span>
            </p>
            <p className="consultation-record-row">
              <span className="consultation-record-key">{ui.lineReadingSystemLabel}:</span>
              <span className="consultation-record-value">
                {lineReadingSystem === "zhuxi" ? ui.lineReadingZhuxi : ui.lineReadingHuang}
              </span>
            </p>
          </div>

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

          <button
            type="button"
            className="composer-reading-pill mutation-explorer-compare-btn"
            onClick={() => {
              setLineReadingSystem(otherSystem);
              runExplore(otherSystem);
            }}
          >
            {ui.compareOtherSystem} (
            {otherSystem === "huang" ? ui.lineReadingHuang : ui.lineReadingZhuxi})
          </button>

          <ReadingRulesSection
            ui={ui}
            ruleLocale={ruleLocale}
            result={result}
          />

          <h3 className="mutation-explorer-section-title">{ui.oracleTexts}</h3>
          <div className="library-tablist mutation-explorer-translator-tabs" role="tablist">
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
                className={`library-tab${tab === id ? " library-tab--active" : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <OracleTextBlocksList blocks={oracleBlocks} ui={ui} />
        </section>
      ) : (
        !loadError &&
        !isConsultationMode && <p className="mutation-explorer-hint">{ui.noResultsYet}</p>
      )}
    </div>
  );
}
