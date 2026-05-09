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

/**
 * Scoring system for search relevance:
 *  - Exact number → highest priority
 *  - Starts-with on pinyin / english name / chinese name → high
 *  - Word-boundary token match → medium
 *  - Substring match → low
 *  - No match → -1 (excluded)
 *
 * This ensures that searching "4" returns hex 4 at the top,
 * and searching "meng" returns hex 4 (蒙, Méng) ahead of partial matches.
 */
function matchScore(item: LibrarySummary, normalizedQuery: string): number {
  if (normalizedQuery.length === 0) return 0;

  const q = normalizedQuery;

  // Exact number match
  if (String(item.number) === q) return 1000;

  // Number prefix match (e.g. "1" matches 1, 10, 11, …12…)
  if (String(item.number).startsWith(q)) return 500;

  const pinyinBase = stripDiacritics(item.pinyin).toLowerCase();
  const pinyinToned = item.pinyin.toLowerCase();
  const englishLower = item.englishName.toLowerCase();
  const chineseLower = item.chineseName;

  // Exact full pinyin match (with or without tones)
  if (pinyinBase === q || pinyinToned === q) return 400;

  // Exact Chinese name match
  if (chineseLower === q) return 400;

  // Exact English name match
  if (englishLower === q) return 350;

  // Starts-with on any name field
  if (pinyinBase.startsWith(q) || pinyinToned.startsWith(q)) return 300;
  if (englishLower.startsWith(q)) return 250;
  if (chineseLower.startsWith(q)) return 250;

  // Token boundary match: split pinyin and english on spaces,
  // check if any token starts with the query
  const pinyinTokens = pinyinBase.split(/\s+/);
  const englishTokens = englishLower.split(/\s+/);

  if (pinyinTokens.some((t) => t.startsWith(q))) return 200;
  if (englishTokens.some((t) => t.startsWith(q))) return 150;

  // Substring match on combined haystack
  const haystack = [
    pinyinBase,
    pinyinToned,
    englishLower,
    chineseLower,
  ].join(" ");
  if (haystack.includes(q)) return 100;

  return -1;
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
}

function formatResultsCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

export function LibraryIndex({ summaries, messages }: Props) {
  const [query, setQuery] = useState("");
  const [upper, setUpper] = useState<FilterValue>("all");
  const [lower, setLower] = useState<FilterValue>("all");

  const trigrams = useMemo(() => listTrigrams(), []);

  const normalizedQuery = useMemo(
    () => stripDiacritics(query).trim().toLowerCase(),
    [query],
  );

  const filtered = useMemo(() => {
    const scored = summaries
      .map((item) => ({ item, score: matchScore(item, normalizedQuery) }))
      .filter(({ score }) => normalizedQuery.length === 0 || score >= 0)
      .filter(({ item }) => matchesTrigrams(item, upper, lower))
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
    return scored;
  }, [summaries, normalizedQuery, upper, lower]);

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
        {formatResultsCount(messages.resultsCount, filtered.length)}
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
