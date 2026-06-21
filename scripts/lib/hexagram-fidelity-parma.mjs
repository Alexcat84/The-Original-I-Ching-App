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

function isCommentaryParagraph(text) {
  const t = text.trim();
  if (t.length > 500) return true;
  if (/^According to the original meaning/i.test(t)) return true;
  if (/^Since there is only one heaven/i.test(t)) return true;
  if (/^In China the dragon/i.test(t)) return true;
  if (/^We are in a situation/i.test(t)) return true;
  return false;
}

function extractOracleAfterLabel(paragraphs, label) {
  const idx = paragraphs.findIndex((p) => p.trim().toUpperCase() === label.toUpperCase());
  if (idx < 0) return "";
  for (let i = idx + 1; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;
    if (/^THE (JUDGMENT|IMAGE|LINES)$/i.test(p)) break;
    if (isCommentaryParagraph(p)) continue;
    if (p.length > 600) continue;
    return p;
  }
  return "";
}

function parseLinesFromSectionHtml(sectionHtml) {
  const lines = {};
  let yongJiu = "";
  let yongLiu = "";
  let pos = 0;

  const re = new RegExp(LINE_LABEL_HTML.source, "gi");
  let m;
  while ((m = re.exec(sectionHtml)) !== null) {
    pos += 1;
    if (pos >= 1 && pos <= 6) {
      lines[pos] = stripTags(m[1]).replace(/\s+\n\s+/g, "\n").trim();
    }
  }

  const yongNine = sectionHtml.match(
    /When all the lines are nines, it means:\s*<\/p>\s*<p[^>]*>\s*([\s\S]*?)<\/p>/i,
  );
  if (yongNine) {
    yongJiu = stripTags(yongNine[1])
      .replace(/\s+Good fortune\.?\s*$/i, "")
      .trim();
  }

  const yongSix = sectionHtml.match(
    /When all the lines are sixes, it means:\s*<\/p>\s*<p[^>]*>\s*([\s\S]*?)<\/p>/i,
  );
  if (yongSix) {
    yongLiu = stripTags(yongSix[1])
      .replace(/\s+Good fortune\.?\s*$/i, "")
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
    const judgment = extractOracleAfterLabel(paragraphs, "THE JUDGMENT");
    const image = extractOracleAfterLabel(paragraphs, "THE IMAGE");
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
