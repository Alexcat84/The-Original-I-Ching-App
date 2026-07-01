"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAllHexagramRecords, getHexagramRecordByNumber } from "@iching-oracle/iching-data";
import {
  applyMaskToPrimary,
  buildSyntheticLinesFromMask,
  decodeCastIndex,
  deriveChangingLinesFromHexPair,
  encodeCastIndex,
  exploreMutation,
  lineValuesFromLines,
  maskFromChangingLines,
  MutationExploreError,
  reachableCastsFromPrimary,
  type LineReadingSystem,
  type MutationExploreResult,
  type ReachableCastFromPrimary,
} from "@iching-oracle/iching-engine";
import {
  getConsultationRecordUiMessages,
  getManualWizardMessages,
  getMutationExplorerUiMessages,
  parseAppLocale,
  type MutationExplorerUiMessages,
} from "@iching-oracle/i18n";
import { formatMutationRuleSummaryForUi } from "@/lib/mutation-rule-display";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  buildOracleTextBlocks,
  formatConsultRef,
  runExploreFromConsultation,
  type ConsultationExploreContext,
} from "@/lib/mutation-explorer/explore-mutation";
import {
  CastRitualDiagram,
  type CastHexHeader,
} from "@/components/mutation-explorer/CastRitualDiagram";
import { OracleTextBlocksList } from "@/components/mutation-explorer/OracleTextBlocksList";

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

const CAST_INDEX_MIN = 1;
const CAST_INDEX_MAX = 4096;

function parseCastIndexInput(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isInteger(n)) return null;
  return n;
}

function isValidCastIndex(n: number): boolean {
  return n >= CAST_INDEX_MIN && n <= CAST_INDEX_MAX;
}

function hexHeader(number: number): CastHexHeader {
  const record = getHexagramRecordByNumber(number, { translator: "wilhelm" });
  return {
    number: record.number,
    chineseName: record.chineseName,
    name: record.name,
  };
}

function ManualCastDiagram({
  primaryNumber,
  transformedNumber,
  mask,
  ariaLabel,
}: {
  primaryNumber: number;
  transformedNumber: number;
  mask: number;
  ariaLabel: string;
}) {
  const lineValues = useMemo(() => {
    const lines = buildSyntheticLinesFromMask(primaryNumber, mask);
    return lineValuesFromLines(lines);
  }, [primaryNumber, mask]);

  return (
    <section
      className="coins-stage ritual-coins-stage mutation-explorer-cast-stage"
      aria-label={ariaLabel}
    >
      <CastRitualDiagram
        lines={lineValues}
        primaryHeader={hexHeader(primaryNumber)}
        transformedHeader={hexHeader(transformedNumber)}
      />
    </section>
  );
}

function OracleReadLegend({
  hint,
  legend,
}: {
  hint: string;
  legend: string;
}) {
  return (
    <>
      <p className="mutation-explorer-field-hint mutation-explorer-oracle-read-hint">{hint}</p>
      <p className="mutation-explorer-read-legend">{legend}</p>
    </>
  );
}

