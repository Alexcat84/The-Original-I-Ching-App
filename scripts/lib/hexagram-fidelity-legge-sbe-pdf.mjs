/**
 * Parse James Legge oracle gold from OCR text of the SBE XVI scan (Oxford / Google Books).
 */

import { romanNumeral } from "./hexagram-fidelity-ctext-slugs.mjs";
import {
  parseLeggeTextPage,
  preprocessLeggeHtml,
} from "./hexagram-fidelity-legge-sacred.mjs";
import { loadLeggeSbePdfFullText } from "./legge-sbe-pdf-text-extract.mjs";
import { joinLeggeOcrHyphenation, repairLeggeSbeOcrText, finalizeLeggeSbeRow } from "./hexagram-fidelity-legge-sbe-ocr.mjs";
import { applyEpubGuideToLeggeRow } from "./hexagram-fidelity-legge-sbe-epub-guide.mjs";
import { applyLeggeSbeBookPrimaryPatches } from "./hexagram-fidelity-legge-sbe-book-primary.mjs";
import { parseAllLeggeEpubOrThrow } from "./hexagram-fidelity-legge-epub.mjs";

const ROMAN_OCR_VARIANTS = {
  I: ["I", "l", "1"],
  II: ["II", "Il", "11"],
  III: ["III", "Ill", "111"],
  IV: ["IV", "Iv", "1V"],
  V: ["V"],
  VI: ["VI", "Vl", "V1"],
  VII: ["VII", "Vll", "V1I"],
  VIII: ["VIII", "Vlll", "V111"],
  IX: ["IX", "1X"],
  X: ["X"],
};

function romanPattern(n) {
  const canonical = romanNumeral(n).toUpperCase();
  const variants = new Set([canonical]);
  if (ROMAN_OCR_VARIANTS[canonical]) {
    for (const v of ROMAN_OCR_VARIANTS[canonical]) variants.add(v);
  }
  if (canonical.length > 1) {
    variants.add(canonical.replace(/I/g, "l"));
  }
  const escaped = [...variants].map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return `(?:${escaped.join("|")})`;
}

/** @param {string} roman */
function parseRomanNumeralLoose(roman) {
  const cleaned = String(roman).trim().toUpperCase().replace(/L/g, "I");
  const map = new Map();
  for (let n = 1; n <= 64; n++) map.set(romanNumeral(n).toUpperCase(), n);
  return map.get(cleaned) ?? null;
}

/**
 * @param {string} text
 */
