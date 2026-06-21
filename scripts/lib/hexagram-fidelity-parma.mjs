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

const LINE_LABEL =
  /^(?:Nine|Six) (?:at the beginning|in the second place|in the third place|in the fourth place|in the fifth place|at the top)(?: means)?:?$/i;

function extractOracleAfterLabel(paragraphs, label) {
  const idx = paragraphs.findIndex((p) => p.trim().toUpperCase() === label.toUpperCase());
  if (idx < 0) return "";
  for (let i = idx + 1; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;
    if (/^THE (JUDGMENT|IMAGE|LINES)$/i.test(p)) break;
    if (/^According to the original meaning/i.test(p)) break;
    if (/^Since there is only one heaven/i.test(p)) break;
    if (p.length > 600) continue;
    return p;
  }
  return "";
}

function expandParagraphLines(paragraphs) {
  const out = [];
  for (const p of paragraphs) {
    const parts = p
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    out.push(...parts);
  }
  return out;
}

function parseLines(paragraphs) {
  const lines = {};
  const expanded = expandParagraphLines(paragraphs);
  const linesIdx = expanded.findIndex((p) => p.trim().toUpperCase() === "THE LINES");
  if (linesIdx < 0) return { lines, yongJiu: "", yongLiu: "" };

  let pos = 0;
  let yongJiu = "";
  let yongLiu = "";

  for (let i = linesIdx + 1; i < expanded.length; i++) {
    const p = expanded[i].trim();
    if (/^\d+\.\s/.test(p) && p.includes(" / ")) break;
    if (/^THE JUDGMENT$/i.test(p)) break;

    if (/^When all the lines are nines/i.test(p)) {
      const next = expanded[i + 1]?.trim() ?? "";
      if (next && !/^When all the lines/i.test(next)) {
        yongJiu = next.replace(/\s+Good fortune\.?\s*$/i, "").trim();
      }
      continue;
    }
    if (/^When all the lines are sixes/i.test(p)) {
      const next = expanded[i + 1]?.trim() ?? "";
      if (next && !/^When all the lines/i.test(next)) {
        yongLiu = next.replace(/\s+Good fortune\.?\s*$/i, "").trim();
      }
      continue;
    }

    if (LINE_LABEL.test(p)) {
      pos += 1;
      const text = expanded[i + 1]?.trim() ?? "";
      if (pos >= 1 && pos <= 6 && text && !LINE_LABEL.test(text)) {
        lines[pos] = text;
        i += 1;
      }
    }
  }

  return { lines, yongJiu, yongLiu };
}

/**
 * @param {string} html Full Parma mirror HTML
 * @returns {Record<number, { judgment: string, image: string, lines: Record<number,string>, yongJiu?: string, yongLiu?: string }>}
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
    const { lines, yongJiu, yongLiu } = parseLines(paragraphs);

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
