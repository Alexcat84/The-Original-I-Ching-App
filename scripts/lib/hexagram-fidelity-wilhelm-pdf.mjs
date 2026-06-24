/**
 * Parse Wilhelm/Baynes oracle fields from pdftotext -layout output.
 * Oracle-only: judgment stanza, image verse, changing lines (no Wilhelm commentary).
 */

import {
  WILHELM_ORACLE_COMMENTARY_START,
  WILHELM_LINE_COMMENTARY_OPENERS,
  repairWilhelmOcrText,
  isWilhelmLineCommentaryLine,
  isWilhelmJudgmentCommentaryLine,
  isWilhelmOracleContinuationLine,
  lineEndsWilhelmOracleStanza,
  lineFollowsWilhelmOracleStanza,
} from "./hexagram-fidelity-wilhelm-ocr.mjs";
import { wilhelmImageOracleOnly } from "./hexagram-fidelity-normalize.mjs";

const HEX_HEADER_PATTERNS = [
  /(?:^|\f|\n)\s*(\d{1,2})[.,]\s+([A-Z0-9][^\n]{0,80}?[-—][^\n]+)/gm,
  /(?:^|\f|\n)\s*(\d{1,2})\.\s*\n(?:[^\n]{0,40}\n)?\s*([A-Z][^\n]{0,80}?[-—][^\n]+)/gm,
];

function sectionHasJudgment(sectionText) {
  return /\bTHE\s+JUDGMEN\w*/i.test(sectionText);
}

function headerScore(sectionSlice) {
  let score = 0;
  if (/\bTHE\s+JUDGMEN\w*/i.test(sectionSlice)) score += 10;
  if (/\bTHE\s+IMAGE\b/i.test(sectionSlice)) score += 5;
  if (/\bTHE\s+LINES\b/i.test(sectionSlice)) score += 5;
  score += Math.min(6, (sectionSlice.match(/means:/gi) ?? []).length);
  return score;
}

function collectHeaderCandidates(fullText) {
  /** @type {{ number: number; index: number; title: string }[]} */
  const all = [];
  for (const re of HEX_HEADER_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(fullText)) !== null) {
      const n = parseInt(m[1], 10);
      if (n < 1 || n > 64) continue;
      all.push({ number: n, index: m.index, title: m[0].trim() });
    }
  }
  all.sort((a, b) => a.index - b.index);

  /** @type {Map<number, { number: number; index: number; title: string; score: number }[]>} */
  const scored = new Map();
  for (const h of all) {
    const nextAny = all.find((x) => x.index > h.index);
    const sliceEnd = nextAny?.index ?? fullText.length;
    const slice = fullText.slice(h.index, Math.min(h.index + 25_000, sliceEnd));
    if (!sectionHasJudgment(slice)) continue;
    const score = headerScore(slice);
    if (score < 15) continue;
    const list = scored.get(h.number) ?? [];
    list.push({ ...h, score });
    scored.set(h.number, list);
  }

  /** @type {Map<number, { number: number; index: number; title: string; score: number }>} */
  const best = new Map();
  for (let n = 1; n <= 64; n++) {
    const cands = scored.get(n);
    if (!cands?.length) continue;
    const maxScore = Math.max(...cands.map((c) => c.score));
    const tier = cands.filter((c) => c.score >= maxScore - 2);
    const nextHigherIdx = Math.min(
      ...[...scored.entries()].flatMap(([num, list]) =>
        num > n ? list.map((c) => c.index) : [],
      ),
      Number.POSITIVE_INFINITY,
    );
    const inSpine = tier.filter((c) => c.index < nextHigherIdx);
    if (Number.isFinite(nextHigherIdx) && inSpine.length === 0) continue;
    const pickFrom = inSpine.length > 0 ? inSpine : tier;
    pickFrom.sort((a, b) => a.index - b.index || b.score - a.score);
    best.set(n, pickFrom[0]);
  }
  return [...best.values()].sort((a, b) => a.index - b.index);
}

