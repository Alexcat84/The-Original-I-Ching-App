"use strict";

const { execFileSync } = require("node:child_process");
const { REPO_ROOT } = require("./constants");

/**
 * @typedef {{ hash: string, date: string, subject: string, refs: string }} GitCommit
 */

/**
 * @param {{ includeMerges?: boolean, since?: string, until?: string }} [options]
 * @returns {GitCommit[]}
 */
/** Subjects that git stash uses for its internal commits — never real app commits. */
const STASH_SUBJECT_RE = /^(WIP on |On [^:]+:|index on [^:]+:|untracked files on [^:]+:)/i;

function fetchGitLog(options = {}) {
  const { includeMerges = false, since, until } = options;
  const args = [
    "log",
    "--format=%h|%ad|%s|%D",
    "--date=short",
  ];

  if (since) {
    args.push(`${since}..HEAD`);
  }
  if (until) {
    args.push(until);
  }

  const raw = execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  const commits = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, subject, refs = ""] = line.split("|");
      return { hash, date, subject, refs };
    })
    .filter((c) => !STASH_SUBJECT_RE.test(c.subject));

  if (includeMerges) {
    return commits;
  }

  return commits.filter((c) => !/^Merge /i.test(c.subject));
}

/**
 * Chronological ascending (oldest first).
 * @param {GitCommit[]} commits
 */
function sortChronological(commits) {
  return [...commits].reverse();
}

module.exports = {
  fetchGitLog,
  sortChronological,
};
