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
 * Search with strict number matching and token-based name matching.
 *
 * Rules:
 *  - Pure-numeric query → exact number match ONLY (e.g. "6" → hex 6, not 60/64)
 *  - Text query → match against pinyin, Chinese name, English name
 *    with scoring: exact > starts-with > token-boundary > substring
 *  - Mixed (e.g. "6 meng") → numeric part matches exact number,
 *    text part matches names (AND logic)
 */
function matchScore(item: LibrarySummary, normalizedQuery: string): number {
  if (normalizedQuery.length === 0) return 0;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let totalScore = 0;

  for (const token of tokens) {
    const isNumeric = /^\d+$/.test(token);
    let best = -1;

    if (isNumeric) {
      // Numeric token: exact number match only
      if (String(item.number) === token) {
        best = 1000;
      }
    } else {
      // Text token: match against name fields
      const pinyinBase = stripDiacritics(item.pinyin).toLowerCase();
      const pinyinToned = item.pinyin.toLowerCase();
      const englishLower = item.englishName.toLowerCase();
      const chineseLower = item.chineseName;

      // Exact full match
      if (pinyinBase === token || pinyinToned === token) best = Math.max(best, 400);
      if (chineseLower === token) best = Math.max(best, 400);
      if (englishLower === token) best = Math.max(best, 350);

      // Starts-with
      if (pinyinBase.startsWith(token) || pinyinToned.startsWith(token)) best = Math.max(best, 300);
      if (englishLower.startsWith(token)) best = Math.max(best, 250);
      if (chineseLower.startsWith(token)) best = Math.max(best, 250);

      // Token boundary match on pinyin / english words
      const pinyinTokens = pinyinBase.split(/\s+/);
      const englishTokens = englishLower.split(/\s+/);
      if (pinyinTokens.some((t) => t.startsWith(token))) best = Math.max(best, 200);
      if (englishTokens.some((t) => t.startsWith(token))) best = Math.max(best, 150);

      // Substring fallback on name fields only
      const nameHaystack = [pinyinBase, pinyinToned, englishLower, chineseLower].join(" ");
      if (nameHaystack.includes(token)) best = Math.max(best, 100);
    }

    // Any token that doesn't match at all → entire result excluded
    if (best < 0) return -1;
    totalScore += best;
  }

  return totalScore;
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