function isInlineJudgmentReference(gap, pos) {
  const before = gap.slice(Math.max(0, pos - 140), pos);
  return /said in the judgment|what is said in|thus the line|equivalent to|confirms what is/i.test(
    before,
  );
}

function collectGapJudgmentBlocks(gap) {
  /** @type {{ pos: number; oracle: string }[]} */
  const out = [];
  for (const m of gap.matchAll(/\bTHE\s+JUDGMEN\w*/gi)) {
    const pos = m.index ?? 0;
    if (isInlineJudgmentReference(gap, pos)) continue;
    const after = gap.slice(pos, pos + 900);
    const oracleMatch = after.match(
      /THE\s+JUDGMEN\w*\s*\n+\s*((?:[^\n]+\n+){1,5})/i,
    );
    const oracle = oracleMatch?.[1]?.trim() ?? "";
    if (!oracle) continue;
    if (/^When |^Conditions |^According |^In the calendar/i.test(oracle)) continue;
    if (oracle.length > 360) continue;
    out.push({ pos, oracle });
  }
  return out;
}

function inferHexStartFromGap(gap, prevNumber, targetNumber) {
  const blocks = collectGapJudgmentBlocks(gap);
  const pickIndex = targetNumber - prevNumber;
  const block = blocks[pickIndex];
  if (!block) return null;
  const before = gap.slice(Math.max(0, block.pos - 1200), block.pos);
  const trigramIdx = before.search(/\n\s*above\s+[A-Z]/i);
  const start =
    trigramIdx >= 0
      ? block.pos - (before.length - trigramIdx)
      : Math.max(0, block.pos - 500);
  return start;
}

function gapFillHeaders(fullText, headers) {
  const byNum = new Map(headers.map((h) => [h.number, h]));
  const ordered = [...headers].sort((a, b) => a.index - b.index);

  for (let n = 1; n <= 64; n++) {
    if (byNum.has(n)) continue;

    if (n === 1) {
      const nextH = ordered
        .filter((h) => h.number > 1)
        .reduce((best, h) => (!best || h.number < best.number ? h : best), null);
      if (nextH) {
        const gap = fullText.slice(0, nextH.index);
        const sublimeIdx = gap.search(/THE\s+CREATIVE\s+works\s+sublime\s+success/i);
        if (sublimeIdx >= 0) {
          const before = gap.slice(Math.max(0, sublimeIdx - 1500), sublimeIdx);
          const judgeRel = before.search(/\bTHE\s+JUDGMEN\w*/i);
          const inferred = {
            number: 1,
            index: judgeRel >= 0 ? sublimeIdx - (before.length - judgeRel) : Math.max(0, sublimeIdx - 600),
            title: "(inferred before hex 2 — no OCR header)",
          };
          byNum.set(1, inferred);
          ordered.push(inferred);
          ordered.sort((a, b) => a.index - b.index);
        }
      }
      continue;
    }

    const prevH = ordered
      .filter((h) => h.number < n)
      .reduce((best, h) => (!best || h.number > best.number ? h : best), null);
    const nextH = ordered
      .filter((h) => h.number > n)
      .reduce((best, h) => (!best || h.number < best.number ? h : best), null);
    if (!prevH || !nextH) continue;

    const gapStart = prevH.index;
    const gapEnd = nextH.index;
    if (gapEnd <= gapStart) continue;
    const gap = fullText.slice(gapStart, gapEnd);

    const innerHeaders = collectHeaderCandidates(gap).filter((h) => h.number === n);
    if (innerHeaders.length > 0) {
      const inferred = { ...innerHeaders[0], index: gapStart + innerHeaders[0].index };
      byNum.set(n, inferred);
      ordered.push(inferred);
      ordered.sort((a, b) => a.index - b.index);
      continue;
    }

    const judgmentMatches = [...gap.matchAll(/\bTHE\s+JUDGMEN\w*/gi)];
    /** Prefer the last judgment block in the gap (first is usually the previous hex). */
    const candidateJudgments = judgmentMatches.filter(
      (jm) => (jm.index ?? 0) >= gap.length * 0.12 && !isInlineJudgmentReference(gap, jm.index ?? 0),
    );
    const inferredStart = inferHexStartFromGap(gap, prevH.number, n);
    if (inferredStart != null) {
      const inferred = {
        number: n,
        index: gapStart + inferredStart,
        title: `(inferred between hex ${prevH.number} and ${nextH.number})`,
      };
      byNum.set(n, inferred);
      ordered.push(inferred);
      ordered.sort((a, b) => a.index - b.index);
      continue;
    }

    const jm = candidateJudgments.at(-1);
    if (jm) {
      const pos = jm.index ?? 0;
      const slice = gap.slice(pos, Math.min(pos + 12_000, gap.length));
      if (sectionHasJudgment(slice)) {
        const inferred = {
          number: n,
          index: gapStart + Math.max(0, pos - 500),
          title: `(inferred between hex ${prevH.number} and ${nextH.number})`,
        };
        byNum.set(n, inferred);
        ordered.push(inferred);
        ordered.sort((a, b) => a.index - b.index);
        continue;
      }
    }
  }

  return [...byNum.values()].sort((a, b) => a.index - b.index);
}

