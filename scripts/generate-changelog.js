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
 * Assign commits to version windows using git order (index in commitsAsc).
 * Window for version[i] = commits with index in (prevBump.idx, currBump.idx].
 *
 * Windows are processed in git-commit order (by idx), NOT by the timeline's
 * date+versionCode sort. This prevents false-positive version bump commits
 * (e.g. "Mobile 1.0.0 (versionCode 10)" appearing out of chronological order)
 * from creating overlapping windows and producing duplicate commit hashes.
 *
 * @param {Array<{ hash: string, date: string, subject: string }>} commitsAsc
 * @param {ReturnType<typeof buildVersionTimeline>} timelineAsc
 */
function assignByVersionWindows(commitsAsc, timelineAsc) {
  /** @type {Map<string, Array<{ hash: string, date: string, subject: string }>>} */
  const byVersion = new Map();

  // Build hash→index map for O(1) lookup of each bump commit's position.
  const hashToIdx = new Map(commitsAsc.map((c, i) => [c.hash, i]));

  // Resolve each timeline entry to its index in commitsAsc, then sort by that
  // index so windows are always monotonically increasing (no overlaps).
  const windows = timelineAsc
    .map((entry) => ({
      ...entry,
      idx: hashToIdx.has(entry.hash) ? hashToIdx.get(entry.hash) : Infinity,
    }))
    .sort((a, b) => {
      if (a.idx === Infinity && b.idx === Infinity) return 0;
      if (a.idx === Infinity) return 1;
      if (b.idx === Infinity) return -1;
      return a.idx - b.idx;
    });

  let prevIdx = -1;
  for (const window of windows) {
    const currIdx = window.idx;
    if (currIdx === Infinity || currIdx <= prevIdx) {
      // Out-of-order or unknown bump: empty bucket, don't advance cursor.
      byVersion.set(window.versionName, []);
      continue;
    }
    const bucket = commitsAsc.filter((_, j) => j > prevIdx && j <= currIdx);
    byVersion.set(window.versionName, bucket);
    prevIdx = currIdx;
  }

  const unreleased = commitsAsc.filter((_, j) => j > prevIdx);
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
