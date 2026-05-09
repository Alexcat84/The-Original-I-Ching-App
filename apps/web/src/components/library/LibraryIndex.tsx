"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LibraryPageUiSerialized } from "@iching-oracle/i18n";
import {
  formatTrigramLabel,
  isTrigramId,
  listTrigrams,
  type TrigramId,
} from "@/lib/library/trigram-meta";
import type { LibrarySummary } from "@/lib/library/library-data";

type FilterValue = "all" | TrigramId;

function parseFilter(raw: string): FilterValue {
  if (raw === "all") return "all";
  if (isTrigramId(raw)) return raw;
  return "all";
}

function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchesQuery(item: LibrarySummary, normalizedQuery: string): boolean {
  if (normalizedQuery.length === 0) return true;
  const haystack = [
    String(item.number),
    item.englishName,
    item.chineseName,
    item.pinyin,
    stripDiacritics(item.pinyin),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalizedQuery);
}

function matchesTrigrams(
  item: LibrarySummary,
  upper: FilterValue,
  lower: FilterValue,
): boolean {
  if (upper !== "all" && item.upperTrigram !== upper) return false;
  if (lower !== "all" && item.lowerTrigram !== lower) return false;
  return true;
}

interface Props {
  readonly summaries: ReadonlyArray<LibrarySummary>;
  readonly messages: LibraryPageUiSerialized;
  readonly resultsCountText: string;
}

export function LibraryIndex({ summaries, messages, resultsCountText }: Props) {
  const [query, setQuery] = useState("");
  const [upper, setUpper] = useState<FilterValue>("all");
  const [lower, setLower] = useState<FilterValue>("all");

  const trigrams = useMemo(() => listTrigrams(), []);

  const normalizedQuery = useMemo(
    () => stripDiacritics(query).trim().toLowerCase(),
    [query],
  );

  const filtered = useMemo(
    () =>
      summaries.filter(
        (item) =>
          matchesQuery(item, normalizedQuery) && matchesTrigrams(item, upper, lower),
      ),
    [summaries, normalizedQuery, upper, lower],
  );

  const hasFilters = query.length > 0 || upper !== "all" || lower !== "all";

  return (
    <div className="library-index">
      <div className="library-controls">
        <label className="library-search">
          <span className="visually-hidden">{messages.searchAriaLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={messages.searchPlaceholder}
            aria-label={messages.searchAriaLabel}
            spellCheck={false}
            autoComplete="off"
          />
        </label>

        <fieldset className="library-filters" aria-label={messages.filterHeading}>
          <legend className="visually-hidden">{messages.filterHeading}</legend>
          <label className="library-filter">
            <span>{messages.filterUpperLabel}</span>
            <select
              value={upper}
              onChange={(event) => setUpper(parseFilter(event.target.value))}
            >
              <option value="all">{messages.filterAllLabel}</option>
              {trigrams.map((t) => (
                <option key={t.id} value={t.id}>
                  {formatTrigramLabel(t)}
                </option>
              ))}
            </select>
          </label>
          <label className="library-filter">
            <span>{messages.filterLowerLabel}</span>
            <select
              value={lower}
              onChange={(event) => setLower(parseFilter(event.target.value))}
            >
              <option value="all">{messages.filterAllLabel}</option>
              {trigrams.map((t) => (
                <option key={t.id} value={t.id}>
                  {formatTrigramLabel(t)}
                </option>
              ))}
            </select>
          </label>
          {hasFilters ? (
            <button
              type="button"
              className="library-filter-clear"
              onClick={() => {
                setQuery("");
                setUpper("all");
                setLower("all");
              }}
            >
              {messages.filterClear}
            </button>
          ) : null}
        </fieldset>
      </div>

      <p className="library-results-count" aria-live="polite">
        {resultsCountText}
      </p>

      {filtered.length === 0 ? (
        <p className="library-results-empty">{messages.resultsEmpty}</p>
      ) : (
        <ol className="library-grid" aria-label={messages.hexagramListAriaLabel}>
          {filtered.map((item) => (
            <li key={item.number} className="library-grid__item">
              <Link
                href={`/library/${item.number}`}
                className="library-grid__link"
                aria-label={`${item.number}. ${item.chineseName} ${item.pinyin} — ${item.englishName}`}
              >
                <span className="library-grid__number">{item.number}</span>
                <span className="library-grid__body">
                  <span className="library-grid__glyph" aria-hidden="true">
                    {item.glyph}
                  </span>
                  <span className="library-grid__meta">
                    <span className="library-grid__name" lang="zh-Hant">
                      {item.chineseName}
                    </span>
                    <span className="library-grid__pinyin">{item.pinyin}</span>
                    <span className="library-grid__english">{item.englishName}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