function mergeOcrParagraphs(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  /** @type {string[]} */
  const paras = [];
  let buf = "";
  for (const line of lines) {
    if (isLeggeOcrNoiseLine(line)) continue;
    const isHeader =
      /^(?:[IVXLCDM]+|\d{1,2})[.,]\s*(?:THE\s+)?[^\n]{0,60}(?:Hexagram|HEXAGRAM|Hexacram)/i.test(
        line,
      );
    const isNumberedLine = /^(\d+|S|[IVXLCDM]+)[.,]\s/.test(line);
    const isSectionLabel = /^Explanation of/i.test(line);
    if (isHeader || isSectionLabel) {
      if (buf) paras.push(buf.trim());
      buf = line;
      continue;
    }
    if (isNumberedLine) {
      if (buf) paras.push(buf.trim());
      buf = line;
      continue;
    }
    if (!buf) {
      buf = line;
      continue;
    }
    if (/[.?!:;]$/.test(buf) || /^[\[(]/.test(line)) {
      paras.push(buf.trim());
      buf = line;
    } else {
      buf += ` ${line}`;
    }
  }
  if (buf) paras.push(buf.trim());
  return paras;
}

function plainToLeggeHtml(text) {
  const parts = [];
  for (const line of mergeOcrParagraphs(text)) {
    const safe = line.replace(/</g, "&lt;");
    if (
      /(?:Hexagram|HEXAGRAM|Hexacram|HeExacrRamM)/i.test(line) &&
      /^(?:[IVXLCDM]+|\d{1,2})[.,]/i.test(line)
    ) {
      parts.push(`<h3>${safe}</h3>`);
    } else {
      parts.push(`<p>${safe}</p>`);
    }
  }
  return preprocessLeggeHtml(parts.join("\n"));
}

/** OCR misreads for specific hex header roman numerals. */
const ROMAN_OCR_OVERRIDES = {
  27: ["XXVII", "XXVIL", "XXVI1"],
  43: ["XLIII", "XLII", "XLI1I"],
  57: ["LVII", "LVII,"],
};

const HEXAGRAM_HEADER_WORD =
  "(?:Hexagram|HEXAGRAM|Hexacram|HeExacrRamM|Hexacra|HEXAGRAY|HExaGRaM|HexaGRaM)";

/** Fallback when roman header is garbled — unique oracle/judgment anchors. */
const HEX_FALLBACK_ANCHORS = {
  7: /Sze indicates how, in the case which it supposes,\s*with firmness and correctness/i,
  10: /[L][tu]\s+suggests the idea of[^.]{0,120}treading on the tail of a tiger/i,
  12: /In P(?:hî|ht|î|i) there is the want of good understanding/i,
  16: /Yü indicates that,\s*\(in the state which it implies\)/i,
  25: /Wa Wang indicates great progress and success/i,
  26: /Under the conditions of[\s\S]{0,40}?it will be advantageous to be firm and correct/i,
  27: /(?:Î|I|f)\s+indicates that with firm correctness/i,
  33: /Thun indicates successful progress \(in its circumstances\)\. To a small extent/i,
  40: /In \(the state indicated by\) Kieh advantage will be found/i,
  43: /Kwai requires \(in him who would fulfil its meaning\)/i,
  45: /In \(the state denoted by\) (?:3?hui|Žhui), the king will[\s\S]{0,24}repair to his ancestral temple/i,
  48: /\(Looking at\)[\s\S]{0,100}?town may be changed/i,
  50: /Ding gives the intimation of great progress and success/i,
  51: /Kăn gives the intimation of ease and development/i,
  53: /K(?:h)?ien suggests to us the marriage of a young/i,
  57: /Sun intimates that \(under the conditions which/i,
  61: /\bKung F\w*\s*\(moves even\)[^.]{0,60}pigs and fish/i,
  35: /In Žin we see a prince who secures the tranquillity/i,
  52: /When one['’]s resting is like that of the back/i,
  62: /Hsiâo Kwo indicates that \(in the circumstances/i,
};

function isLeggeOcrNoiseLine(line) {
  const t = String(line).trim();
  if (!t) return true;
  if (/^SECT\.\s+[IVXLCDM]+\.\s+THE\s+/i.test(t)) return true;
  if (/^(?:as ae|as bee|as Deel|as nae|e nae|Ct|Ce\}|fel Dl|ma\. es|Eee|ee)$/i.test(t)) return true;
  if (/^[—\-_|\\\/=\s]{2,}$/.test(t)) return true;
  if (/^page[_\s]?\d+/i.test(t)) return true;
  return false;
}

function stripLeggeSectionNoise(text) {
  return String(text)
    .split(/\r?\n/)
    .filter((line) => !isLeggeOcrNoiseLine(line))
    .join("\n");
}

function isCommentaryJudgment(text) {
  return (
    /Referring to Appendixes|conduct of military expeditions|is denoted by the hexagram/i.test(
      text,
    ) ||
    /The character giving its name|nomenclature of first nine|universally acquiesced in/i.test(
      text,
    ) ||
    /^Line \d+ is (?:weak|strong)/i.test(text) ||
    /^Line \d+, though (?:weak|strong)/i.test(text) ||
    /That the subject of the line|further proof of his humility|to be very small/i.test(text) ||
    /But what suggests the statement|^P\. Regis says|^The strong line \d+/i.test(text) ||
    /^All men love and honour humility/i.test(text)
  );
}

function isValidLeggeJudgment(text) {
  const t = String(text).trim();
  if (t.length < 20) return false;
  if (isCommentaryJudgment(t)) return false;
  return (
    LEGGE_ORACLE_START.test(t) ||
    /\bindicates (?:that|how)|intimates (?:that|how)|suggests the idea|\(represents\)|gives the intimation/i.test(
      t,
    )
  );
}

const MULTI_SENTENCE_JUDGMENT_MARKERS =
  /In \(the state indicated by\)|\(L[îiü]?\s+suggests the idea of\)|Kien suggests to us the marriage|In Th(?:ai|âi|4i)\s*\(we see\)/i;

function pickLeggeJudgment(sectionText, parsedJudgment) {
  const candidates = [
    extractOcrJudgmentFallback(sectionText),
    reconstructLeggeJudgment(sectionText),
    stripLeggeJudgmentNoise(parsedJudgment ?? ""),
  ];
  for (const c of candidates) {
    const cleaned = stripLeggeJudgmentNoise(c);
    if (isValidLeggeJudgment(cleaned)) return cleaned;
  }
  const fallback = candidates.map((c) => stripLeggeJudgmentNoise(c)).find((c) => c.length > 15);
  return fallback ?? "";
}

const LEGGE_ORACLE_START =
  /\b(?:Under the conditions of[\s\S]{0,80}?it will be advantageous|In\s+\(the state denoted by\)[\s\S]{0,60}?will[\s\S]{0,20}?repair|In\s+[A-Za-zăâîûêô''\-]{2,16}|In\s+P(?:hî|ht|î|i)\s+there is|\(What takes place as indicated by\)|(?:\([^)]{1,40}\)\s*)?[A-Z][A-Za-zăâîûêô''\-\s]{0,20})\s*(?:there is|indicates|intimates|suggests|shows|appears|\(represents\))/i;

/** Trim OCR junk before the oracle name + verb. */
function stripLeggeJudgmentNoise(text) {
  let s = String(text).replace(/\s+/g, " ").trim();
  if (!s) return "";
  const start = s.search(LEGGE_ORACLE_START);
  if (start > 0) s = s.slice(start);
  s = s.replace(/^[^A-Z(InUnder\(What]+/, "").trim();
  s = s.replace(/^(?:e nae|as nae)\s+/i, "").trim();
  s = s.replace(/^(?:[a-z]\s+|[a-z]{1,2}\s+|[=\-—_|\\\/\s]){2,}/i, "").trim();
  s = s.replace(/\bThe symbolism of paragraph\b[\s\S]*$/i, "").trim();
  s = s.replace(/\bis the hexagram of\b[\s\S]*$/i, "").trim();
  s = s.replace(/\s+(?:paragraph \d+|SECT\.\s+[IVXLCDM]+)[^.]*$/i, "").trim();
  s = s.replace(/\\[a-z]\s+/gi, " ").replace(/\s+/g, " ").trim();
  return s;
}

function reconstructLeggeJudgment(sectionText) {
  const flat = stripLeggeSectionNoise(joinLeggeOcrHyphenation(sectionText))
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const thaiLead = flat.match(/\bIn Th(?:ai|âi)\s*\(we see\)[^.]+\./i);
  const thaiTail = flat.match(/\(It indicates that\)[^.]+\./i);
  if (thaiLead && thaiTail) {
    return stripLeggeJudgmentNoise(`${thaiLead[0]} ${thaiTail[0]}`);
  }
  const startM = flat.match(LEGGE_ORACLE_START);
  if (!startM || startM.index == null) return "";
  const from = startM.index;
  const line1 = flat.search(/\b1\.\s+The (?:first|second|third|fourth|fifth|topmost|sixth)/i);
  const chunk = line1 > from ? flat.slice(from, line1) : flat.slice(from, from + 700);
  let body = chunk
    .replace(/\bLine \d+ is (?:weak|strong)[^.]*\./gi, " ")
    .replace(/\bThat the subject of the line[^.]*\./gi, " ")
    .replace(/\bReferring to Appendixes[^.]*\./gi, " ")
    .replace(/\bis denoted by the hexagram[^.]*\./gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (
    /\(a leader of\) age\s*$/i.test(body) ||
    /with firmness and correctness, and \(a leader of\) age\s*$/i.test(body)
  ) {
    const tail = chunk.match(
      /(?:and experience,?\s*)?(?:t)?here will be good fortune and no error\.?/i,
    );
    if (tail) {
      body = body.replace(/\s+(and\s*)?\(a leader of\)\s*age[^.]*$/i, "");
      body = `${body}, and (a leader of) age and experience, there will be good fortune and no error.`;
    }
  }
  const sentences = body.match(/[^.]+\./g);
  if (!sentences?.length) return stripLeggeJudgmentNoise(body);
  const kept = [];
  for (const sent of sentences) {
    const t = sent.trim();
    if (/^Line \d+/i.test(t)) break;
    if (/That the subject of the line|Its subject therefore|further proof of his humility/i.test(t)) {
      break;
    }
    kept.push(t);
    if (
      !MULTI_SENTENCE_JUDGMENT_MARKERS.test(body) &&
      kept.join(" ").length > 80 &&
      /\.\s*$/.test(sent) &&
      !/with firmness and correctness, and \(a leader of\) age\s*\.?$/i.test(t)
    ) {
      break;
    }
  }
  let out = stripLeggeJudgmentNoise(kept.join(" ").trim());
  if (
    /to be very small|That the subject of the line/i.test(out) ||
    (/with firmness and correctness, and \(a leader of\) age/i.test(out) && !/experience/i.test(out))
  ) {
    const startOnly = out.match(
      /Sze indicates how, in the case which it supposes, with firmness and correctness, and \(a leader of\) age/i,
    );
    const tail = chunk.match(
      /(?:and experience,?\s*)?(?:t)?here will be good fortune and no error\.?/i,
    );
    if (startOnly && tail) {
      out = `${startOnly[0]}, and experience, there will be good fortune and no error.`;
    }
  }
  return out;
}

function stripLeggeImageNoise(text) {
  let body = String(text).replace(/\s+/g, " ").trim();
  const cuts = [
    /\b1\.\s+[‘'"]/,
    /\bIt will be advantageous to use punishment\b/,
    /\bThe (?:first|second|third|fourth|fifth|sixth) line,/i,
    /\bExplanation of/i,
  ];
  for (const re of cuts) {
    const idx = body.search(re);
    if (idx >= 40) body = body.slice(0, idx).trim();
  }
  body = body.replace(/\s+\.\s*$/, ".").trim();
  return body;
}

function scoreLeggeHexCandidate(fullText, index, number) {
  const slice = fullText.slice(index, index + 1200);
  const head = slice.slice(0, 800);
  let score = 0;
  if (/Explanation of the entire figure by king W/i.test(slice)) score += 25;
  if (/\(represents\)|indicates that|indicates how|intimates how|intimates that|shows that/i.test(head)) {
    score += 15;
  }
  if (
    /want of good understanding|treading on the tail of a tiger|regulation of the family|realisation of what is taught|seeking to nourish/i.test(
      head,
    )
  ) {
    score += 14;
  }
  if (/Explanation of the separate lines by the duke/i.test(slice)) score += 8;
  const hasOracle =
    /\(represents\)|indicates how|indicates that|indicates great progress|intimates how|intimates that|gives the intimation|\(moves even\)/i.test(
      head,
    );
  if (hasOracle) score += 10;
  if (/The\s+\S+\s+(?:Hexagram|HEXAGRAY|HExaGRaM)/i.test(fullText.slice(index, index + 120))) {
    score += 12;
  }
  if (/SECT\.\s+I\.\s+THE\s+[A-Z\s]+HEXAGRAM/i.test(fullText.slice(Math.max(0, index - 80), index + 40))) {
    score += 18;
  }
  if (/conduct of military expeditions|Referring to Appendixes|is denoted by the hexagram/i.test(head)) {
    score -= 65;
  }
  if (/which gives its name to this hexagram|81nc Hexagram/i.test(head)) {
    score -= 55;
  }
  if (/^The (?:first|second|third|fourth|fifth|sixth|topmost) line,/i.test(head.trim())) {
    score -= 45;
  }
  if (!hasOracle) {
    if (/The character giving its name|The character \w+ is the symbol/i.test(head)) score -= 30;
    if (/^The subject of this hexagram/m.test(head)) score -= 25;
    if (/is the hexagram of|name of this hexagram|the name of the hexagram|is the hexagram denoted/i.test(head)) {
      score -= 50;
    }
  }
  if (/paragraph \d/i.test(head)) score -= 15;
  const appendixIdx = fullText.indexOf("THE APPENDIXES");
  if (appendixIdx >= 0 && index > appendixIdx) score -= 40;
  return score;
}

/**
 * @param {string} fullText
 */
function findSequentialHeader(text, n, searchFrom) {
  const maxWindow = 18_000;
  const romans = new Set([romanNumeral(n).toUpperCase()]);
  if (ROMAN_OCR_OVERRIDES[n]) {
    for (const r of ROMAN_OCR_OVERRIDES[n]) romans.add(r);
  }

  /** @type {{ index: number; score: number; label: string } | null} */
  let best = null;

  if (n === 10) {
    const reLu = /(\bX\b|\b10\b)\.\s*[\s\S]{0,200}?(?:Hexacra|Hexagram)/gi;
    reLu.lastIndex = searchFrom;
    let m;
    while ((m = reLu.exec(text)) !== null) {
      if (m.index - searchFrom > maxWindow) break;
      const tail = text.slice(m.index, m.index + 500);
      if (!/tiger|treading on the tail|Lt Hex/i.test(tail)) continue;
      const score = scoreLeggeHexCandidate(text, m.index, n) + 10;
      if (!best || score > best.score) {
        best = { index: m.index, score, label: m[0].trim().slice(0, 100) };
      }
    }
  }

  for (const roman of romans) {
    const escaped = roman.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const headerRe = new RegExp(
      `(${escaped})[.,]\\s*(?:THE\\s+)?[\\s\\S]{0,160}?${HEXAGRAM_HEADER_WORD}`,
      "gi",
    );
    headerRe.lastIndex = searchFrom;
    let m;
    while ((m = headerRe.exec(text)) !== null) {
      if (m.index - searchFrom > maxWindow) break;
      const score = scoreLeggeHexCandidate(text, m.index, n) + 5;
      if (
        !best ||
        score > best.score ||
        (score === best.score && m.index < best.index)
      ) {
        best = { index: m.index, score, label: m[0].trim().slice(0, 100) };
      }
    }
  }

  if (n <= 16) {
    const reNum = new RegExp(
      `(\\b${n})[.,]\\s*(?:THE\\s+)?[\\s\\S]{0,160}?${HEXAGRAM_HEADER_WORD}`,
      "gi",
    );
    reNum.lastIndex = searchFrom;
    let m;
    while ((m = reNum.exec(text)) !== null) {
      if (m.index - searchFrom > maxWindow) break;
      const score = scoreLeggeHexCandidate(text, m.index, n) + 5;
      if (!best || score > best.score) {
        best = { index: m.index, score, label: m[0].trim().slice(0, 100) };
      }
    }
  }

  const fallback = HEX_FALLBACK_ANCHORS[n];
  if (fallback) {
    const slice = text.slice(searchFrom, searchFrom + maxWindow);
    const m = fallback.exec(slice);
    if (m) {
      const score = scoreLeggeHexCandidate(text, searchFrom + m.index, n) + 20;
      if (!best || score > best.score) {
        best = { index: searchFrom + m.index, score, label: m[0].trim().slice(0, 100) };
      }
    }
  }

  return best;
}

function isCommentaryBoundarySlice(slice) {
  return (
    /is the hexagram of the sixth month|name of this hexagram, may be represented|is the hexagram denoted to king|conduct of military expeditions|Referring to Appendixes|paragraph \d is suggested|ordinarily used in the sense of|denotes collecting together, or things so collected|look at what we are seeking to nourish, and by the|which gives its name to this hexagram|The character giving its name to the hex/i.test(
      slice.slice(0, 350),
    ) ||
    /^(?:The (?:first|second|third|fourth|fifth|sixth|topmost) line|[L][tu] treading on the tail)/i.test(
      slice.trim().slice(0, 80),
    )
  );
}

function snapLeggeBoundaryToOracle(searchText, h, prevIdx, nextIdx) {
  const head = searchText.slice(h.index, Math.min(h.index + 600, nextIdx));
  if (
    /^(?:[IVXLCDM]+|\d{1,2})[.,]\s*(?:THE\s+)?[^\n]{0,40}(?:Hexagram|HEXAGRAM|Hexacram)/i.test(
      head.trim(),
    ) &&
    LEGGE_ORACLE_START.test(head)
  ) {
    return;
  }

  const anchor = HEX_FALLBACK_ANCHORS[h.number];
  if (!anchor) return;
  const region = searchText.slice(prevIdx, nextIdx);
  let bestIndex = -1;
  let bestLabel = "";
  let m;
  const re = new RegExp(anchor.source, anchor.flags + (anchor.flags.includes("g") ? "" : "g"));
  while ((m = re.exec(region)) !== null) {
    const abs = prevIdx + m.index;
    const before = region.slice(Math.max(0, m.index - 160), m.index);
    const headerM = before.match(
      /(?:[IVXLCDM]+|\d{1,2})[.,]\s*(?:THE\s+)?[^\n]{0,50}(?:Hexagram|HEXAGRAM|Hexacram)/i,
    );
    const candidate = headerM
      ? prevIdx + m.index - (before.length - before.indexOf(headerM[0]))
      : abs;
    if (bestIndex < 0 || candidate < bestIndex) {
      bestIndex = candidate;
      bestLabel = (headerM?.[0] ?? m[0]).trim().slice(0, 100);
    }
  }
  if (bestIndex >= 0 && bestIndex <= h.index) {
    h.index = bestIndex;
    h.label = bestLabel;
  }
}

function refineLeggeBoundaries(searchText, chosen) {
  const sorted = [...chosen].sort((a, b) => a.index - b.index);
  for (let i = 0; i < sorted.length; i++) {
    const h = sorted[i];
    const prevIdx = sorted[i - 1]?.index ?? 0;
    const nextIdx = sorted[i + 1]?.index ?? searchText.length;
    const headSlice = searchText.slice(h.index, Math.min(h.index + 400, nextIdx));
    if (!isCommentaryBoundarySlice(headSlice)) continue;
    const anchor = HEX_FALLBACK_ANCHORS[h.number];
    if (!anchor) continue;
    // Oracle text often precedes the appendix commentary header in SBE OCR order.
    const region = searchText.slice(prevIdx, nextIdx);
    const m = anchor.exec(region);
    if (m) {
      h.index = prevIdx + m.index;
      h.label = m[0].trim().slice(0, 100);
    }
    snapLeggeBoundaryToOracle(searchText, h, prevIdx, nextIdx);
  }
  for (let i = 0; i < sorted.length; i++) {
    const h = sorted[i];
    const prevIdx = sorted[i - 1]?.index ?? 0;
    const nextIdx = sorted[i + 1]?.index ?? searchText.length;
    snapLeggeBoundaryToOracle(searchText, h, prevIdx, nextIdx);
  }
  return sorted.sort((a, b) => a.index - b.index);
}

/**
 * @param {string} fullText
 */
export function findLeggeHexBoundaries(fullText) {
  const appendixIdx = fullText.indexOf("THE APPENDIXES");
  const searchText = appendixIdx >= 0 ? fullText.slice(0, appendixIdx) : fullText;

  /** @type {{ number: number; index: number; label: string }[]} */
  const chosen = [];
  let searchFrom = 0;

  for (let n = 1; n <= 64; n++) {
    const hit = findSequentialHeader(searchText, n, searchFrom);
    if (!hit || hit.score < -5) continue;
    chosen.push({ number: n, index: hit.index, label: hit.label });
    searchFrom = hit.index + 20;
  }

  for (let n = 1; n <= 64; n++) {
    if (chosen.some((c) => c.number === n)) continue;
    const prev = chosen.filter((c) => c.number < n).sort((a, b) => b.number - a.number)[0];
    const from = prev ? prev.index + 20 : 0;
    const anchor = HEX_FALLBACK_ANCHORS[n];
    if (!anchor) continue;
    const m = anchor.exec(searchText.slice(from));
    if (m) {
      chosen.push({
        number: n,
        index: from + m.index,
        label: m[0].trim().slice(0, 100),
      });
    }
  }

  chosen.sort((a, b) => a.index - b.index);
  return refineLeggeBoundaries(searchText, chosen);
}

function extractOcrJudgmentFallback(sectionText) {
  const flat = stripLeggeSectionNoise(joinLeggeOcrHyphenation(sectionText))
    .replace(/\s+/g, " ")
    .trim();
  const patterns = [
    /\(\s*L[îiü]?\s+suggests the idea of[^.]+\.\s*There will be progress and success\./i,
    /\bIn \(the state indicated by\) K(?:h)?ien advantage[^.]+\.\s*It will be advantageous[^.]+\.\s*\(In these circumstances\)[^.]+\./i,
    /\bKien suggests to us the marriage[^.]+\.\s*There will be advantage[^.]+\./i,
    /\bIn Th(?:ai|âi|4i)\s*\(we see\)[^.]+\.\s*\(It indicates that\)[^.]+\./i,
    /\b(?:L[tü]|Lu)\s+suggests the idea of[^.]+\./i,
    /\bY(?:ü|ii)\s+indicates that,[^.]+\./i,
    /\bPo indicates that[^.]+\./i,
    /\bIn Th(?:ai|âi)\s*\(we see\)[^.]+\.\s*\(It indicates that\)[^.]+\./i,
    /\bUnder the conditions of[\s\S]{0,120}?it will be advantageous[^.]+\./i,
    /\bIn \(the state denoted by\)[\s\S]{0,120}?repair[^.]+\./i,
    /\b\(Looking at\)[\s\S]{0,120}?wells undergoes no change[^.]+\./i,
    /\bSze indicates how, in the case which it supposes,[^.]+\./i,
    /\bThun indicates successful progress \(in its circumstances\)\. To a small extent[^.]+\./i,
    /\bWa Wang indicates great progress and success[^.]+\./i,
    /\bIn Žin we see a prince[^.]+\./i,
    /\bWhen one['’]s resting is like that of the back[^.]+\./i,
    /\bHsiâo Kwo indicates that \(in the circumstances[^.]+\./i,
    /\bKung F\w*\s*\(moves even\)[^.]{0,80}pigs and fish[^.]+\./i,
    /\b(?:Khien|Khw[aâ]n|Sze|Pi|Pî|Phî|Yü|Kieh|Ding|Kăn|Sun|Lü|Lii|Xien|Sung|Mang|Hsii|Kun|Thai|Po|Fu|Shih|Ta|Kwan)\b[^.]{0,80}(?:\(represents\)|indicates how|indicates that|intimates how|intimates that|gives the intimation|\(moves even\))[^.]+\./i,
    /\(Looking at\)[^.]+\./i,
    /In \(the state indicated by\)[^.]+\./i,
    /\(It indicates that\)[^.]+\./i,
  ];
  for (const re of patterns) {
    const m = flat.match(re);
    if (m?.[0] && m[0].length > 30 && !isCommentaryJudgment(m[0])) return stripLeggeJudgmentNoise(m[0]);
  }
  return "";
}

function repairLeggeLineBody(body) {
  return String(body)
    .replace(/\(we\s*\r?\n\s*nde dt 7% "?See/gi, "(we see")
    .replace(/\(we\s*\nde dt 7% "?See/gi, "(we see")
    .replace(/\(we see its subject as\)\s*the/gi, "(we see its subject as) the")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLeggeLinePrefix(body) {
  let out = String(body).trim();
  out = out.replace(/^\s*(?:[_~\-:\\.]+\s*)*\d+[.\-_~\s]+/, "");
  out = out.replace(/^The\s+[''`]+/i, "The ");
  if (!/^In the /i.test(out) && /^the sixth \(or topmost\) line,/i.test(out)) {
    out = `In the ${out}`;
  } else if (!/^In the /i.test(out) && /^sixth \(or topmost\) line,/i.test(out)) {
    out = `In the ${out}`;
  } else if (!/^The /i.test(out) && !/^In the /i.test(out)) {
    if (/^['']?(?:first|second|third|fourth|fifth|sixth) line,/i.test(out)) {
      out = `The ${out.replace(/^['']+/, "")}`;
    }
  }
  return out.replace(/^In the the /i, "In the ").replace(/(\w)\(/g, "$1 (").replace(/\s+/g, " ").trim();
}

function hasLineBleed(body) {
  return /THE Y[^\n]{0,24}KING|Line \d+ is (?:weak|strong)|Explanation of the separate lines|Two explanations have been proposed|Geer or EI Ok Miah|with him, and head of some branch|What is said on line \d+/i.test(
    body,
  );
}

function trimLineBody(body) {
  let out = repairLeggeLineBody(body);
  const innerSix = out.search(/\b(?:In the sixth \(or topmost\)|the sixth \(or topmost\)) line,/i);
  if (innerSix >= 28) out = out.slice(0, innerSix).trim();
  const cut = out.search(
    /\(\d+\]\s*[A-Z0-9]+\s+THE Y|THE Y[^\n]{0,24}KING\. TEXT|Line \d+ is (?:weak|strong)|SECT\.\s+[IVXLCDM]+\.|Explanation of the separate lines|Two explanations have been proposed|Geer or EI Ok Miah|with him, and head of some branch|What is said on line \d+/i,
  );
  if (cut >= 24) out = out.slice(0, cut).trim();
  if (!/[.?!]$/.test(out) && out.length > 40) {
    const lastPeriod = out.lastIndexOf(".");
    if (lastPeriod >= 40) out = out.slice(0, lastPeriod + 1);
  }
  return out.trim();
}

function splitEmbeddedLines(lineByPos) {
  /** @type {Record<number, string>} */
  const out = { ...lineByPos };
  for (const [posRaw, body] of Object.entries(lineByPos)) {
    const pos = Number(posRaw);
    const m6 = body.match(
      /\b(?:In the sixth \(or topmost\)|the sixth \(or topmost\)) line, undivided,[\s\S]{0,360}?dragon exceeding the proper\s+limits\s*\./i,
    );
    if (m6 && !out[6]) {
      out[6] = trimLineBody(m6[0]);
      out[pos] = trimLineBody(body.slice(0, m6.index ?? 0));
    }
  }
  return out;
}

function truncateLeggeSectionBody(text) {
  const cut = text.search(
    /\n(?:Line \d+ is (?:weak|strong)|SECT\.\s+[IVXLCDM]+\.|THE Y[^\n]{0,20}KING\. TEXT|\n[IVXLCDM]{2,}\.\s+The character giving its name|\nExplanation of the separate lines by the duke of)/i,
  );
  if (cut < 120) return text;
  const afterCut = text.slice(cut);
  const lineAfterCut = afterCut.search(
    /\n\s*[^.\n]{0,14}?[1-6][.\-_~]+\s*(?:The|In the )?\s*['']?(?:first|second|third|fourth|fifth|sixth) line,/i,
  );
  if (lineAfterCut >= 0) return text;
  return text.slice(0, cut);
}

/** @param {number} pos @param {string} ordinal */
function leggeLineStartRe(pos, ordinal) {
  return new RegExp(
    `(?:^|\\n)[^\\n]{0,14}?(?:${pos}[.\\-_~\\s]+)?(?:(?:In the )?[Tt]?he ['']?${ordinal}|['']?${ordinal}) line,`,
    "gim",
  );
}

function stitchIncompleteLeggeLines(rawText, lineByPos) {
  const normalized = String(rawText).replace(/\r\n/g, "\n");
  const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth"];

  for (let pos = 1; pos <= 6; pos++) {
    if (lineByPos[pos]) continue;
    const ord = ordinals[pos - 1];
    const re = new RegExp(
      `(?:^|\\n)[^\\n]{0,14}?${pos}[.\\-_~\\s]*The ${ord} line,[\\s\\S]{0,560}?\\.`,
      "im",
    );
    let m = normalized.match(re);
    if (!m) {
      const reBare = new RegExp(`(?:^|\\n)[^\\n]{0,6}?${ord} line, [\\s\\S]{0,560}?\\.`, "im");
      m = normalized.match(reBare);
    }
    if (!m) continue;
    const chunk = trimLineBody(m[0].replace(/^[^\S\n]*\n?/, "").trim());
    if (chunk.length > 24 && !hasLineBleed(chunk)) {
      lineByPos[pos] = normalizeLeggeLinePrefix(chunk);
    }
  }

  if (
    lineByPos[5] &&
    /\(to its\s/i.test(lineByPos[5]) &&
    !/\(to its subject\)/i.test(lineByPos[5])
  ) {
    const tail = normalized.match(
      /subject\)\.\s*All occasion for repentance will disappear[\s\S]{0,420}?good fortu[^.\n]*\./i,
    );
    if (tail) {
      const head = lineByPos[5].replace(/\(to its[\s\S]*/i, "").trim();
      lineByPos[5] = normalizeLeggeLinePrefix(`${head}(to its ${tail[0]}`);
    }
  }
}

/** Direct OCR line scan — more robust than HTML tokenization for SBE scan. */
function extractLeggeSbeLines(sectionText) {
  const raw = stripLeggeSectionNoise(joinLeggeOcrHyphenation(sectionText)).replace(/\r\n/g, "\n");
  const text = truncateLeggeSectionBody(raw);
  /** @type {Record<number, string>} */
  const lineByPos = {};
  let supernumerary = "";

  /** @type {{ pos: number; start: number }[]} */
  const hits = [];
  const specs = [
    [
      1,
      /(?:^|\n)[^\n]{0,14}?(?:1[.\-_~\s]+)?(?:(?:In the )?[Ff]?irst \(or lowest\)|(?:In the )?[Tt]?he ['']?first|['']?first) line,/gim,
    ],
    [2, leggeLineStartRe(2, "second")],
    [3, leggeLineStartRe(3, "third")],
    [4, leggeLineStartRe(4, "fourth")],
    [5, leggeLineStartRe(5, "fifth")],
    [
      6,
      /(?:^|\n)[^\n]{0,14}?(?:6[.\-_~\s]+)?(?:(?:In the )?[Tt]?he sixth \(or topmost\)|sixth \(or topmost\)|In the topmost|The topmost|The sixth|sixth six,) line,/gim,
    ],
  ];

  for (const [pos, re] of specs) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m) hits.push({ pos, start: m.index });
  }

  hits.sort((a, b) => a.start - b.start);
  for (let i = 0; i < hits.length; i++) {
    const { pos, start } = hits[i];
    const end = hits[i + 1]?.start ?? text.length;
    let chunk = text.slice(start, end).trim();
    chunk = trimLineBody(chunk.replace(/\n+/g, " "));
    if (chunk.length > 18) lineByPos[pos] = normalizeLeggeLinePrefix(chunk);
  }

  if (!lineByPos[6]) {
    const repaired = repairLeggeLineBody(text.replace(/\r\n/g, "\n"));
    const m6 = repaired.match(
      /(?:sixth \(or topmost\)|O10 the sixth \(or topmost\)) line, undivided,[\s\S]{0,360}?dragon exceeding the proper\s+limits\s*\.(?:\s*There will be occasion for repentance\.)?/i,
    );
    if (m6) lineByPos[6] = normalizeLeggeLinePrefix(trimLineBody(m6[0].replace(/^O10\s*/, "")));
  }

  const supM = text.match(
    /(?:^|\n)\s*(?:7|S)\.\s*((?:\(The lines of this hexagram)[\s\S]{0,800}?good fortune\.)/i,
  );
  if (supM?.[1]) supernumerary = trimLineBody(supM[1]);

  const numberedRe =
    /(?:^|\n)\s*[^\n]{0,8}?([1-6])[\.\-_~]\s+([^\n]+(?:\n(?!\s*[^\n]{0,8}?[1-7][.\-_~]\s)[^\n]+)*)/gim;
  let nm;
  while ((nm = numberedRe.exec(text)) !== null) {
    const pos = Number(nm[1]);
    if (lineByPos[pos]) continue;
    const chunk = trimLineBody(nm[2].replace(/\n+/g, " "));
    if (
      chunk.length > 24 &&
      chunk.length < 520 &&
      /^(?:The|In the|From the|Inthe|[2-6]?(?:first|second|third|fourth|fifth|sixth) line,)/i.test(
        chunk,
      ) &&
      !/^Explanation of/i.test(chunk) &&
      !hasLineBleed(chunk)
    ) {
      lineByPos[pos] = normalizeLeggeLinePrefix(
        chunk.replace(/^Inthe\b/i, "In the").replace(/^(second|third|fourth|fifth|sixth) line,/i, "The $1 line,"),
      );
    }
  }

  stitchIncompleteLeggeLines(raw, lineByPos);

  const mergedLines = splitEmbeddedLines(lineByPos);
  return { lineByPos: mergedLines, supernumerary };
}

function mergeLeggeLineMaps(primary, secondary) {
  const out = { ...primary };
  for (const [pos, body] of Object.entries(secondary)) {
    const p = Number(pos);
    const cur = out[p] ?? "";
    const clean = hasLineBleed(body) ? trimLineBody(body) : body;
    if (!cur) {
      if (clean.length > 18) out[p] = clean;
      continue;
    }
    if (hasLineBleed(cur) && !hasLineBleed(clean)) out[p] = clean;
    else if (!hasLineBleed(clean) && clean.length > cur.length + 8 && clean.length < 480) {
      out[p] = clean;
    }
  }
  return splitEmbeddedLines(out);
}

/**
 * @param {string} sectionText
 */
export function parseLeggeSbeTextSection(sectionText) {
  const merged = stripLeggeSectionNoise(joinLeggeOcrHyphenation(sectionText));
  const html = plainToLeggeHtml(merged);
  const parsed = parseLeggeTextPage(html);
  const ocrLines = extractLeggeSbeLines(merged);
  parsed.lineByPos = mergeLeggeLineMaps(parsed.lineByPos ?? {}, ocrLines.lineByPos);
  if (!parsed.supernumerary?.trim() && ocrLines.supernumerary) {
    parsed.supernumerary = ocrLines.supernumerary;
  }
  parsed.judgment = repairLeggeSbeOcrText(pickLeggeJudgment(merged, parsed.judgment ?? ""));
  for (const [pos, body] of Object.entries(parsed.lineByPos ?? {})) {
    parsed.lineByPos[Number(pos)] = repairLeggeSbeOcrText(body);
  }
  if (parsed.supernumerary) parsed.supernumerary = repairLeggeSbeOcrText(parsed.supernumerary);
  return parsed;
}

/**
 * Great Symbolism (Appendix II §I) from OCR plain text.
 * @param {string} text
 * @returns {Record<number, string>}
 */
export function parseLeggeSbeSymbolism(text) {
  const out = {};
  const cleaned = repairLeggeSbeOcrText(text)
    .replace(/APPENDIX II[\s\S]*?Section I,?/i, "")
    .trim();
  for (let n = 1; n <= 64; n++) {
    const pat = romanPattern(n);
    const nextBoundary =
      n < 64
        ? `(?:^|[\\n\\f])\\s*(?:${romanPattern(n + 1)}|[XLIVCDM]+|\\d{1,2})\\.\\s`
        : "$^";
    const startRe = new RegExp(
      `(?:^|[\\n\\f])\\s*(${pat})\\.\\s*([\\s\\S]*?)(?=${nextBoundary}|$)`,
      "i",
    );
    const m = startRe.exec(cleaned);
    if (!m) continue;
    let body = m[2]
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const lineCut = body.search(/\b1\.\s+[‘'"]/);
    if (lineCut >= 0) body = body.slice(0, lineCut).trim();
    body = body.replace(/^[IVXLCDM]+\.\s*/i, "").trim();
    if (!body || /^\d+\.\s/.test(body)) continue;
    if (/^The (first|second|third|fourth|fifth|sixth|topmost) line/i.test(body)) continue;
    if (/^The lines of this hexagram/i.test(body)) continue;
    out[n] = stripLeggeImageNoise(body);
  }
  return out;
}

/**
 * @param {{ bodyText: string; symbolismText: string; epubByHex?: Record<number, object> }} input
 */
export function parseAllLeggeSbePdfFromText(input) {
  const boundaries = findLeggeHexBoundaries(input.bodyText);
  if (boundaries.length < 60) {
    throw new Error(
      `Legge SBE PDF: only ${boundaries.length}/64 hex boundaries found in OCR text`,
    );
  }
  const imageByHex = parseLeggeSbeSymbolism(input.symbolismText);
  /** @type {Record<number, { judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }>} */
  const out = {};

  for (let i = 0; i < boundaries.length; i++) {
    const h = boundaries[i];
    const next = boundaries[i + 1];
    const slice = input.bodyText.slice(h.index, next?.index ?? input.bodyText.length);
    const parsed = parseLeggeSbeTextSection(slice);
    let row = {
      judgment: parsed.judgment ?? "",
      image: repairLeggeSbeOcrText(imageByHex[h.number] ?? ""),
      lines: parsed.lineByPos ?? {},
    };
    if (h.number === 1 && parsed.supernumerary) row.yongJiu = parsed.supernumerary;
    if (h.number === 2 && parsed.supernumerary) row.yongLiu = parsed.supernumerary;
    const epubRow = input.epubByHex?.[h.number];
    if (epubRow) {
      row = applyEpubGuideToLeggeRow(row, epubRow, slice, input.symbolismText);
    }
    out[h.number] = finalizeLeggeSbeRow(row);
  }

  const missingHex = [];
  const missingJudgment = [];
  const missingImage = [];
  for (let n = 1; n <= 64; n++) {
    if (!out[n]) missingHex.push(n);
    else {
      if (!out[n].judgment?.trim()) missingJudgment.push(n);
      if (!out[n].image?.trim()) missingImage.push(n);
    }
  }
  if (missingHex.length) {
    throw new Error(`Legge SBE PDF: missing hex: ${missingHex.join(", ")}`);
  }
  if (missingJudgment.length) {
    throw new Error(`Legge SBE PDF: missing judgment for hex: ${missingJudgment.join(", ")}`);
  }
  if (missingImage.length) {
    throw new Error(`Legge SBE PDF: missing Great Symbolism for hex: ${missingImage.join(", ")}`);
  }
  return applyLeggeSbeBookPrimaryPatches(out);
}

/**
 * @param {{ force?: boolean; epubGuide?: boolean; onProgress?: (msg: string) => void }} [opts]
 */
export async function parseAllLeggeSbePdfOrThrow(opts = {}) {
  const { bodyText, symbolismText } = await loadLeggeSbePdfFullText(opts);
  const useEpubGuide = opts.epubGuide !== false;
  /** @type {Record<number, object> | undefined} */
  let epubByHex;
  if (useEpubGuide) {
    try {
      opts.onProgress?.("Loading Legge EPUB cross-check guide (repair-only, book-primary)…");
      epubByHex = await parseAllLeggeEpubOrThrow();
    } catch (err) {
      opts.onProgress?.(`EPUB guide unavailable (${err.message}); PDF OCR only.`);
    }
  }
  return parseAllLeggeSbePdfFromText({ bodyText, symbolismText, epubByHex });
}

export { parseRomanNumeralLoose };
