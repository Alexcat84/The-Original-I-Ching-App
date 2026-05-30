"use strict";

const { SECTION_ORDER, CHANGELOG_INTRO, HIGHLIGHT_SECTIONS } = require("./constants");
const { groupCommitsBySection, buildHighlights } = require("./categorize");
const { resolveStage } = require("./version-map");

/**
 * @param {Record<string, Array<{ hash: string, subject: string }>>} grouped
 * @returns {string}
 */
function renderGroupedSections(grouped) {
  const lines = [];
  for (const section of SECTION_ORDER) {
    const items = grouped[section];
    if (!items?.length) continue;
    lines.push(`### ${section}`);
    for (const item of items) {
      lines.push(`- ${item.subject} | commit: ${item.hash}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

/**
 * @param {{ versionName: string, date: string, versionCode: number, stage?: string }} meta
 * @param {Array<{ hash: string, date: string, subject: string }>} commits
 * @returns {string}
 */
function renderVersionSection(meta, commits) {
  const grouped = groupCommitsBySection(commits);
  const body = renderGroupedSections(grouped);
  if (!body) return "";

  const stage = meta.stage ?? resolveStage(meta.versionCode, meta.date);
  const header = `## [${meta.versionName}] — ${meta.date} | versionCode: ${meta.versionCode} | Etapa: ${stage}`;
  return `${header}\n\n${body}\n\n---\n`;
}

/**
 * @param {Array<{ hash: string, date: string, subject: string }>} commits
 * @returns {string}
 */
function renderUnreleasedSection(commits) {
  if (!commits.length) return "";
  const grouped = groupCommitsBySection(commits);
  const body = renderGroupedSections(grouped);
  return `## [Unreleased]\n\n${body}\n\n---\n`;
}

/**
 * @param {Array<{ versionName: string, date: string, versionCode: number, stage: string, commitCount: number, highlights: string }>} rows
 * @returns {string}
 */
function renderSummaryTable(rows) {
  const lines = [
    "## Resumen de versiones",
    "",
    "| Version | versionCode | Fecha | Etapa | Commits | Cambios destacados |",
    "|---------|-------------|-------|-------|---------|-------------------|",
  ];

  for (const row of rows) {
    const highlights = row.highlights.replace(/\|/g, "\\|");
    lines.push(
      `| ${row.versionName} | ${row.versionCode} | ${row.date} | ${row.stage} | ${row.commitCount} | ${highlights} |`,
    );
  }

  return `${lines.join("\n")}\n`;
}

/**
 * @param {object} options
 * @param {string | null} options.lastReleaseHash
 * @param {Array<{ versionName: string, date: string, versionCode: number, stage: string, commits: Array<{ hash: string, subject: string, date: string }> }>} options.versions newest first
 * @param {Array<{ hash: string, date: string, subject: string }>} [options.unreleased]
 * @returns {string}
 */
function renderChangelog({ lastReleaseHash, versions, unreleased = [] }) {
  const parts = [];
  const marker = lastReleaseHash
    ? `<!-- changelog:last-release:${lastReleaseHash} -->\n\n`
    : "";

  parts.push(marker + CHANGELOG_INTRO.trimEnd());

  const unreleasedBlock = renderUnreleasedSection(unreleased);
  if (unreleasedBlock) parts.push("", unreleasedBlock);

  for (const version of versions) {
    const section = renderVersionSection(version, version.commits);
    if (section) parts.push(section);
  }

  const summaryRows = versions.map((v) => ({
    versionName: v.versionName,
    versionCode: v.versionCode,
    date: v.date,
    stage: v.stage,
    commitCount: v.commits.length,
    highlights: v.highlights ?? buildHighlights(groupCommitsBySection(v.commits)),
  }));

  if (unreleased.length) {
    summaryRows.unshift({
      versionName: "Unreleased",
      versionCode: "—",
      date: unreleased[unreleased.length - 1]?.date ?? "—",
      stage: "—",
      commitCount: unreleased.length,
      highlights: buildHighlights(groupCommitsBySection(unreleased)),
    });
  }

  parts.push(renderSummaryTable(summaryRows));
  return `${parts.join("\n\n").trimEnd()}\n`;
}

/**
 * @param {Array<{ hash: string, date: string, subject: string }>} commits
 * @param {{ versionName: string, versionCode: number, date: string, stage: string }} meta
 * @returns {string}
 */
function renderReleaseEntry(commits, meta) {
  return renderVersionSection(meta, commits);
}

module.exports = {
  renderChangelog,
  renderReleaseEntry,
  renderSummaryTable,
  renderGroupedSections,
  groupCommitsBySection,
  buildHighlights,
  HIGHLIGHT_SECTIONS,
};
