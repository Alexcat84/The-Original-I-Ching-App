"use strict";

const { SECTION_ORDER } = require("./constants");

/**
 * @param {string} subject
 * @returns {string}
 */
function categorizeCommit(subject) {
  const lower = subject.toLowerCase();

  if (/^(feat(\([^)]*\))?!?:)/i.test(subject)) return "New";
  if (/^(fix(\([^)]*\))?!?:)/i.test(subject)) return "Fix";
  if (/^(security(\([^)]*\))?!?:|sec(\([^)]*\))?!?:)/i.test(subject)) return "Security";
  if (/^(perf(\([^)]*\))?!?:)/i.test(subject)) return "Performance";
  if (/^(i18n(\([^)]*\))?!?:|locale(\([^)]*\))?!?:)/i.test(subject)) return "i18n";
  if (/^(docs(\([^)]*\))?!?:)/i.test(subject)) return "Docs";
  if (/^(chore(\([^)]*\))?!?:|refactor(\([^)]*\))?!?:|style(\([^)]*\))?!?:|test(\([^)]*\))?!?:)/i.test(subject)) {
    return "Maintenance";
  }

  if (lower.includes("security") || lower.includes("sec:")) return "Security";
  if (lower.includes("i18n") || lower.includes("locale")) return "i18n";

  return "Maintenance";
}

/**
 * @param {Array<{ hash: string, date: string, subject: string }>} commits
 * @returns {Record<string, Array<{ hash: string, subject: string }>>}
 */
function groupCommitsBySection(commits) {
  /** @type {Record<string, Array<{ hash: string, subject: string }>>} */
  const grouped = {};
  for (const section of SECTION_ORDER) {
    grouped[section] = [];
  }

  for (const commit of commits) {
    const section = categorizeCommit(commit.subject);
    grouped[section].push({ hash: commit.hash, subject: commit.subject });
  }

  return grouped;
}

/**
 * @param {Record<string, Array<{ hash: string, subject: string }>>} grouped
 * @returns {string}
 */
function buildHighlights(grouped) {
  const picks = [];
  for (const section of ["New", "Fix", "Security", "i18n"]) {
    for (const item of grouped[section] || []) {
      if (picks.length >= 3) break;
      const text = item.subject.replace(/^(feat|fix|security|sec|i18n|locale)(\([^)]*\))?!?:\s*/i, "");
      picks.push(text.length > 80 ? `${text.slice(0, 77)}…` : text);
    }
    if (picks.length >= 3) break;
  }
  return picks.length ? picks.join("; ") : "—";
}

module.exports = {
  categorizeCommit,
  groupCommitsBySection,
  buildHighlights,
};
