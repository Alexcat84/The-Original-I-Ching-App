"use strict";

const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "../..");
const CHANGELOG_PATH = path.join(REPO_ROOT, "CHANGELOG.md");

/** First Play Console upload anchor (v2.0.0 / versionCode 2). */
const FIRST_PLAY_UPLOAD = {
  hash: "73dbf0e",
  date: "2026-04-20",
};

const KNOWN_STAGES = [
  "Desarrollo inicial",
  "Internal Testing",
  "Closed Testing",
  "Production",
];

/** Section order in rendered changelog. */
const SECTION_ORDER = [
  "New",
  "Fix",
  "Security",
  "Performance",
  "i18n",
  "Docs",
  "Maintenance",
];

const HIGHLIGHT_SECTIONS = new Set(["New", "Fix", "Security", "i18n"]);

const VERSION_BUMP_PATTERNS = [
  /bump version(?: to)?\s+v?([\d.]+).*?versionCode\s+(\d+)/i,
  /bump version\s+v?([\d.]+)\s*\/\s*versionCode\s+(\d+)/i,
  /bump version\s+v?([\d.]+)\s*\/\s*(\d+)/i,
  /v([\d.]+)\s*\(versionCode\s+(\d+)\)/i,
  /Mobile\s+v?([\d.]+)\s*\(versionCode\s+(\d+)\)/i,
  /release\s+([\d.]+)\s+versionCode\s+(\d+)/i,
  /bump\s+([\d.]+)\s*\/\s*versionCode\s+(\d+)/i,
  /bump to\s+([\d.]+)\s*\(versionCode\s+(\d+)\)/i,
  /version to\s+([\d.]+)\s*\(versionCode\s+(\d+)\)/i,
  /Bump Android app version to\s+([\d.]+)/i,
];

const CHANGELOG_INTRO = `# Changelog — The Original I Ching App

Historial completo de cambios desde el inicio del proyecto.
`;

const LAST_RELEASE_MARKER_RE = /<!--\s*changelog:last-release:([0-9a-f]+)\s*-->/i;

module.exports = {
  REPO_ROOT,
  CHANGELOG_PATH,
  FIRST_PLAY_UPLOAD,
  KNOWN_STAGES,
  SECTION_ORDER,
  HIGHLIGHT_SECTIONS,
  VERSION_BUMP_PATTERNS,
  CHANGELOG_INTRO,
  LAST_RELEASE_MARKER_RE,
};
