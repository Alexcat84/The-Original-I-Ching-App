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

function lineSymbol(type: "yin" | "yang"): string {
  return type === "yang" ? "━━━" : "━ ━";
}

function yongSymbol(hasYongJiu: boolean, hasYongLiu: boolean): string {
  if (hasYongJiu) return "━━━";
  if (hasYongLiu) return "━ ━";
  return "";
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

  const hasYong = record.yongJiu || record.yongLiu;

  return (
    <div
      className="library-tab-panel"
      role="tabpanel"
      id={`library-panel-${id}`}
      aria-labelledby={`library-tab-${id}`}
    >
      {isClassicalChinese(id) ? (
        <p className="library-zhouyi-notice">{messages.zhouyiClassicalNotice}</p>
      ) : null}

      <section className="library-section">
        <h3>{messages.judgmentHeading}</h3>
        <p lang={langAttr} className="library-prose">
          {record.judgment}
        </p>
      </section>

      <section className="library-section">
        <h3>{messages.imageHeading}</h3>
        <p lang={langAttr} className="library-prose library-prose--image">
          {record.image}
        </p>
      </section>

      <section className="library-section">
        <h3>{messages.linesHeading}</h3>
        <div className="library-lines-table-wrap">
          <table className="library-lines-table">
            <thead>
              <tr>
                <th className="library-lines-table__pos">{messages.linesHeading}</th>
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
                    {lineSymbol(line.type)}
                  </td>
                  <td lang={langAttr} className="library-lines-table__text">
                    {line.text}
                  </td>
                </tr>
              ))}
              {hasYong ? (
                <tr className="library-lines-row library-lines-row--yong">
                  <td className="library-lines-table__pos">
                    {record.yongJiu ? messages.yongJiuLabel : messages.yongLiuLabel}
                  </td>
                  <td className="library-lines-table__symbol" aria-hidden="true">
                    {yongSymbol(!!record.yongJiu, !!record.yongLiu)}
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
