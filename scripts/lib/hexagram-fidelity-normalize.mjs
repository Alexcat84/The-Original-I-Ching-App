/**
 * Shared text normalization for hexagram fidelity diffs.
 */

const TYPOGRAPHIC_QUOTES = [
  [/\u2018|\u2019/g, "'"],
  [/\u201C|\u201D/g, '"'],
  [/\u2013|\u2014/g, "-"],
  [/\u00A0/g, " "],
];

/** ctext (often simplified) → canonical traditional for Zhou Yi diff. */
const ZHOUYI_VARIANT_MAP = [
  ["无", "無"],
  ["于", "於"],
  ["恒", "恆"],
  ["凶", "兇"],
  ["舍", "捨"],
  ["复", "復"],
  ["征", "徵"],
  ["游", "遊"],
  ["沈", "沉"],
];

const ZHOUYI_LINE_PREFIX =
  /^(?:初[九六]|[九六][二三四五]|上[九六]|用[九六])\s*[：:，,]?\s*/u;

const ZHOUYI_JUDGMENT_PREFIX = /^[^：:]{1,4}[：:]\s*/u;

function applyZhouYiVariants(text) {
  let out = text;
  for (const [from, to] of ZHOUYI_VARIANT_MAP) {
    out = out.split(from).join(to);
  }
  return out;
}

/**
 * @param {string} text
 * @param {"wilhelm"|"legge"|"zhouyi"} translator
 */
export function normalizeHexText(text, translator = "wilhelm") {
  if (text == null) return "";
  let out = String(text);

  for (const [re, rep] of TYPOGRAPHIC_QUOTES) {
    out = out.replace(re, rep);
  }

  out = out.replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/\r\n/g, "\n");
  out = out.replace(/\r/g, "\n");

  if (translator === "zhouyi") {
    out = out.normalize("NFKC");
    out = applyZhouYiVariants(out);
    out = out.replace(/[，,]/g, "，");
    out = out.replace(/[；;]/g, "；");
    out = out.replace(/[：:]/g, "：");
    out = out.replace(/\s+/g, "");
  } else {
    out = out.replace(/\s*\n+\s*/g, "\n");
    out = out.replace(/[ \t]+/g, " ");
    out = out.replace(/\n{3,}/g, "\n\n");
    out = out.trim();
    out = out.replace(/\n/g, " ");
    out = out.replace(/\s{2,}/g, " ");
    out = out.toLowerCase();
    out = out.replace(/[''`]/g, "'");
    out = out.replace(/[""]/g, '"');
    out = out.replace(/\.\.\./g, "...");
  }

  return out.trim();
}

/**
 * @param {string} text
 * @param {"judgment"|"line"|"yong"} kind
 */
export function stripZhouYiLabel(text, kind) {
  let out = String(text ?? "").trim();
  if (kind === "judgment") {
    out = out.replace(ZHOUYI_JUDGMENT_PREFIX, "");
  } else {
    out = out.replace(ZHOUYI_LINE_PREFIX, "");
  }
  return out.trim();
}

export function textsMatch(expected, actual, translator) {
  const a = normalizeHexText(expected, translator);
  const b = normalizeHexText(actual, translator);
  if (a === b) return true;
  if (!a || !b) return false;

  if (translator === "wilhelm" || translator === "legge") {
    if (a.length >= 12 && b.startsWith(a)) return true;
    if (b.length >= 12 && a.startsWith(b)) return true;
  }

  if (a.length > 20 && b.length > 20) {
    if (a.startsWith(b) || b.startsWith(a)) {
      const ratio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
      if (ratio >= 0.92) return true;
    }
  }
  return false;
}

export function similarityHint(expected, actual, translator) {
  const a = normalizeHexText(expected, translator);
  const b = normalizeHexText(actual, translator);
  if (a === b) return "exact";
  if (!a && b) return "missing_in_gold";
  if (a && !b) return "missing_in_bundle";
  if (b.startsWith(a) && b.length > a.length + 20) return "commentary_bleed_or_extra";
  if (a.startsWith(b) && a.length > b.length + 20) return "bundle_truncated_or_gold_longer";
  if (b.startsWith(a)) return "bundle_has_extra";
  if (a.startsWith(b)) return "gold_has_extra";
  return "mismatch";
}
