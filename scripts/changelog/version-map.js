"use strict";

const { FIRST_PLAY_UPLOAD, VERSION_BUMP_PATTERNS } = require("./constants");

/**
 * @typedef {{ hash: string, date: string, versionName: string, versionCode: number, subject: string }} VersionRelease
 */

/**
 * @param {string} subject
 * @returns {{ versionName: string, versionCode: number } | null}
 */
function parseVersionFromSubject(subject) {
  for (const pattern of VERSION_BUMP_PATTERNS) {
    const match = subject.match(pattern);
    if (!match) continue;

    const versionName = match[1].replace(/\.$/, "");
    let versionCode = match[2] ? Number.parseInt(match[2], 10) : null;

    if (pattern.source.includes("Bump Android app version") && !versionCode) {
      return { versionName, versionCode: 4 };
    }

    if (Number.isFinite(versionCode)) {
      return { versionName, versionCode };
    }
  }

  return null;
}

/**
 * @param {Array<{ hash: string, date: string, subject: string }>} commits chronological asc
 * @returns {VersionRelease[]}
 */
function buildVersionTimeline(commits) {
  /** @type {Map<string, VersionRelease>} */
  const byKey = new Map();

  for (const commit of commits) {
    const parsed = parseVersionFromSubject(commit.subject);
    if (!parsed) continue;

    const key = `${parsed.versionName}:${parsed.versionCode}`;
    const existing = byKey.get(key);
    if (!existing || commit.date >= existing.date) {
      byKey.set(key, {
        hash: commit.hash,
        date: commit.date,
        versionName: parsed.versionName,
        versionCode: parsed.versionCode,
        subject: commit.subject,
      });
    }
  }

  return [...byKey.values()].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.versionCode - b.versionCode;
  });
}

/**
 * @param {number} versionCode
 * @param {string} date YYYY-MM-DD
 * @returns {string}
 */
function resolveStage(versionCode, date) {
  if (date < FIRST_PLAY_UPLOAD.date) {
    return "Initial Development";
  }
  if (versionCode >= 22) return "Closed Testing";
  if (versionCode >= 1) return "Internal Testing";
  return "Initial Development";
}

/**
 * Assign each commit to the nearest subsequent version release.
 * @param {Array<{ hash: string, date: string, subject: string }>} commits chronological asc
 * @param {VersionRelease[]} timeline
 * @returns {Map<string, { release: VersionRelease | null, commits: typeof commits }>}
 */
function assignCommitsToVersions(commits, timeline) {
  /** @type {Map<string, { release: VersionRelease | null, commits: typeof commits }>} */
  const buckets = new Map();
  buckets.set("Unreleased", { release: null, commits: [] });

  for (const release of timeline) {
    buckets.set(release.versionName, { release, commits: [] });
  }

  for (const commit of commits) {
    const nextRelease = timeline.find((r) => r.date > commit.date || (r.date === commit.date && r.hash >= commit.hash));
    if (!nextRelease) {
      buckets.get("Unreleased").commits.push(commit);
      continue;
    }
    const bucket = buckets.get(nextRelease.versionName);
    if (bucket) {
      bucket.commits.push(commit);
    }
  }

  return buckets;
}

/**
 * Commits before first timeline entry with no version → Initial Development pseudo-release.
 * @param {Array<{ hash: string, date: string, subject: string }>} commits
 * @param {VersionRelease[]} timeline
 */
function getPreReleaseCommits(commits, timeline) {
  if (!timeline.length) return commits;
  const first = timeline[0];
  return commits.filter((c) => c.date < first.date || (c.date === first.date && c.hash < first.hash));
}

module.exports = {
  parseVersionFromSubject,
  buildVersionTimeline,
  resolveStage,
  assignCommitsToVersions,
  getPreReleaseCommits,
};
