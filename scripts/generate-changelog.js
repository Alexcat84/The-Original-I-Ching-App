#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const { CHANGELOG_PATH } = require("./changelog/constants");
const { fetchGitLog, sortChronological } = require("./changelog/parse-git");
const {
  buildVersionTimeline,
  resolveStage,
} = require("./changelog/version-map");
const { buildHighlights, groupCommitsBySection } = require("./changelog/categorize");
const { renderChangelog } = require("./changelog/render");

/**
 * Assign commits to version windows: (prevBump, currBump] per timeline entry.
 * @param {Array<{ hash: string, date: string, subject: string }>} commitsAsc
 * @param {ReturnType<typeof buildVersionTimeline>} timelineAsc
 */
function assignByVersionWindows(commitsAsc, timelineAsc) {
  /** @type {Map<string, Array<{ hash: string, date: string, subject: string }>>} */
  const byVersion = new Map();
  const assigned = new Set();

  for (let i = 0; i < timelineAsc.length; i++) {
    const prev = timelineAsc[i - 1];
    const curr = timelineAsc[i];
    const bucket = [];

    for (const commit of commitsAsc) {
      if (assigned.has(commit.hash)) continue;

      if (prev) {
        if (commit.date < prev.date) continue;
        if (commit.date === prev.date && commit.hash <= prev.hash) continue;
      }

      if (commit.date > curr.date) continue;
      if (commit.date === curr.date && commit.hash > curr.hash) continue;

      bucket.push(commit);
      assigned.add(commit.hash);
    }

    byVersion.set(curr.versionName, bucket);
  }

  const unreleased = commitsAsc.filter((c) => !assigned.has(c.hash));
  return { byVersion, unreleased };
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
    includeMerges: argv.includes("--include-merges"),
  };
}

function validateGenerated(versions, allHashes) {
  const unique = new Set(allHashes);
  if (unique.size !== allHashes.length) {
    throw new Error("Duplicate commit hashes in generated changelog");
  }

  const has3x = versions.some((v) => /^3\./.test(v.versionName));
  if (!has3x) {
    throw new Error("Expected at least one 3.x version entry");
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const commitsDesc = fetchGitLog({ includeMerges: args.includeMerges });
  const commitsAsc = sortChronological(commitsDesc);
  const timelineAsc = buildVersionTimeline(commitsAsc);

  const { byVersion, unreleased } = assignByVersionWindows(commitsAsc, timelineAsc);

  const versions = [...timelineAsc]
    .reverse()
    .map((release) => {
      const commits = byVersion.get(release.versionName) ?? [];
      const grouped = groupCommitsBySection(commits);
      return {
        versionName: release.versionName,
        date: release.date,
        versionCode: release.versionCode,
        stage: resolveStage(release.versionCode, release.date),
        commits,
        highlights: buildHighlights(grouped),
      };
    })
    .filter((v) => v.commits.length > 0);

  const lastRelease = timelineAsc[timelineAsc.length - 1];
  const lastReleaseHash = lastRelease?.hash ?? null;

  const allHashes = [
    ...unreleased.map((c) => c.hash),
    ...versions.flatMap((v) => v.commits.map((c) => c.hash)),
  ];

  validateGenerated(versions, allHashes);

  const markdown = renderChangelog({
    lastReleaseHash,
    versions,
    unreleased,
  });

  if (args.dryRun) {
    process.stdout.write(markdown);
    return;
  }

  fs.writeFileSync(CHANGELOG_PATH, markdown, "utf8");
  console.log(`Wrote ${CHANGELOG_PATH}`);
  console.log(`Versions: ${versions.length}, Unreleased commits: ${unreleased.length}`);
}

main();