/**
 * @param {string} fullText pdftotext output from hex 1 onward
 */
export function parseWilhelmPdfSections(fullText) {
  const headers = gapFillHeaders(fullText, collectHeaderCandidates(fullText));
  return headers.sort((a, b) => a.index - b.index);
}

const LINE_LABEL_TO_POSITION = [
  [/at the beginning|in the beginning/i, 1],
  [/second place/i, 2],
  [/third place/i, 3],
  [/fourth place/i, 4],
  [/fifth place/i, 5],
  [/at the top/i, 6],
];

function linePositionFromLabel(labelText) {
  for (const [pattern, pos] of LINE_LABEL_TO_POSITION) {
    if (pattern.test(labelText)) return pos;
  }
  return 0;
}

function normalizeSectionLabel(text) {
  return text.trim().toUpperCase().replace(/\s+/g, " ").replace(/\.$/, "");
}

function stripHeadingNoise(line) {
  return line.replace(/^[^A-Za-z0-9]+/, "").trim();
}

function isSectionHeading(text) {
  const norm = normalizeSectionLabel(stripHeadingNoise(text));
  if (norm === "THE IMAGE" || norm === "THE LINES") return true;
  return /^THE JUDGMEN/.test(norm);
}

function isCommentaryParagraph(text) {
  const t = text.trim();
  if (t.length > 420) return true;
  if (/^(When|If|A |The |Thus |In |He |It |This |Such |Therefore |However |While |Because |Since |At |One |We |There )/i.test(t)) {
    return t.length > 120;
  }
  return false;
}

