const HTML_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&[a-zA-Z][a-zA-Z0-9]+;/g, (m) => HTML_ENTITIES[m] ?? m);
}

function stripTags(s) {
  return decodeEntities(
    s
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, "")
      .replace(/<img\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\u200B/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function tokenizeParagraphs(html) {
  const out = [];
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = stripTags(m[1]);
    if (text) out.push(text);
  }
  return out;
}

function findHeaderIndices(html) {
  const headers = [];
  const re = /(\d{1,2})\.\s+(.+?\/\s+[^<\n]{2,80})/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const n = parseInt(m[1], 10);
    if (n < 1 || n > 64) continue;
    if (headers.some((h) => h.number === n)) continue;
    headers.push({ number: n, index: m.index, title: stripTags(m[2]) });
  }
  headers.sort((a, b) => a.number - b.number);
  return headers;
}

const LINE_LABEL_HTML =
  /(?:Nine|Six) (?:(?:at|in) the beginning|in the second place|in the third place|in the fourth place|in the fifth place|at the top) means:\s*(?:<\/p>\s*<p[^>]*>\s*)?([\s\S]*?)<\/p>/gi;

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

function isSectionHeading(text) {
  return /^THE (JUDGMENT|IMAGE|LINES)\.?$/i.test(text.trim());
}

function isCommentaryParagraph(text) {
  const t = text.trim();
  if (t.length > 500) return true;
  if (/^According to the original meaning/i.test(t)) return true;
  if (/^Since there is only one heaven/i.test(t)) return true;
  if (/^In China the dragon/i.test(t)) return true;
  if (/^We are in a situation/i.test(t)) return true;
  if (/^The two elements,/i.test(t)) return true;
  if (/^When grass on a mountain/i.test(t)) return true;
  return false;
}

function findSectionIndex(paragraphs, label) {
  const norm = label.toUpperCase();
  return paragraphs.findIndex((p) => {
    const t = p.trim().toUpperCase().replace(/\.$/, "");
    return t === norm;
  });
}

function extractOracleAfterLabel(paragraphs, label) {
  const idx = findSectionIndex(paragraphs, label);
  if (idx < 0) return "";
  for (let i = idx + 1; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;
    if (isSectionHeading(p)) break;
    if (isCommentaryParagraph(p)) continue;
    if (p.length > 600) continue;
    return p;
  }
  return "";
}

/** Merge short oracle paragraphs (e.g. hex 38 IMAGE spans multiple lines). */
function extractImageOracle(paragraphs) {
  const idx = findSectionIndex(paragraphs, "THE IMAGE");
  if (idx < 0) return "";
  const parts = [];
  for (let i = idx + 1; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;
    if (isSectionHeading(p) || /^THE LINES$/i.test(p)) break;
    if (isCommentaryParagraph(p)) break;
    if (p.length > 600) break;
    parts.push(p);
    if (parts.length >= 4) break;
  }
  return parts.join("\n\n").trim();
}

function parseLinesFromSectionHtml(sectionHtml) {
  const lines = {};
  let yongJiu = "";
  let yongLiu = "";

  const re = new RegExp(LINE_LABEL_HTML.source, "gi");
  let m;
  while ((m = re.exec(sectionHtml)) !== null) {
    const pos = linePositionFromLabel(m[0]);
    if (pos >= 1 && pos <= 6) {
      lines[pos] = stripTags(m[1]).replace(/\s+\n\s+/g, "\n").trim();
    }
  }

  const yongNine = sectionHtml.match(
    /When all the lines are nines, it means:\s*<\/p>\s*<p[^>]*>\s*([\s\S]*?)<\/p>/i,
  );
  if (yongNine) {
    yongJiu = stripTags(yongNine[1])
      .trim();
  }

  const yongSix = sectionHtml.match(
    /When all the lines are sixes, it means:\s*<\/p>\s*<p[^>]*>\s*([\s\S]*?)<\/p>/i,
  );
  if (yongSix) {
    yongLiu = stripTags(yongSix[1])
      .trim();
  }

  return { lines, yongJiu, yongLiu };
}

/**
 * @param {string} html Full Parma mirror HTML
 */
export function parseParmaWilhelm(html) {
  const headers = findHeaderIndices(html);
  const out = {};

  for (let i = 0; i < headers.length; i++) {
    const { number, index } = headers[i];
    const end = i + 1 < headers.length ? headers[i + 1].index : html.length;
    const section = html.slice(index, end);
    const paragraphs = tokenizeParagraphs(section);
    let judgment = extractOracleAfterLabel(paragraphs, "THE JUDGMENT");
    const image = extractImageOracle(paragraphs) || extractOracleAfterLabel(paragraphs, "THE IMAGE");
    const { lines, yongJiu, yongLiu } = parseLinesFromSectionHtml(section);

    out[number] = {
      judgment,
      image,
      lines,
      ...(yongJiu ? { yongJiu } : {}),
      ...(yongLiu ? { yongLiu } : {}),
    };
  }

  return out;
}

export function parseAllParmaWilhelm(html) {
  const parsed = parseParmaWilhelm(html);
  if (Object.keys(parsed).length !== 64) {
    throw new Error(`Parma parser found ${Object.keys(parsed).length}/64 hexagrams`);
  }
  return parsed;
}
