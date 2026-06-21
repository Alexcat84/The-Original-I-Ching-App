/**
 * Shared text normalization for hexagram fidelity diffs.
 */

const TYPOGRAPHIC_QUOTES = [
  [/\u2018|\u2019/g, "'"],
  [/\u201C|\u201D/g, '"'],
  [/\u2013|\u2014/g, "-"],
  [/\u00A0/g, " "],
];

const ZHOUYI_LINE_PREFIX =
  /^(?:初[九六]|[九六][二三四五]|上[九六]|用[九六])\s*[：:，,]?\s*/u;

const ZHOUYI_JUDGMENT_PREFIX = /^[^：:]{1,4}[：:]\s*/u;

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
    // ctext.org uses simplified 无; freizl/zh-TW upstream uses 無
    out = out.replace(/无/g, "無");
    out = out.replace(/[，,]/g, "，");
    out = out.replace(/[；;]/g, "；");
    out = out.replace(/\s+/g, "");
  } else {
    out = out.replace(/\r/g, " ");
    out = out.replace(/\s*\n+\s*/g, "\n");
    out = out.replace(/[ \t]+/g, " ");
    out = out.replace(/\n{3,}/g, "\n\n");
    out = out.trim();
    // Wilhelm/Legge: collapse internal newlines to space for comparison
    out = out.replace(/\n/g, " ");
    out = out.replace(/\s{2,}/g, " ");
    out = out.toLowerCase();
    // Ignore stray OCR punctuation differences
    out = out.replace(/[''`]/g, "'");
    out = out.replace(/[""]/g, '"');
  }

  return out.trim();
}

/**
 * Strip Zhou Yi position / gua labels before normalization.
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
  // Substring check flags truncation / commentary bleed
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
  if (!a && b) return "missing_in_bundle";
  if (a && !b) return "missing_in_gold";
  if (a.startsWith(b)) return "bundle_truncated_or_gold_longer";
  if (b.startsWith(a)) return "bundle_has_extra";
  return "mismatch";
}
