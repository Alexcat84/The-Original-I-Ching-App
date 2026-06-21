import { stripZhouYiLabel } from "./hexagram-fidelity-normalize.mjs";

const YONG_RE = /^用[九六]/u;
const LINE_RE = /^(?:初[九六]|[九六][二三四五]|上[九六])/u;
const COMMENTARY_OPT = /^(彖傳|象傳|Tuan|Xiang|Commentary)/i;

function stripHtmlCell(s) {
  return String(s)
    .replace(/<div[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Parse ctext.org chapter HTML (fallback when gettext API is rate-limited).
 * Returns API-compatible `{ fulltext: string[] }`.
 * @param {string} html
 */
export function parseCtextHtml(html) {
  const fulltext = [];
  const rowRe =
    /class="ctext opt"[^>]*>([\s\S]*?)<\/td>\s*<td class="ctext">\s*(?:<div[^>]*><\/div>)?([\s\S]*?)<\/td>/gi;
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    const opt = stripHtmlCell(m[1]);
    const body = stripHtmlCell(m[2]);
    if (!body) continue;
    if (COMMENTARY_OPT.test(opt)) continue;
    if (/^Qian:|^Kun:|^Legge|^James/i.test(opt)) continue;
    fulltext.push(body);
  }
  if (fulltext.length === 0) {
    throw new Error("ctext HTML parser found no rows");
  }
  return { fulltext };
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

/**
 * ctext gettext API returns 卦辭+爻辭 only (no 大象傳). Image comparisons are skipped.
 */
