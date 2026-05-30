#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const {
  CHANGELOG_PATH,
  KNOWN_STAGES,
  LAST_RELEASE_MARKER_RE,
  CHANGELOG_INTRO,
} = require("./changelog/constants");
const { fetchGitLog } = require("./changelog/parse-git");
const { resolveStage } = require("./changelog/version-map");
const { buildHighlights, groupCommitsBySection } = require("./changelog/categorize");
const {
  renderReleaseEntry,
  renderSummaryTable,
  renderUnreleasedSection,
} = require("./changelog/render");

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const out = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      out.dryRun = true;
      continue;
    }
    if (arg.startsWith("--") && i + 1 < argv.length) {
      const key = arg.slice(2);
      out[key] = argv[++i];
    }
  }
  return out;
}

/**
 * @param {string} content
 */
function parseLastReleaseHash(content) {
  const marker = content.match(LAST_RELEASE_MARKER_RE);
  if (marker) return marker[1];

  const headerMatch = content.match(/^## \[([\d.]+)\][^\n]*\n(?:.*?\n)*?- .*? \| commit: ([0-9a-f]+)/m);
  if (headerMatch) {
    const bumpCommit = headerMatch[2];
    return bumpCommit;
  }

  return null;
}

/**
 * @param {string} content
 */
function parseVersionHeaders(content) {
  const re = /^## \[([\d.]+)\] — (\d{4}-\d{2}-\d{2}) \| versionCode: (\d+) \| Etapa: ([^\n]+)/gm;
  /** @type {Array<{ versionName: string, date: string, versionCode: number, stage: string }>} */
  const rows = [];
  let match;
  while ((match = re.exec(content)) !== null) {
    rows.push({
      versionName: match[1],
      date: match[2],
      versionCode: Number.parseInt(match[3], 10),
      stage: match[4].trim(),
    });
  }
  return rows;
}

/**
 * @param {string} content
 */
function stripSummaryTable(content) {
  const idx = content.indexOf("## Resumen de versiones");
  if (idx === -1) return content.trimEnd();
  return content.slice(0, idx).trimEnd();
}

/**
 * @param {string} content
 */
function removeUnreleasedSection(content) {
  return content
    .replace(/## \[Unreleased\][\s\S]*?---\n?/m, "")
    .trimEnd();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const versionName = String(args.version || "");
  const versionCode = Number.parseInt(String(args.versionCode || ""), 10);
  const stage = String(args.stage || "");
  const since = args.since ? String(args.since) : null;

  if (!versionName || !Number.isFinite(versionCode) || !stage) {
    console.error(
      "Usage: node scripts/update-changelog.js --version 3.3.2 --versionCode 26 --stage \"Closed Testing\" [--since HASH] [--dry-run]",
    );
    process.exit(1);
  }

  if (!KNOWN_STAGES.includes(stage)) {
    console.warn(`Warning: stage "${stage}" is not in known list: ${KNOWN_STAGES.join(", ")}`);
  }

  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.error(`Missing ${CHANGELOG_PATH}. Run: node scripts/generate-changelog.js`);
    process.exit(1);
  }

  const existing = fs.readFileSync(CHANGELOG_PATH, "utf8");
  const existingVersions = parseVersionHeaders(existing);
  const maxExistingVc = existingVersions.reduce((max, v) => Math.max(max, v.versionCode), 0);
  if (versionCode <= maxExistingVc) {
    console.warn(
      `Warning: versionCode ${versionCode} is not greater than latest ${maxExistingVc}`,
    );
  }

  const sinceHash = since || parseLastReleaseHash(existing);
  const newCommits = sinceHash
    ? fetchGitLog({ since: sinceHash })
    : fetchGitLog();

  const releaseBumpHash = newCommits[0]?.hash ?? sinceHash ?? "none";

  if (!newCommits.length) {
    console.warn("No new commits found since last release.");
  }

  const date =
    newCommits[0]?.date ??
    new Date().toISOString().slice(0, 10);

  const releaseMeta = {
    versionName,
    versionCode,
    date,
    stage: stage || resolveStage(versionCode, date),
  };

  const entry = renderReleaseEntry(newCommits, releaseMeta);
  const grouped = groupCommitsBySection(newCommits);
  const highlights = buildHighlights(grouped);

  let body = stripSummaryTable(removeUnreleasedSection(existing));
  body = body.replace(LAST_RELEASE_MARKER_RE, "").trimStart();

  if (!body.startsWith("# Changelog")) {
    body = CHANGELOG_INTRO.trimEnd();
  }

  const marker = `<!-- changelog:last-release:${releaseBumpHash} -->\n\n`;

  // Split at the first version header so the new entry always lands at the top.
  // Using body.indexOf("\n## [") is more robust than searching for intro text,
  // which can fail when blank-line counts vary between runs.
  const firstVersionIdx = body.indexOf("\n## [");
  const intro = firstVersionIdx === -1 ? body : body.slice(0, firstVersionIdx);
  const rest  = firstVersionIdx === -1 ? ""   : body.slice(firstVersionIdx + 1); // skip leading \n

  const updatedIntro = intro.startsWith("<!--")
    ? intro
    : `${marker}${intro.trimEnd()}\n\n`;

  const newContentParts = [
    updatedIntro.trimEnd(),
    entry.trimEnd(),
    rest.trimEnd(),
  ].filter(Boolean);

  const summaryRows = [
    {
      versionName,
      versionCode,
      date,
      stage: releaseMeta.stage,
      commitCount: newCommits.length,
      highlights,
    },
    ...existingVersions.map((v) => ({
      versionName: v.versionName,
      versionCode: v.versionCode,
      date: v.date,
      stage: v.stage,
      commitCount: countCommitsInSection(existing, v.versionName),
      highlights: extractHighlightsFromSection(existing, v.versionName),
    })),
  ];

  const output = `${newContentParts.join("\n\n")}\n\n${renderSummaryTable(summaryRows).trimEnd()}\n`;

  if (args.dryRun) {
    process.stdout.write(output);
    return;
  }

  fs.writeFileSync(CHANGELOG_PATH, output, "utf8");
  console.log(`Updated ${CHANGELOG_PATH} with ${versionName} (${newCommits.length} commits)`);
}

/**
 * @param {string} content
 * @param {string} versionName
 */
function countCommitsInSection(content, versionName) {
  const re = new RegExp(
    `## \\[${versionName.replace(/\./g, "\\.")}\\][\\s\\S]*?(?=\\n## \\[|$)`,
    "m",
  );
  const section = content.match(re)?.[0] ?? "";
  return (section.match(/ \| commit: [0-9a-f]+/g) ?? []).length;
}

/**
 * @param {string} content
 * @param {string} versionName
 */
function extractHighlightsFromSection(content, versionName) {
  const re = new RegExp(
    `## \\[${versionName.replace(/\./g, "\\.")}\\][\\s\\S]*?(?=\\n## \\[|$)`,
    "m",
  );
  const section = content.match(re)?.[0] ?? "";
  const subjects = [...section.matchAll(/^- (.+?) \| commit: /gm)].map((m) => m[1]);
  const fakeCommits = subjects.map((subject, i) => ({
    hash: String(i),
    date: "",
    subject,
  }));
  return buildHighlights(groupCommitsBySection(fakeCommits));
}

main();
