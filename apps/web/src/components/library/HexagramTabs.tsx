"use client";

import { useMemo, useState } from "react";
import type { LibraryPageUiMessages } from "@iching-oracle/i18n";
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

interface Props {
  readonly records: LibraryDetailRecords;
  readonly sources: Record<TranslatorId, SourceMeta>;
  readonly messages: LibraryPageUiMessages;
}

function tabLabel(messages: LibraryPageUiMessages, id: TranslatorId): string {
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

interface TabPanelProps {
  readonly id: TranslatorId;
  readonly record: HexagramRecord;
  readonly source: SourceMeta;
  readonly messages: LibraryPageUiMessages;
}

function TabPanel({ id, record, source, messages }: TabPanelProps) {
  const langAttr = isClassicalChinese(id) ? "zh-Hant" : "en";
  const orderedLines = useMemo(
    () => [...record.lines].sort((a, b) => a.position - b.position),
    [record.lines],
  );

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
        <ol className="library-lines">
          {orderedLines.map((line) => (
            <li key={line.position} className={`library-line library-line--${line.type}`}>
              <span className="library-line__label">
                {messages.lineLabel(line.position)}
              </span>
              <span className="library-line__type" aria-hidden="true">
                {line.type === "yang" ? "—" : "— —"}
              </span>
              <p lang={langAttr} className="library-line__text">
                {line.text}
              </p>
            </li>
          ))}
          {record.yongJiu ? (
            <li className="library-line library-line--yong">
              <span className="library-line__label">{messages.yongJiuLabel}</span>
              <p lang={langAttr} className="library-line__text">
                {record.yongJiu}
              </p>
            </li>
          ) : null}
          {record.yongLiu ? (
            <li className="library-line library-line--yong">
              <span className="library-line__label">{messages.yongLiuLabel}</span>
              <p lang={langAttr} className="library-line__text">
                {record.yongLiu}
              </p>
            </li>
          ) : null}
        </ol>
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

export function HexagramTabs({ records, sources, messages }: Props) {
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
      />
    </div>
  );
}
