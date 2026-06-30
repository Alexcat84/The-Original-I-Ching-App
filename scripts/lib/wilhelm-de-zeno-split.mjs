/**
 * Oracle vs Wilhelm commentary split for zeno.org paragraphs (incl. same-font blocks).
 */
import { isWilhelmDeCommentaryStart } from "./wilhelm-de-commentary-markers.mjs";

/** @typedef {{ isYong?: boolean; isLine?: boolean }} SplitOptions */

const YONG_COMMENTARY_RE =
  /^Wenn lauter (?:Neunen|Sechsen) erscheinen,(?:\s|$)/i;

/**
 * @param {string} text
 */
function looksLikeShortOracleLine(text) {
  const t = String(text ?? "").trim();
  if (!t) return false;
  if (t.length > 120) return false;
  const lines = t.split("\n").filter(Boolean);
  if (lines.length > 4) return false;
  return lines.every((line) => line.length <= 100);
}

/**
 * @param {string} text
 * @param {SplitOptions} options
 * @param {string[]} oracleParts
 */
function shouldStartCommentary(text, options, oracleParts) {
  const t = String(text ?? "").trim();
  if (!t) return false;
  if (isWilhelmDeCommentaryStart(t)) return true;

  if (options.isYong && oracleParts.length > 0 && YONG_COMMENTARY_RE.test(t)) {
    if (/verwandelt|kommt das ganze|Es gewinnt so/i.test(t)) return true;
  }

  if (oracleParts.length === 0) return false;

  if (options.isLine) {
    if (oracleParts.length >= 1 && !looksLikeShortOracleLine(t) && t.length > 70) {
      return true;
    }
    if (oracleParts.length >= 2 && t.length > 50) return true;
  }

  if (!options.isLine && !options.isYong && oracleParts.length >= 1 && t.length > 100) {
    return true;
  }

  return false;
}

/**
 * @param {string[]} parts
 * @param {SplitOptions} [options]
 */
export function splitZenoOracleCommentary(parts, options = {}) {
  /** @type {string[]} */
  const oracleParts = [];
  /** @type {string[]} */
  const commentaryParts = [];
  let inCommentary = false;

  for (const raw of parts) {
    const t = String(raw ?? "").trim();
    if (!t) continue;

    if (!inCommentary && shouldStartCommentary(t, options, oracleParts)) {
      inCommentary = true;
    }

    if (inCommentary) commentaryParts.push(t);
    else oracleParts.push(t);
  }

  return {
    oracle: oracleParts.join("\n").trim(),
    commentary: commentaryParts.join("\n\n").trim(),
  };
}

/**
 * @param {Array<{ kind: string; text: string }>} blocks
 * @param {SplitOptions} [options]
 */
export function splitZenoBlocks(blocks, options = {}) {
  const hasCommentaryKind = blocks.some((b) => b.kind === "commentary");
  if (hasCommentaryKind) {
    /** @type {string[]} */
    const oracleParts = [];
    /** @type {string[]} */
    const commentaryParts = [];
    let phase = "oracle";
    for (const b of blocks) {
      if (b.kind === "commentary") phase = "commentary";
      if (phase === "oracle") oracleParts.push(b.text);
      else commentaryParts.push(b.text);
    }
    const oracle = oracleParts.join("\n").trim();
    const commentary = commentaryParts.join("\n\n").trim();
    if (commentary) return { oracle, commentary };
    return splitZenoOracleCommentary(oracleParts, options);
  }
  return splitZenoOracleCommentary(
    blocks.map((b) => b.text),
    options,
  );
}