export function MutationExplorer({ locale }: Props) {
  const ruleLocale = parseAppLocale(locale.slice(0, 2).toLowerCase());
  const ui = getMutationExplorerUiMessages(ruleLocale);
  const recordLabels = getConsultationRecordUiMessages(ruleLocale);
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
  const [primaryNumber, setPrimaryNumber] = useState<number | null>(null);
  const [transformedNumber, setTransformedNumber] = useState<number | null>(null);
  const [mask, setMask] = useState(0);
  const [castIndexInput, setCastIndexInput] = useState("");
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
    setExploreError(null);
  }, []);

  const syncFromHexPair = useCallback(
    (primary: number, transformed: number) => {
      const { changingLines: derived } = deriveChangingLinesFromHexPair(primary, transformed);
      syncFromMask(primary, maskFromChangingLines(derived));
    },
    [syncFromMask],
  );

  const reachableTransformedOptions = useMemo(() => {
    if (primaryNumber === null) return [];
    return reachableCastsFromPrimary(primaryNumber)
      .map((entry: ReachableCastFromPrimary) => {
        const h = getHexagramRecordByNumber(entry.transformedNumber, { translator: "wilhelm" });
        return {
          transformed: entry.transformedNumber,
          label: `#${h.number} ${h.chineseName} · ${h.name}`,
        };
      })
      .sort((a, b) => a.transformed - b.transformed);
  }, [primaryNumber]);

  const runExplore = useCallback(
    (system: LineReadingSystem) => {
      setExploreError(null);
      try {
        if (consultation && isConsultationMode) {
          setResult(runExploreFromConsultation(consultation, system));
          return;
        }
        if (primaryNumber === null || transformedNumber === null) {
          setExploreError(ui.selectCastBeforeVerify);
          setResult(null);
          return;
        }
        const parsedCast = parseCastIndexInput(castIndexInput);
        if (parsedCast !== null && !isValidCastIndex(parsedCast)) {
          setExploreError(ui.castIndexOutOfRange);
          setResult(null);
          return;
        }
        const explored = exploreMutation({
          primaryNumber,
          castIndex:
            parsedCast !== null && isValidCastIndex(parsedCast) ? parsedCast : undefined,
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
      transformedNumber,
      ui.castIndexOutOfRange,
      ui.invalidHexPair,
      ui.selectCastBeforeVerify,
    ],
  );

  const castPreviewReady = primaryNumber !== null && transformedNumber !== null;
  const parsedCastIndex = parseCastIndexInput(castIndexInput);
  const castIndexInRange =
    parsedCastIndex === null || isValidCastIndex(parsedCastIndex);

  useEffect(() => {
    if (isConsultationMode) return;
    if (primaryNumber === null || transformedNumber === null || !castIndexInRange) return;
    runExplore(lineReadingSystem);
  }, [isConsultationMode, primaryNumber, transformedNumber, castIndexInRange, lineReadingSystem, runExplore]);

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

  const consultationTranslators = consultation
    ? translatorsForConsultation(consultation.translator)
    : [];
  const activeTranslator = isConsultationMode && consultation
    ? consultationTranslators.length === 1
      ? consultationTranslators[0]!
      : tab
    : tab;

  const oracleBlocks = result ? buildOracleTextBlocks(result, activeTranslator, ui) : [];

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

  const manualRuleSummary =
    result && !isConsultationMode
      ? formatMutationRuleSummaryForUi({
          mutationRule: result.mutationRule,
          lineReadingSystem,
          locale: ruleLocale,
        })
      : null;

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

    const consultTrace =
      consultation.transformedHexagram != null
        ? `#${consultation.primaryHexagram} ${consultationPrimaryHex?.chineseName ?? ""} → #${consultation.transformedHexagram} ${consultationTransformedHex?.chineseName ?? ""}`
        : `#${consultation.primaryHexagram} ${consultationPrimaryHex?.chineseName ?? ""}`;
    const consultDateStr = new Date(consultation.createdAt).toLocaleDateString(
      recordLabels.dateLocale,
      { year: "numeric", month: "short", day: "numeric" },
    );
    const consultRuleSummary = formatMutationRuleSummaryForUi({
      mutationRule: result.mutationRule,
      lineReadingSystem: consultation.lineReadingSystem,
      locale: ruleLocale,
    });

    return (
      <div className="mutation-explorer mutation-explorer--consultation">
        <section
          className="coins-stage ritual-coins-stage mutation-explorer-cast-stage"
          aria-label={recordLabels.summary}
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
          aria-label={recordLabels.summary}
        >
          <p className="consultation-record-row">
            <span className="consultation-record-key">{recordLabels.trace}</span>
            <span className="consultation-record-value" lang="zh">
              {consultTrace}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{ui.readingRefLabel}</span>
            <span className="consultation-record-value" translate="no">
              {formatConsultRef(consultation.consultationId)}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{recordLabels.verificationCode}</span>
            <span className="consultation-record-value" translate="no">
              {result.castIndex}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{recordLabels.changingLinesLabel}</span>
            <span className="consultation-record-value" translate="no">
              {resultChangingLines.length > 0
                ? resultChangingLines.join(", ")
                : recordLabels.changingLinesNone}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{ui.stableLines}:</span>
            <span className="consultation-record-value" translate="no">
              {resultStableLines.length > 0 ? resultStableLines.join(", ") : "—"}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{recordLabels.translatorLabel}</span>
            <span className="consultation-record-value">
              {TRANSLATOR_DISPLAY[consultation.translator]}
            </span>
          </p>
          <p className="consultation-record-row">
            <span className="consultation-record-key">{recordLabels.lineReading}</span>
            <span className="consultation-record-value">{consultationLineReadingLabel}</span>
          </p>
          {consultRuleSummary ? (
            <p className="consultation-record-row">
              <span className="consultation-record-key">{recordLabels.rule}</span>
              <span className="consultation-record-value">{consultRuleSummary}</span>
            </p>
          ) : null}
          <p className="consultation-record-row">
            <span className="consultation-record-key">{recordLabels.thread}</span>
            <span className="consultation-record-value">
              {recordLabels.reading} {consultation.sessionPosition} · {consultDateStr}
            </span>
          </p>
        </div>

        <hr className="mutation-explorer-section-divider" aria-hidden="true" />

        <section className="mutation-explorer-oracle-section">
          <h2 className="mutation-explorer-section-title">{ui.oracleTexts}</h2>
          <OracleReadLegend
            hint={ui.oracleTextsReadHint}
            legend={ui.oracleTextsReadLegend(consultationLineReadingLabel)}
          />
          {consultationTranslators.length === 1 ? (
            <OracleTextBlocksList blocks={oracleBlocks} ui={ui} listId={consultationTranslators[0] ?? "wilhelm"} />
          ) : (
            consultationTranslators.map((translatorId) => (
              <div key={translatorId} className="mutation-explorer-translator-section">
                <h3 className="mutation-explorer-translator-heading">
                  {translatorTabLabel(ui, translatorId)}
                </h3>
                <OracleTextBlocksList
                  blocks={buildOracleTextBlocks(result, translatorId, ui)}
                  ui={ui}
                  listId={translatorId}
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

          <div className="mutation-explorer-manual-form">
            <label className="mutation-explorer-field mutation-explorer-code-field">
              <span>{ui.castIndexLabel}</span>
              <p className="mutation-explorer-field-hint">{ui.castIndexHint}</p>
              <input
                type="text"
                inputMode="numeric"
                className="mutation-explorer-code-input"
                maxLength={4}
                value={castIndexInput}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCastIndexInput(digits);
                  setResult(null);
                  if (!digits) {
                    setExploreError(null);
                    return;
                  }
                  const n = Number(digits);
                  if (isValidCastIndex(n)) {
                    const decoded = decodeCastIndex(n);
                    syncFromMask(decoded.primary, decoded.mask);
                  } else {
                    setExploreError(ui.castIndexOutOfRange);
                  }
                }}
                placeholder={ui.castIndexPlaceholder}
                aria-label={ui.castIndexLabel}
                aria-invalid={parsedCastIndex !== null && !castIndexInRange}
              />
            </label>

            <div className="mutation-explorer-hex-stack">
              <label className="mutation-explorer-field">
                <span>{ui.primaryHexLabel}</span>
                <select
                  className="mutation-explorer-hex-select"
                  value={primaryNumber ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setResult(null);
                    if (value === "") {
                      setPrimaryNumber(null);
                      setTransformedNumber(null);
                      setMask(0);
                      setCastIndexInput("");
                      setExploreError(null);
                      return;
                    }
                    const primary = Number(value);
                    if (transformedNumber !== null) {
                      try {
                        syncFromHexPair(primary, transformedNumber);
                      } catch {
                        setExploreError(ui.invalidHexPair);
                      }
                      return;
                    }
                    setPrimaryNumber(primary);
                    setTransformedNumber(null);
                    setMask(0);
                    setCastIndexInput("");
                    setExploreError(null);
                  }}
                >
                  <option value="">{ui.primaryHexPlaceholder}</option>
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
                  className="mutation-explorer-hex-select"
                  value={transformedNumber ?? ""}
                  disabled={primaryNumber === null}
                  onChange={(e) => {
                    const value = e.target.value;
                    setResult(null);
                    if (value === "" || primaryNumber === null) {
                      setTransformedNumber(null);
                      setMask(0);
                      setCastIndexInput("");
                      return;
                    }
                    const transformed = Number(value);
                    try {
                      syncFromHexPair(primaryNumber, transformed);
                    } catch {
                      setExploreError(ui.invalidHexPair);
                    }
                  }}
                >
                  <option value="">{ui.transformedHexPlaceholder}</option>
                  {reachableTransformedOptions.map((option) => (
                    <option key={option.transformed} value={option.transformed}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {castPreviewReady && primaryNumber !== null && transformedNumber !== null ? (
              <ManualCastDiagram
                primaryNumber={primaryNumber}
                transformedNumber={transformedNumber}
                mask={mask}
                ariaLabel={recordLabels.summary}
              />
            ) : null}

            <fieldset className="mutation-explorer-field mutation-explorer-fieldset mutation-explorer-after-cast">
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

          </div>
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
                {resultStableLines.length > 0 ? resultStableLines.join(", ") : "—"}
              </span>
            </p>
            <p className="consultation-record-row">
              <span className="consultation-record-key">{ui.lineReadingSystemLabel}:</span>
              <span className="consultation-record-value">
                {lineReadingSystem === "zhuxi" ? ui.lineReadingZhuxi : ui.lineReadingHuang}
              </span>
            </p>
            {manualRuleSummary ? (
              <p className="consultation-record-row">
                <span className="consultation-record-key">{recordLabels.rule}</span>
                <span className="consultation-record-value">{manualRuleSummary}</span>
              </p>
            ) : null}
          </div>

          <hr className="mutation-explorer-section-divider" aria-hidden="true" />

          <h3 className="mutation-explorer-section-title">{ui.oracleTexts}</h3>
          <OracleReadLegend
            hint={ui.oracleTextsReadHint}
            legend={ui.oracleTextsReadLegend(
              lineReadingSystem === "zhuxi" ? ui.lineReadingZhuxi : ui.lineReadingHuang,
            )}
          />
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
          <OracleTextBlocksList blocks={oracleBlocks} ui={ui} listId={tab} />
        </section>
      ) : (
        !loadError &&
        !isConsultationMode && <p className="mutation-explorer-hint">{ui.noResultsYet}</p>
      )}
    </div>
  );
}