function normalizeInline(text) {
  return text
    .replace(/\f/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function toParagraphs(sectionText) {
  const chunks = normalizeInline(sectionText).split(/\n{2,}/);
  const out = [];
  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const merged = [];
    let buf = [];
    for (const line of lines) {
      if (/^\d{1,3}$/.test(line)) continue;
      if (/^See pp\./i.test(line)) continue;
      if (isSectionHeading(line)) {
        if (buf.length) merged.push(buf.join("\n"));
        buf = [];
        merged.push(normalizeSectionLabel(stripHeadingNoise(line)));
        continue;
      }
      if (/^(above|below)\s+/i.test(line)) {
        if (buf.length) merged.push(buf.join("\n"));
        buf = [];
        continue;
      }
      buf.push(line);
    }
    if (buf.length) merged.push(buf.join("\n"));

    for (const p of merged) {
      const t = p.trim();
      if (!t) continue;
      if (/^\d{1,3}$/.test(t)) continue;
      out.push(t);
    }
  }
  return out;
}

function findWilhelmPdfLinesSectionStart(sectionText) {
  const re = /(?:^|\r?\n)\s*THE\s+LINES\s*\r?\n[\s\S]{0,120}?means:/m;
  const m = re.exec(sectionText);
  if (m) return m.index;
  const all = [...sectionText.matchAll(/(?:^|\r?\n)\s*THE\s+LINES\b/gm)];
  for (let i = all.length - 1; i >= 0; i--) {
    const pos = all[i].index ?? 0;
    const after = sectionText.slice(pos, pos + 240);
    if (/means:/i.test(after) && !/^[\s\S]{0,24}the lines of/i.test(after.replace(/^\s*THE\s+LINES/i, ""))) {
      return pos;
    }
  }
  return -1;
}

function findSectionIndex(paragraphs, label) {
  const norm = normalizeSectionLabel(label);
  return paragraphs.findIndex((p) => {
    const pn = normalizeSectionLabel(p);
    if (norm === "THE JUDGMENT") return /^THE JUDGMEN/.test(pn);
    return pn === norm;
  });
}

function oracleLinesFromBlock(text, { maxLines = 6, maxChars = 260 } = {}) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d{1,3}$/.test(line)) continue;
    if (out.length > 0 && isWilhelmJudgmentCommentaryLine(line, out.length)) break;
    if (out.length > 0 && isWilhelmLineCommentaryLine(line, out.length)) break;
    if (out.length > 0 && WILHELM_ORACLE_COMMENTARY_START.test(line)) break;
    if (out.length >= 4 && /^A spring succeeds|^Water is something|^Character is developed/i.test(line)) break;
    if (out.length >= 2 && line.length > 100 && /^[a-z("']/.test(line)) break;
    out.push(line);
    if (out.join(" ").length > maxChars) break;
    if (out.length >= maxLines) break;
  }
  return out;
}

function oracleJudgmentLines(text) {
  const lines = oracleLinesFromBlock(text, { maxLines: 6, maxChars: 320 });
  return lines.filter((line, i) => {
    if (WILHELM_ORACLE_COMMENTARY_START.test(line)) return false;
    if (isWilhelmJudgmentCommentaryLine(line, i)) return false;
    if (i >= 2 && line.length > 95 && !/^(It furthers|Perseverance|Then there|Those who|Whoever|Return brings|No blame)/i.test(line)) {
      return false;
    }
    return true;
  });
}

function extractJudgmentOracle(paragraphs) {
  const idx = findSectionIndex(paragraphs, "THE JUDGMENT");
  if (idx < 0) return "";
  for (let i = idx + 1; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;
    if (isSectionHeading(p)) break;
    const lines = oracleJudgmentLines(p);
    if (lines.length > 0) return lines.slice(0, 6).join("\n").trim();
    if (isCommentaryParagraph(p)) break;
  }
  return "";
}

function extractImageOracle(paragraphs) {
  const idx = findSectionIndex(paragraphs, "THE IMAGE");
  if (idx < 0) return "";
  const parts = [];
  for (let i = idx + 1; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;
    if (isSectionHeading(p) || /^THE LINES$/i.test(p)) break;
    for (const line of oracleLinesFromBlock(p).slice(0, 5)) {
      parts.push(line);
    }
    if (parts.length > 0) break;
    if (isCommentaryParagraph(p)) break;
  }
  return wilhelmImageOracleOnly(parts.join("\n"));
}

function looksLikeWilhelmCommentaryProse(line, oracleLineCount) {
  const t = String(line ?? "").trim();
  if (!t || oracleLineCount < 1) return false;
  if (isWilhelmOracleContinuationLine(t)) return false;
  if (t.length <= 90 && /^(There is some gossip|There is a little gossip|There is no blame|It furthers|No blame|Good fortune|Misfortune|Perseverance|Otherwise you will|In danger like|Do not act|Between himself|He makes a difference)/i.test(t)) {
    return false;
  }
  if (isWilhelmLineCommentaryLine(t, oracleLineCount)) return true;
  if (lineFollowsWilhelmOracleStanza(t)) return true;
  if (
    t.length >= 85 &&
    /^[A-Z("']/.test(t) &&
    !/^(It furthers|No blame|Good fortune|Misfortune|Perseverance|Hidden|Flying|Waiting|One cannot|One falls|Take not|If by chance|Whoever hunts|Ten years|She does not|The maiden is|Three uninvited|Honor them|This is without|There is no blame)/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

function splitMergedOracleVerses(line) {
  const t = String(line ?? "").trim();
  if (!t) return [];
  const re =
    /,\s+(Otherwise|there is rest|This is due to the lasting|There is(?:\s+a\s+little\s+gossip|\s+some\s+gossip|\s+no\s+blame|\s+rest)?|It brings(?:\s+good\s+fortune)?|Thus(?:\s+does|\s+the|\s+one|\s+he|\s+in|\s+a)|In this way|In the end|Nothing(?:\s+further|\s+serves)|It furthers one|One should|One obtains|To continue|When one goes|If one meets|one should remain calm|Starting brings|Dispersion leads|One makes|There are people|Here we see|Here every step|The waiting is over|This offers)/i;
  const m = re.exec(t);
  if (!m || m.index < 8) return [t];
  const head = t.slice(0, m.index + 1).trim();
  const tail = t.slice(m.index + 2).trim();
  return [head, ...splitMergedOracleVerses(tail)];
}

function normalizeWilhelmPdfOracleLine(line) {
  return String(line ?? "")
    .replace(/^[''\u2018\u2019]+\s*/, "")
    .replace(/^\*\s+/, "")
    .replace(/^\f+/, "")
    .trim();
}

function isWilhelmPdfFootnoteOrPageLine(line) {
  const t = normalizeWilhelmPdfOracleLine(line);
  if (!t) return true;
  if (/^\d{1,3}$/.test(t)) return true;
  if (/^\d+\s+(?:Cf\.|\(Literally|\[|Note\b|Apart from)/i.test(t)) return true;
  if (/^[\|\s]+$/.test(t)) return true;
  if (/^group\."?\s*\|?$/i.test(t)) return true;
  if (/^See pp\./i.test(t)) return true;
  if (/^[\d\s\|]{2,16}$/.test(t) && /\d{2,3}/.test(t)) return true;
  if (/^the words of the Bible:/i.test(t)) return true;
  if (/^lose it; and whosoever/i.test(t)) return true;
  if (/^\d{1,2}:\d{1,2}\]\.?$/i.test(t)) return true;
  return false;
}

function splitInlineLineCommentary(line) {
  const chunks = splitMergedOracleVerses(line);
  const out = [];
  for (const chunk of chunks) {
    const t = chunk.trim();
    if (!t) continue;
    for (const sep of [". "]) {
      const idx = t.indexOf(sep);
      if (idx < 0 || idx > 160) continue;
      const head = t.slice(0, idx + 1).trim();
      const tail = t.slice(idx + 2).trim();
      if (
        head.length >= 8 &&
        tail.length > 24 &&
        (WILHELM_LINE_COMMENTARY_OPENERS.test(tail) ||
          (tail.length >= 72 && lineFollowsWilhelmOracleStanza(tail)) ||
          looksLikeWilhelmCommentaryProse(tail, 1))
      ) {
        out.push(head);
        continue;
      }
    }
    out.push(t);
  }
  return out.length ? out : [String(line ?? "").trim()];
}

/** Join pdftotext line breaks that split a single oracle verse mid-word. */
function joinBrokenOcrLines(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (i + 1 < lines.length) {
      const next = lines[i + 1].trim();
      const t = line.trim();
      if (t.length > 0 && next && /^[a-z(]/.test(next)) {
        const endsHardStop = /[.!?]$/.test(t);
        const endsComma = /,\s*$/.test(t);
        if (!endsHardStop || endsComma) {
          line = `${t} ${next}`;
          i++;
          continue;
        }
      }
      break;
    }
    out.push(line.trim());
  }
  return out;
}

function trimWilhelmPdfLineChunks(lines) {
  const out = [];
  const commentaryAfterPeriod =
    /(?<=\.)\s+(?=This offers|Here we see|Here every step|The waiting is over|There are people who|If a man is free|A weak, inexperienced|A sphere of influence|When a man tries|According to the original|A well that is fed|A truculent stranger|The back of the neck is|The high plateau is|The toes are in|The image is that|Here life comes to|A man's understanding|“Tlustrious Ancestor”|Here advance is checked|“Out of|"Out of)/i;
  for (const raw of lines) {
    for (const chunk of String(raw ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)) {
      if (!chunk) continue;
      if (chunk.length > 90 && commentaryAfterPeriod.test(chunk)) {
        for (const p of chunk.split(commentaryAfterPeriod)) {
          const t = p.trim();
          if (t) out.push(t);
        }
      } else {
        out.push(chunk);
      }
    }
  }
  return out;
}

function trimWilhelmLineOracle(linesOnly) {
  linesOnly = trimWilhelmPdfLineChunks(
    linesOnly.map((l) => normalizeWilhelmPdfOracleLine(l)).filter(Boolean),
  );
  const out = [];
  const seen = new Set();

  outer: for (let i = 0; i < linesOnly.length; i++) {
    const rawLine = linesOnly[i];
    if (isWilhelmPdfFootnoteOrPageLine(rawLine)) continue;

    const parts = splitInlineLineCommentary(rawLine);
    for (const line of parts) {
      if (isWilhelmPdfFootnoteOrPageLine(line)) continue;
      if (out.length >= 1 && looksLikeWilhelmCommentaryProse(line, out.length)) {
        break outer;
      }
      if (/^\d+\s+The usual translation|^on the basis of Chinese commentaries|^the basis of Chinese commentaries/i.test(line)) {
        continue;
      }
      if (/^\d+\s+\[|^See pp\.|^©|^\°\s*\[|^\d+\s+Apart from/i.test(line)) break outer;
      if (/^\d+\s+(?:\[|Cf\.|Note\b|Literally|\(Literally)/i.test(line)) break outer;
      if (/^\d+(?:This is the theme|\s+\[)/i.test(line)) break outer;
      if (/^Note how this situation|^just as in the (?:third|first|fourth|fifth|second) line of THE|^Here advance is checked just as in the/i.test(line)) break outer;
      if (/^\d+\s+(?:Cf\.|\(Literally)/i.test(line)) continue;
      if (/^This offers the same dictum|^Whosoever shall seek to save his life/i.test(line)) break outer;

      if (out.length > 0 && isWilhelmLineCommentaryLine(line, out.length)) break outer;
      if (out.length > 0 && line.length > 95 && WILHELM_ORACLE_COMMENTARY_START.test(line)) break outer;

      const key = line.toLowerCase().replace(/\W+/g, " ").trim();
      if (key && seen.has(key)) break outer;
      if (key) seen.add(key);

      out.push(line.replace(/\s+\|\s*$/, "").trim());

      const nextLine = linesOnly[i + 1]?.trim() ?? "";
      if (nextLine && looksLikeWilhelmCommentaryProse(nextLine, out.length)) {
        break outer;
      }
      if (
        nextLine &&
        lineEndsWilhelmOracleStanza(line) &&
        !isWilhelmOracleContinuationLine(nextLine) &&
        lineFollowsWilhelmOracleStanza(nextLine)
      ) {
        break outer;
      }

      if (out.length >= 10) break outer;
      if (out.join("\n").length > 520 && /\.\s*$/.test(line)) break outer;
    }
  }
  return out.filter(Boolean);
}

function cleanWilhelmOracleText(text) {
  return repairWilhelmOcrText(text)
    .replace(/\?\s*There are all/g, ". There are all")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseLinesFromRaw(sectionText) {
  const lines = {};
  let yongJiu = "";
  let yongLiu = "";

  const linesIdx = findWilhelmPdfLinesSectionStart(sectionText);
  const slice = linesIdx >= 0 ? sectionText.slice(linesIdx) : sectionText;

  const labelRe =
    /(?:[^\n]{0,12})?(?:Nine|Six)\s+(?:(?:at|in)\s+the\s+beginning|in\s+the[\s'’]*s[\s'’]*e[\s'’]*c[\s'’]*o[\s'’]*n[\s'’]*d\s+place|in\s+the\s+(?:third|fourth|fifth)\s+place|at\s+the\s+top)[^\n]{0,32}?means:\s*\n+/gi;

  const matches = [...slice.matchAll(labelRe)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const pos = linePositionFromLabel(m[0]);
    if (pos < 1 || pos > 6) continue;
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : slice.length;
    let body = slice.slice(start, end);
    body = body.split(/\n\s*(?:©\s*)?(?:Nine|Six)\s+/i)[0];
    body = body.split(/\n\s*When all the lines are/i)[0];
    body = body.split(/\n\s*Confucius says/i)[0];
    body = body.replace(/\n{3,}/g, "\n\n");
    const linesOnly = body
      .split("\n")
      .map((l) => l.trim())
      .filter(
        (l) =>
          l &&
          !/^\d{1,3}$/.test(l) &&
          !/^See pp\./i.test(l) &&
          !/^\d+\s+The usual translation/i.test(l) &&
          !/^on the basis of Chinese commentaries/i.test(l) &&
          !/^the basis of Chinese commentaries/i.test(l),
      );

    const oracleLines = trimWilhelmLineOracle(joinBrokenOcrLines(linesOnly).slice(0, 18));
    const text = cleanWilhelmOracleText(oracleLines.join("\n"));
    if (text) lines[pos] = text;
  }

  const yongNine = sectionText.match(
    /When all the lines are nines, it means:\s*\n+([\s\S]*?)(?=\n\s*(?:©\s*)?(?:Nine|Six)\s+|When all the lines are sixes|\n\s*\d{1,2}\.\s+[A-Z]|$)/i,
  );
  if (yongNine) {
    yongJiu = yongNine[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !/^\d{1,3}$/.test(l))
      .slice(0, 3)
      .join("\n")
      .trim();
  }

  const yongSix = sectionText.match(
    /When all the lines are sixes, it means:\s*\n+([\s\S]*?)(?=\n\s*(?:©\s*)?(?:Nine|Six)\s+|\n\s*\d{1,2}\.\s+[A-Z]|$)/i,
  );
  if (yongSix) {
    yongLiu = yongSix[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !/^\d{1,3}$/.test(l))
      .slice(0, 3)
      .join("\n")
      .trim();
  }

  return { lines, yongJiu, yongLiu };
}

/**
 * @param {string} fullText
 */
export function parseAllWilhelmPdf(fullText) {
  const headers = parseWilhelmPdfSections(fullText).sort((a, b) => a.index - b.index);
  const out = {};

  for (let i = 0; i < headers.length; i++) {
    const { number, index } = headers[i];
    const end = i + 1 < headers.length ? headers[i + 1].index : fullText.length;
    const section = fullText.slice(index, end);
    const paragraphs = toParagraphs(section);
    const judgment = extractJudgmentOracle(paragraphs);
    const image = extractImageOracle(paragraphs);
    const { lines, yongJiu, yongLiu } = parseLinesFromRaw(section);

    out[number] = {
      judgment: cleanWilhelmOracleText(judgment),
      image: cleanWilhelmOracleText(image),
      lines: Object.fromEntries(
        Object.entries(lines).map(([k, v]) => [k, cleanWilhelmOracleText(v)]),
      ),
      ...(yongJiu ? { yongJiu: cleanWilhelmOracleText(yongJiu) } : {}),
      ...(yongLiu ? { yongLiu: cleanWilhelmOracleText(yongLiu) } : {}),
    };
  }

  return out;
}

/**
 * @param {string} fullText
 */
export function parseAllWilhelmPdfOrThrow(fullText) {
  const parsed = parseAllWilhelmPdf(fullText);
  const count = Object.keys(parsed).length;
  if (count !== 64) {
    const missing = [];
    for (let n = 1; n <= 64; n++) {
      if (!parsed[n]) missing.push(n);
    }
    throw new Error(`Wilhelm PDF parser found ${count}/64 hexagrams; missing: ${missing.join(", ")}`);
  }
  return parsed;
}
