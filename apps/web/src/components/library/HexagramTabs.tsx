"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import type { LibraryPageUiSerialized } from "@iching-oracle/i18n";
import type {
  HexagramRecord,
  LeggeCommentary,
  TranslatorId,
  WilhelmCommentary,
  WilhelmPointCommentary,
} from "@iching-oracle/iching-data";
import type { LibraryDetailCommentary, LibraryDetailRecords } from "@/lib/library/library-data";
import { CommentaryRibbon, CommentaryRibbonToggle } from "@/components/library/CommentaryRibbon";

const TRANSLATOR_ORDER: ReadonlyArray<TranslatorId> = ["wilhelm", "legge", "zhouyi"];

/** Splits commentary prose on single newlines into paragraphs (distinct from
 * the verse-stanza bullet style used for judgment/image/line oracle text). */
function paragraphs(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Hex-level block: title + toggle on one row; panel expands below (About, Wen Yen, footnotes). */
function HexCommentaryBlock({
  panelId,
  heading,
  ariaLabel,
  isOpen,
  onToggle,
  children,
}: {
  readonly panelId: string;
  readonly heading: string;
  readonly ariaLabel: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly children: ReactNode;
}) {
  return (
    <div className="library-hex-block">
      <div className="library-hex-block__head">
        <span className="library-hex-block__title">{heading}</span>
        <CommentaryRibbonToggle
          panelId={panelId}
          ariaLabel={ariaLabel}
          isOpen={isOpen}
          onToggle={onToggle}
          icon={isOpen ? "−" : "+"}
        />
      </div>
      <CommentaryRibbon
        panelId={panelId}
        ariaLabel={ariaLabel}
        isOpen={isOpen}
        onToggle={onToggle}
        panelOnly
      >
        {children}
      </CommentaryRibbon>
    </div>
  );
}

interface CommentaryPanelBodyWilhelmProps {
  readonly point: WilhelmPointCommentary;
  readonly bookOneLabel: string;
  readonly tenWingsLabel: string;
}

/** Wilhelm book-one + Ten Wings sub-blocks (no toggle — used inside CommentaryRibbon). */
function CommentaryPanelBodyWilhelm({ point, bookOneLabel, tenWingsLabel }: CommentaryPanelBodyWilhelmProps) {
  return (
    <>
      <p className="library-commentary-source">{bookOneLabel}</p>
      {paragraphs(point.bookOne).map((p, i) => (
        <p key={`bo-${i}`}>{p}</p>
      ))}
      <p className="library-commentary-source">{tenWingsLabel}</p>
      {paragraphs(point.tenWings).map((p, i) => (
        <p key={`tw-${i}`}>{p}</p>
      ))}
    </>
  );
}

interface CommentaryPanelBodySingleProps {
  readonly sourceLabel: string;
  readonly text: string;
}

/** Single-source commentary block (Legge symbolism — no toggle). */
function CommentaryPanelBodySingle({ sourceLabel, text }: CommentaryPanelBodySingleProps) {
  return (
    <>
      <p className="library-commentary-source">{sourceLabel}</p>
      {paragraphs(text).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function leggeNoteForPosition(commentary: LeggeCommentary, position: number): string | null {
  const entry = commentary.lineSymbolism.find((l) => l.position === position);
  return entry ? entry.note : null;
}

interface SourceMeta {
  readonly edition: string;
  readonly sourceUrl: string;
}

interface ResolvedLineLabels {
  readonly line1: string;
  readonly line2: string;
  readonly line3: string;
  readonly line4: string;
  readonly line5: string;
  readonly line6: string;
}

interface Props {
  readonly records: LibraryDetailRecords;
  readonly commentary: LibraryDetailCommentary;
  readonly sources: Record<TranslatorId, SourceMeta>;
  readonly messages: LibraryPageUiSerialized;
  readonly lineLabels: ResolvedLineLabels;
}

function tabLabel(messages: LibraryPageUiSerialized, id: TranslatorId): string {
  switch (id) {
    case "wilhelm":
      return messages.tabWilhelm;
    case "legge":
      return messages.tabLegge;
    case "zhouyi":
      return messages.tabZhouyi;
  }
}

function isClassicalChinese(id: TranslatorId): boolean {
  return id === "zhouyi";
}

function lineLabelByPosition(labels: ResolvedLineLabels, pos: number): string {
  switch (pos) {
    case 1: return labels.line1;
    case 2: return labels.line2;
    case 3: return labels.line3;
    case 4: return labels.line4;
    case 5: return labels.line5;
    case 6: return labels.line6;
    default: return String(pos);
  }
}

/**
 * CSS-drawn hexagram line: pixel-perfect alignment between yang (solid)
 * and yin (broken). Both span the same total width; yin has a centered gap.
 * yang: |████████████████|  (one solid bar)
 * yin:  |████████  ████████| (two equal halves with gap)
 */
function LineGlyph({ type }: { readonly type: "yin" | "yang" | "yong-yang" | "yong-yin" }) {
  if (type === "yang" || type === "yong-yang") {
    return <div className="line-glyph line-glyph--yang" aria-hidden="true" />;
  }
  return (
    <div className="line-glyph line-glyph--yin" aria-hidden="true">
      <span className="line-glyph__half" />
      <span className="line-glyph__gap" />
      <span className="line-glyph__half" />
    </div>
  );
}

function yongType(hasYongJiu: boolean, hasYongLiu: boolean): "yong-yang" | "yong-yin" | null {
  if (hasYongJiu) return "yong-yang";
  if (hasYongLiu) return "yong-yin";
  return null;
}

interface TabPanelProps {
  readonly id: TranslatorId;
  readonly record: HexagramRecord;
  readonly source: SourceMeta;
  readonly messages: LibraryPageUiSerialized;
  readonly lineLabels: ResolvedLineLabels;
  readonly wilhelmCommentary: WilhelmCommentary | null;
  readonly leggeCommentary: LeggeCommentary | null;
}

function TabPanel({
  id,
  record,
  source,
  messages,
  lineLabels,
  wilhelmCommentary,
  leggeCommentary,
}: TabPanelProps) {
  const langAttr = isClassicalChinese(id) ? "zh-Hant" : "en";
  const orderedLines = useMemo(
    () => [...record.lines].sort((a, b) => a.position - b.position),
    [record.lines],
  );

  const yong = yongType(!!record.yongJiu, !!record.yongLiu);

  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div
      className="library-tab-panel"
      role="tabpanel"
      id={`library-panel-${id}`}
      aria-labelledby={`library-tab-${id}`}
    >

      {wilhelmCommentary ? (
        <HexCommentaryBlock
          panelId="commentary-about"
          heading={messages.aboutHeading}
          ariaLabel={`${messages.commentaryShowLabel} — ${messages.aboutHeading}`}
          isOpen={open.has("about")}
          onToggle={() => toggle("about")}
        >
          {paragraphs(wilhelmCommentary.about.intro).map((p, i) => (
            <p key={`intro-${i}`}>{p}</p>
          ))}
          <p className="library-commentary-source">{messages.rulerNoteLabel}</p>
          {paragraphs(wilhelmCommentary.about.rulerNote).map((p, i) => (
            <p key={`ruler-${i}`}>{p}</p>
          ))}
          <p className="library-commentary-source">{messages.miscNotesLabel}</p>
          {paragraphs(wilhelmCommentary.about.miscNotes).map((p, i) => (
            <p key={`misc-${i}`}>{p}</p>
          ))}
          {wilhelmCommentary.about.sequence ? (
            <>
              <p className="library-commentary-source">{messages.sequenceLabel}</p>
              {paragraphs(wilhelmCommentary.about.sequence).map((p, i) => (
                <p key={`seq-${i}`}>{p}</p>
              ))}
            </>
          ) : null}
        </HexCommentaryBlock>
      ) : null}

      <section className="library-section">
        <h3>{messages.judgmentHeading}</h3>
        {wilhelmCommentary ? (
          <div className="library-oracle-shell">
            <div className="library-oracle-shell__body">
              {leggeCommentary?.thwanIntro ? (
                <p className="library-editorial-note">
                  <em>{leggeCommentary.thwanIntro}</em>
                </p>
              ) : null}
              <div lang={langAttr} className="library-prose">
                {record.judgment.split("\n").filter(line => line.trim()).map((line, i) => (
                  <div key={i} className="library-stanza">
                    <span className="library-stanza-bullet">·</span>
                    <p className="library-prose-line">{line.trim()}</p>
                  </div>
                ))}
              </div>
            </div>
            <CommentaryRibbon
              panelId="commentary-judgment"
              ariaLabel={`${messages.commentaryShowLabel} — ${messages.judgmentHeading}`}
              isOpen={open.has("judgment")}
              onToggle={() => toggle("judgment")}
            >
              <CommentaryPanelBodyWilhelm
                point={wilhelmCommentary.judgment}
                bookOneLabel={messages.wilhelmCommentaryLabel}
                tenWingsLabel={messages.tenWingsCommentaryLabel}
              />
            </CommentaryRibbon>
          </div>
        ) : (
          <div className="library-text-card">
            {leggeCommentary?.thwanIntro ? (
              <p className="library-editorial-note">
                <em>{leggeCommentary.thwanIntro}</em>
              </p>
            ) : null}
            <div lang={langAttr} className="library-prose">
              {record.judgment.split("\n").filter(line => line.trim()).map((line, i) => (
                <div key={i} className="library-stanza">
                  <span className="library-stanza-bullet">·</span>
                  <p className="library-prose-line">{line.trim()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="library-section">
        <h3>{messages.imageHeading}</h3>
        {wilhelmCommentary ? (
          <div className="library-oracle-shell">
            <div className="library-oracle-shell__body">
              <div lang={langAttr} className="library-prose library-prose--image">
                {record.image.split("\n").filter(line => line.trim()).map((line, i) => (
                  <div key={i} className="library-stanza">
                    <span className="library-stanza-bullet">·</span>
                    <p className="library-prose-line">{line.trim()}</p>
                  </div>
                ))}
              </div>
            </div>
            <CommentaryRibbon
              panelId="commentary-image"
              ariaLabel={`${messages.commentaryShowLabel} — ${messages.imageHeading}`}
              isOpen={open.has("image")}
              onToggle={() => toggle("image")}
            >
              <CommentaryPanelBodyWilhelm
                point={wilhelmCommentary.image}
                bookOneLabel={messages.wilhelmCommentaryLabel}
                tenWingsLabel={messages.tenWingsCommentaryLabel}
              />
            </CommentaryRibbon>
          </div>
        ) : leggeCommentary ? (
          <div className="library-oracle-shell">
            <div className="library-oracle-shell__body">
              <div lang={langAttr} className="library-prose library-prose--image">
                {record.image.split("\n").filter(line => line.trim()).map((line, i) => (
                  <div key={i} className="library-stanza">
                    <span className="library-stanza-bullet">·</span>
                    <p className="library-prose-line">{line.trim()}</p>
                  </div>
                ))}
              </div>
            </div>
            <CommentaryRibbon
              panelId="commentary-image"
              ariaLabel={`${messages.commentaryShowLabel} — ${messages.imageHeading}`}
              isOpen={open.has("image")}
              onToggle={() => toggle("image")}
            >
              <CommentaryPanelBodySingle
                sourceLabel={messages.greatSymbolismLabel}
                text={leggeCommentary.imageSymbolism}
              />
            </CommentaryRibbon>
          </div>
        ) : (
          <div className="library-text-card">
            <div lang={langAttr} className="library-prose library-prose--image">
              {record.image.split("\n").filter(line => line.trim()).map((line, i) => (
                <div key={i} className="library-stanza">
                  <span className="library-stanza-bullet">·</span>
                  <p className="library-prose-line">{line.trim()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="library-section">
        <h3>{messages.linesHeading}</h3>
        {leggeCommentary?.linesIntro ? (
          <div className="library-text-card">
            <p className="library-editorial-note">
              <em>{leggeCommentary.linesIntro}</em>
            </p>
          </div>
        ) : null}
        <div className="library-lines-table-wrap">
          <table className="library-lines-table">
            <thead>
              <tr>
                <th className="library-lines-table__pos" />
                <th className="library-lines-table__symbol" aria-hidden="true" />
                <th className="library-lines-table__text" />
                <th className="library-lines-table__toggle" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {orderedLines.map((line) => {
                const wilhelmLine = wilhelmCommentary?.lines.find((l) => l.position === line.position) ?? null;
                const leggeNote = leggeCommentary ? leggeNoteForPosition(leggeCommentary, line.position) : null;
                const key = `line-${line.position}`;
                const panelId = `commentary-${key}`;
                const lineLabel = lineLabelByPosition(lineLabels, line.position);
                const hasCommentary = wilhelmLine !== null || leggeNote !== null;
                return (
                  <Fragment key={line.position}>
                    <tr className={`library-lines-row library-lines-row--${line.type}`}>
                      <td className="library-lines-table__pos">{lineLabel}</td>
                      <td className="library-lines-table__symbol" aria-hidden="true">
                        <LineGlyph type={line.type} />
                      </td>
                      <td lang={langAttr} className="library-lines-table__text">
                        {line.text}
                      </td>
                      <td className="library-lines-table__toggle">
                        {hasCommentary ? (
                          <CommentaryRibbonToggle
                            panelId={panelId}
                            ariaLabel={`${messages.commentaryShowLabel} — ${lineLabel}`}
                            isOpen={open.has(key)}
                            onToggle={() => toggle(key)}
                            icon={open.has(key) ? "−" : "+"}
                          />
                        ) : null}
                      </td>
                    </tr>
                    {hasCommentary ? (
                      <tr className="library-lines-row library-lines-row--ribbon">
                        <td colSpan={4} className="library-lines-table__ribbon">
                          <CommentaryRibbon
                            panelId={panelId}
                            ariaLabel={`${messages.commentaryShowLabel} — ${lineLabel}`}
                            isOpen={open.has(key)}
                            onToggle={() => toggle(key)}
                            panelOnly
                          >
                            {wilhelmLine ? (
                              <CommentaryPanelBodyWilhelm
                                point={wilhelmLine.commentary}
                                bookOneLabel={messages.wilhelmCommentaryLabel}
                                tenWingsLabel={messages.tenWingsCommentaryLabel}
                              />
                            ) : null}
                            {leggeNote ? (
                              <CommentaryPanelBodySingle
                                sourceLabel={messages.lesserSymbolismLabel}
                                text={leggeNote}
                              />
                            ) : null}
                          </CommentaryRibbon>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {yong ? (
                <Fragment>
                  {(() => {
                    const yongKey = "yong";
                    const yongPanelId = "commentary-yong";
                    const yongLabel = record.yongJiu ? messages.yongJiuLabel : messages.yongLiuLabel;
                    const yongLeggeNote =
                      leggeCommentary && leggeNoteForPosition(leggeCommentary, 7)
                        ? leggeNoteForPosition(leggeCommentary, 7)
                        : null;
                    const yongHasCommentary = !!wilhelmCommentary?.yong || yongLeggeNote !== null;
                    return (
                      <>
                        <tr className="library-lines-row library-lines-row--yong">
                          <td className="library-lines-table__pos">{yongLabel}</td>
                          <td className="library-lines-table__symbol" aria-hidden="true">
                            <LineGlyph type={yong} />
                          </td>
                          <td lang={langAttr} className="library-lines-table__text">
                            {record.yongJiu ?? record.yongLiu ?? ""}
                          </td>
                          <td className="library-lines-table__toggle">
                            {yongHasCommentary ? (
                              <CommentaryRibbonToggle
                                panelId={yongPanelId}
                                ariaLabel={`${messages.commentaryShowLabel} — ${yongLabel}`}
                                isOpen={open.has(yongKey)}
                                onToggle={() => toggle(yongKey)}
                                icon={open.has(yongKey) ? "−" : "+"}
                              />
                            ) : null}
                          </td>
                        </tr>
                        {yongHasCommentary ? (
                          <tr className="library-lines-row library-lines-row--ribbon">
                            <td colSpan={4} className="library-lines-table__ribbon">
                              <CommentaryRibbon
                                panelId={yongPanelId}
                                ariaLabel={`${messages.commentaryShowLabel} — ${yongLabel}`}
                                isOpen={open.has(yongKey)}
                                onToggle={() => toggle(yongKey)}
                                panelOnly
                              >
                                {wilhelmCommentary?.yong ? (
                                  <CommentaryPanelBodyWilhelm
                                    point={wilhelmCommentary.yong}
                                    bookOneLabel={messages.wilhelmCommentaryLabel}
                                    tenWingsLabel={messages.tenWingsCommentaryLabel}
                                  />
                                ) : null}
                                {yongLeggeNote ? (
                                  <CommentaryPanelBodySingle
                                    sourceLabel={messages.lesserSymbolismLabel}
                                    text={yongLeggeNote}
                                  />
                                ) : null}
                              </CommentaryRibbon>
                            </td>
                          </tr>
                        ) : null}
                      </>
                    );
                  })()}
                </Fragment>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {wilhelmCommentary?.wenYen ? (
        <HexCommentaryBlock
          panelId="commentary-wen-yen"
          heading={messages.wenYenHeading}
          ariaLabel={`${messages.commentaryShowLabel} — ${messages.wenYenHeading}`}
          isOpen={open.has("wen-yen")}
          onToggle={() => toggle("wen-yen")}
        >
          {paragraphs(wilhelmCommentary.wenYen.text).map((p, i) => (
            <p key={`wy-${i}`}>{p}</p>
          ))}
          <p className="library-commentary-source">{messages.wenYenNoteLabel}</p>
          {paragraphs(wilhelmCommentary.wenYen.note).map((p, i) => (
            <p key={`wyn-${i}`}>{p}</p>
          ))}
        </HexCommentaryBlock>
      ) : null}

      {leggeCommentary ? (
        <HexCommentaryBlock
          panelId="commentary-footnotes"
          heading={messages.scholarlyNotesHeading}
          ariaLabel={`${messages.commentaryShowLabel} — ${messages.scholarlyNotesHeading}`}
          isOpen={open.has("footnotes")}
          onToggle={() => toggle("footnotes")}
        >
          {paragraphs(leggeCommentary.footnotes).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </HexCommentaryBlock>
      ) : null}

      <p className="library-source">
        <span>{messages.sourceLabel}: </span>
        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
          {source.edition}
        </a>
      </p>
    </div>
  );
}

export function HexagramTabs({ records, commentary, sources, messages, lineLabels }: Props) {
  const [active, setActive] = useState<TranslatorId>("wilhelm");

  return (
    <div className="library-tabs">
      <div role="tablist" aria-label={messages.translationsHeading} className="library-tablist">
        {TRANSLATOR_ORDER.map((id) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`library-tab-${id}`}
              aria-selected={isActive}
              aria-controls={`library-panel-${id}`}
              className={`library-tab${isActive ? " library-tab--active" : ""}`}
              onClick={() => setActive(id)}
              tabIndex={isActive ? 0 : -1}
            >
              {tabLabel(messages, id)}
            </button>
          );
        })}
      </div>
      <TabPanel
        key={active}
        id={active}
        record={records[active]}
        source={sources[active]}
        messages={messages}
        lineLabels={lineLabels}
        wilhelmCommentary={active === "wilhelm" ? commentary.wilhelm : null}
        leggeCommentary={active === "legge" ? commentary.legge : null}
      />
    </div>
  );
}

export type { ResolvedLineLabels };
