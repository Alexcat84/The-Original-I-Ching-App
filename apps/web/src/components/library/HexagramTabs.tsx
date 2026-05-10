"use client";

import { useMemo, useState } from "react";
import type { LibraryPageUiSerialized } from "@iching-oracle/i18n";
import type {
  HexagramRecord,
  TranslatorId,
} from "@iching-oracle/iching-data";
import type { LibraryDetailRecords } from "@/lib/library/library-data";

const TRANSLATOR_ORDER: ReadonlyArray<TranslatorId> = ["wilhelm", "legge", "zhouyi"];

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
}

function TabPanel({ id, record, source, messages, lineLabels }: TabPanelProps) {
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
          <div lang={langAttr} className="library-prose">
            {record.judgment.split("\n").map((line, i) => (
              <p key={i} className="library-prose-line">{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="library-section">
        <h3>{messages.imageHeading}</h3>
        <div className="library-text-card">
          <div lang={langAttr} className="library-prose library-prose--image">
            {record.image.split("\n").map((line, i) => (
              <p key={i} className="library-prose-line">{line}</p>
            ))}
          </div>
        </div>
      </section>

    <section className="library-section">
      <h3>{messages.linesHeading}</h3>
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
              {orderedLines.map((line) => (
                <tr key={line.position} className={`library-lines-row library-lines-row--${line.type}`}>
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
              ))}
              {yong ? (
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
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="library-source">
        <span>{messages.sourceLabel}: </span>
        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
          {source.edition}
        </a>
      </p>
    </div>
  );
}

export function HexagramTabs({ records, sources, messages, lineLabels }: Props) {
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
      />
    </div>
  );
}

export type { ResolvedLineLabels };
