import { stripZhouYiLabel } from "./hexagram-fidelity-normalize.mjs";

const YONG_RE = /^用[九六]/u;
const LINE_RE = /^(?:初[九六]|[九六][二三四五]|上[九六])/u;
const COMMENTARY_OPT = /^(彖傳|Tuan|Commentary on the Decision)/i;
const XIANG_OPT = /^象傳/u;

function stripHtmlCell(s) {
  return String(s)
    .replace(/<div[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Parse ctext.org chapter HTML rows.
 * @param {string} html
 */
export function parseCtextHtmlRows(html) {
  const rows = [];
  const rowRe =
    /class="ctext opt"[^>]*>([\s\S]*?)<\/td>\s*<td class="ctext">\s*(?:<div[^>]*><\/div>)?([\s\S]*?)<\/td>/gi;
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    rows.push({ opt: stripHtmlCell(m[1]), body: stripHtmlCell(m[2]) });
  }
  if (rows.length === 0) throw new Error("ctext HTML parser found no rows");
  return rows;
}

/**
 * API-compatible fulltext array (卦辭 + 爻辭 + 用九/六).
 * @param {string} html
 */
export function parseCtextHtml(html) {
  const fulltext = [];
  for (const row of parseCtextHtmlRows(html)) {
    if (COMMENTARY_OPT.test(row.opt)) continue;
    if (/^Qian:|^Kun:|^Legge|^James/i.test(row.opt)) continue;
    if (XIANG_OPT.test(row.opt)) continue;
    if (row.body) fulltext.push(row.body);
  }
  return { fulltext };
}

/**
 * Full Zhou Yi gold from ctext HTML: 卦辭, 大象, 爻辭, 用九/六.
 * @param {string} html
 */
export function parseCtextZhouYiFromHtml(html) {
  const rows = parseCtextHtmlRows(html);
  let judgment = "";
  let image = "";
  const lines = {};
  let yongJiu;
  let yongLiu;
  let linePos = 0;
  let seenLine = false;

  for (const row of rows) {
    if (COMMENTARY_OPT.test(row.opt)) continue;
    if (/^Qian:|^Kun:|^Legge|^James/i.test(row.opt)) continue;

    const body = row.body;
    if (!body) continue;

    if (XIANG_OPT.test(row.opt) && !seenLine && !LINE_RE.test(body)) {
      image = stripZhouYiLabel(body, "judgment");
      continue;
    }

    if (YONG_RE.test(body)) {
      const text = stripZhouYiLabel(body, "line");
      if (body.includes("用九")) yongJiu = text;
      else if (body.includes("用六")) yongLiu = text;
      continue;
    }

    if (LINE_RE.test(body)) {
      seenLine = true;
      linePos += 1;
      if (linePos <= 6) lines[linePos] = stripZhouYiLabel(body, "line");
      continue;
    }

    if (!judgment && !LINE_RE.test(body) && !XIANG_OPT.test(row.opt)) {
      judgment = stripZhouYiLabel(body, "judgment");
    }
  }

  return {
    judgment,
    image: image || null,
    lines,
    ...(yongJiu ? { yongJiu } : {}),
    ...(yongLiu ? { yongLiu } : {}),
  };
}

/**
 * @param {{ fulltext?: string[] }} payload ctext gettext JSON
 */
export function parseCtextZhouYi(payload) {
  const rows = payload?.fulltext ?? [];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("ctext payload missing fulltext");
  }

  let judgment = stripZhouYiLabel(rows[0], "judgment");
  const lines = {};
  let yongJiu;
  let yongLiu;

  let linePos = 0;
  for (let i = 1; i < rows.length; i++) {
    const raw = String(rows[i]).trim();
    if (YONG_RE.test(raw)) {
      const text = stripZhouYiLabel(raw, "line");
      if (raw.includes("用九")) yongJiu = text;
      else if (raw.includes("用六")) yongLiu = text;
      continue;
    }
    if (LINE_RE.test(raw)) {
      linePos += 1;
      if (linePos <= 6) lines[linePos] = stripZhouYiLabel(raw, "line");
    }
  }

  return {
    judgment,
    image: null,
    lines,
    ...(yongJiu ? { yongJiu } : {}),
    ...(yongLiu ? { yongLiu } : {}),
  };
}

/** Merge API text fields with HTML 大象 when available. */
export function mergeCtextGold(apiGold, htmlGold) {
  return {
    ...apiGold,
    image: htmlGold?.image ?? apiGold.image ?? null,
  };
}
