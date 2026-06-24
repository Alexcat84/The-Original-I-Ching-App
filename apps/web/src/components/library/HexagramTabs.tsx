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

const TRANSLATOR_ORDER: ReadonlyArray<TranslatorId> = ["wilhelm", "legge", "zhouyi"];

/** Splits commentary prose on single newlines into paragraphs (distinct from
 * the verse-stanza bullet style used for judgment/image/line oracle text). */
function paragraphs(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function CommentaryDetails({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <details className="library-commentary">
      <summary className="library-commentary-summary">{label}</summary>
      <div className="library-commentary-body">{children}</div>
    </details>
  );
}

interface WilhelmPointToggleProps {
  readonly point: WilhelmPointCommentary;
  readonly label: string;
  readonly bookOneLabel: string;
  readonly tenWingsLabel: string;
}

/** Combined "+" panel: Wilhelm's own commentary, then the Ten Wings note for
 * the same point, each clearly sub-labeled inside one revealed panel. */
function WilhelmPointToggle({ point, label, bookOneLabel, tenWingsLabel }: WilhelmPointToggleProps) {
  return (
    <CommentaryDetails label={label}>
      <p className="library-commentary-source">{bookOneLabel}</p>
      {paragraphs(point.bookOne).map((p, i) => (
        <p key={`bo-${i}`}>{p}</p>
      ))}
      <p className="library-commentary-source">{tenWingsLabel}</p>
      {paragraphs(point.tenWings).map((p, i) => (
        <p key={`tw-${i}`}>{p}</p>
      ))}
    </CommentaryDetails>
  );
}

interface SingleSourceToggleProps {
  readonly label: string;
  readonly sourceLabel: string;
  readonly text: string;
}

/** Single-source "+" panel (Legge's Great Symbolism — no second source to combine). */
function SingleSourceToggle({ label, sourceLabel, text }: SingleSourceToggleProps) {
  return (
    <CommentaryDetails label={label}>
      <p className="library-commentary-source">{sourceLabel}</p>
      {paragraphs(text).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </CommentaryDetails>
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

  return (
    <div
      className="library-tab-panel"
      role="tabpanel"
      id={`library-panel-${id}`}
      aria-labelledby={`library-tab-${id}`}
>

      <section className="library-section">
        <h3>{messages.judgmentHeading}</h3>
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
        {wilhelmCommentary ? (
          <WilhelmPointToggle
            point={wilhelmCommentary.judgment}
            label={messages.commentaryShowLabel}
            bookOneLabel={messages.wilhelmCommentaryLabel}
            tenWingsLabel={messages.tenWingsCommentaryLabel}
          />
        ) : null}
      </section>

      <section className="library-section">
        <h3>{messages.imageHeading}</h3>
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
        {wilhelmCommentary ? (
          <WilhelmPointToggle
            point={wilhelmCommentary.image}
            label={messages.commentaryShowLabel}
            bookOneLabel={messages.wilhelmCommentaryLabel}
            tenWingsLabel={messages.tenWingsCommentaryLabel}
          />
        ) : null}
        {leggeCommentary ? (
          <SingleSourceToggle
            label={messages.commentaryShowLabel}
            sourceLabel={messages.greatSymbolismLabel}
            text={leggeCommentary.imageSymbolism}
          />
        ) : null}
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
            </tr>
          </thead>
            <tbody>
              {orderedLines.map((line) => {
                const wilhelmLine = wilhelmCommentary?.lines.find((l) => l.position === line.position) ?? null;
                const leggeNote = leggeCommentary ? leggeNoteForPosition(leggeCommentary, line.position) : null;
                return (
                  <Fragment key={line.position}>
                    <tr className={`library-lines-row library-lines-row--${line.type}`}>
                      <td className="library-lines-table__pos">
                        {lineLabelByPosition(lineLabels, line.position)}
                      </td>
                      <td className="library-lines-table__symbol" aria-hidden="true">
                        <LineGlyph type={line.type} />
                      </td>
                      <td lang={langAttr} className="library-lines-table__text">
                        {line.text}
                      </td>
                    </tr>
                    {wilhelmLine || leggeNote ? (
                      <tr className="library-lines-row library-lines-row--commentary">
                        <td colSpan={3} className="library-lines-table__commentary">
                          {wilhelmLine ? (
                            <WilhelmPointToggle
                              point={wilhelmLine.commentary}
                              label={messages.commentaryShowLabel}
                              bookOneLabel={messages.wilhelmCommentaryLabel}
                              tenWingsLabel={messages.tenWingsCommentaryLabel}
                            />
                          ) : null}
                          {leggeNote ? (
                            <SingleSourceToggle
                              label={messages.commentaryShowLabel}
                              sourceLabel={messages.greatSymbolismLabel}
                              text={leggeNote}
                            />
                          ) : null}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {yong ? (
                <Fragment>
                  <tr className="library-lines-row library-lines-row--yong">
                    <td className="library-lines-table__pos">
                      {record.yongJiu ? messages.yongJiuLabel : messages.yongLiuLabel}
                    </td>
                    <td className="library-lines-table__symbol" aria-hidden="true">
                      <LineGlyph type={yong} />
                    </td>
                    <td lang={langAttr} className="library-lines-table__text">
                      {record.yongJiu ?? record.yongLiu ?? ""}
                    </td>
                  </tr>
                  {wilhelmCommentary?.yong || (leggeCommentary && leggeNoteForPosition(leggeCommentary, 7)) ? (
                    <tr className="library-lines-row library-lines-row--commentary">
                      <td colSpan={3} className="library-lines-table__commentary">
                        {wilhelmCommentary?.yong ? (
                          <WilhelmPointToggle
                            point={wilhelmCommentary.yong}
                            label={messages.commentaryShowLabel}
                            bookOneLabel={messages.wilhelmCommentaryLabel}
                            tenWingsLabel={messages.tenWingsCommentaryLabel}
                          />
                        ) : null}
                        {leggeCommentary && leggeNoteForPosition(leggeCommentary, 7) ? (
                          <SingleSourceToggle
                            label={messages.commentaryShowLabel}
                            sourceLabel={messages.greatSymbolismLabel}
                            text={leggeNoteForPosition(leggeCommentary, 7) ?? ""}
                          />
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {wilhelmCommentary ? (
        <CommentaryDetails label={messages.aboutHeading}>
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
        </CommentaryDetails>
      ) : null}

      {wilhelmCommentary?.wenYen ? (
        <CommentaryDetails label={messages.wenYenHeading}>
          {paragraphs(wilhelmCommentary.wenYen.text).map((p, i) => (
            <p key={`wy-${i}`}>{p}</p>
          ))}
          <p className="library-commentary-source">{messages.wenYenNoteLabel}</p>
          {paragraphs(wilhelmCommentary.wenYen.note).map((p, i) => (
            <p key={`wyn-${i}`}>{p}</p>
          ))}
        </CommentaryDetails>
      ) : null}

      {leggeCommentary ? (
        <CommentaryDetails label={messages.scholarlyNotesHeading}>
          {paragraphs(leggeCommentary.footnotes).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </CommentaryDetails>
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
