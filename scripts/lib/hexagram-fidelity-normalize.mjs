import { repairWilhelmOcrText, WILHELM_ORACLE_COMMENTARY_START } from "./hexagram-fidelity-wilhelm-ocr.mjs";

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

/** Map ctext/simplified glyphs to canonical traditional Zhou Yi bundle text. */
export function applyZhouYiVariants(text) {
  let out = text;
  for (const [from, to] of ZHOUYI_VARIANT_MAP) {
    out = out.split(from).join(to);
  }
  return out;
}

/** Half-width → full-width punctuation for stored Zhou Yi oracle text (display + storage). */
export function normalizeZhouYiPunctuation(text) {
  if (text == null) return "";
  return String(text)
    .replace(/,/g, "，")
    .replace(/;/g, "；")
    .replace(/:/g, "：");
}

/** Canonical traditional text for ingest (NFKC + variant map + full-width punctuation). */
export function toCanonicalZhouYiText(text) {
  if (text == null) return "";
  return normalizeZhouYiPunctuation(
    applyZhouYiVariants(String(text).normalize("NFKC")).trim(),
  );
}

/**
 * @param {string} text
 * @param {"wilhelm"|"legge"|"zhouyi"} translator
 */
export function normalizeHexText(text, translator = "wilhelm") {
  if (text == null) return "";
  let out = String(text);
  if (translator === "wilhelm" || translator === "legge") {
    out = repairWilhelmOcrText(out);
  }

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
    out = out.replace(/[™©°]/g, "");
    out = out.replace(/\s+'\s+/g, " ");
    if (translator === "legge") {
      out = out.normalize("NFD").replace(/\p{M}/gu, "");
    }
    out = out.replace(/[,.;:"']/g, " ");
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

/** Oracle stanza only — excludes Wilhelm commentary after the "Thus…" verse. */
export function wilhelmImageOracleOnly(text) {
  if (text == null || !String(text).trim()) return "";
  const blocks = String(text)
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const stanzaBlocks = [];
  for (const block of blocks) {
    stanzaBlocks.push(block);
    if (/\bThus\b/i.test(block)) break;
  }
  const lines = stanzaBlocks.join("\n").split("\n").map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    if (
      out.length >= 3 &&
      /^The (mountain|light|sun|water|thunder|fire|lake|wind|earth|cloud)/i.test(line) &&
      !/image of/i.test(line)
    ) {
      break;
    }
    if (WILHELM_ORACLE_COMMENTARY_START.test(line) && line.length > 40) break;
    out.push(line);
  }
  return out.join("\n").trim();
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
      if (ratio >= 0.88) return true;
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
