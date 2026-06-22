/**
 * OCR repairs for James Legge SBE XVI scan (Google Books / Oxford).
 */

/** @type {[RegExp, string][]} */
export const LEGGE_SBE_OCR_REPAIRS = [
  [/\bHeExacrRamM\b/gi, "HEXAGRAM"],
  [/\bHexacram\b/gi, "Hexagram"],
  [/\bHeExacram\b/gi, "Hexagram"],
  [/\bHeExacray\b/gi, "Hexagram"],
  [/\bHeExacram\b/gi, "Hexagram"],
  [/\bAaien\b/gi, "Khien"],
  [/\bKywdkn\b/gi, "Khwân"],
  [/\bKhwi4n\b/gi, "Khwân"],
  [/\bKhw4n\b/gi, "Khwân"],
  [/\bKhw&n\b/gi, "Khwân"],
  [/\bK4n\b/gi, "Kân"],
  [/\bK4o\b/gi, "Kâo"],
  [/\bK4u\b/gi, "Kâu"],
  [/\bK4i\b/gi, "Kî"],
  [/\bTh4i\b/gi, "Thai"],
  [/\bTh4o\b/gi, "Thâo"],
  [/\bTuHAr\b/gi, "Thai"],
  [/\bHst4o\b/gi, "Hsiao"],
  [/\bHsi4o\b/gi, "Hsiao"],
  [/\bMsia[oO]\b/gi, "Hsiao"],
  [/\bW&n\b/gi, "Wăn"],
  [/\bW4n\b/gi, "Wăn"],
  [/\bPt Hexagram\b/gi, "Pî Hexagram"],
  [/\bAiA Zin\b/gi, "Kiâ Zăn"],
  [/\bKwAdr\b/gi, "Kwâi"],
  [/\bKuwin\b/gi, "Sun"],
  [/\bXau\b/g, "Kâu"],
  [/\bKhwAn\b/g, "Khwăn"],
  [/\bKhwan\b/g, "Khwăn"],
  [/\bHsii\b/g, "Hsü"],
  [/\bMang\b/g, "Măng"],
  [/\b3hui\b/gi, "Žhui"],
  [/\bform Aun\b/g, "form Kun"],
  [/\bform Pi\b/g, "form Pî"],
  [/\bform Pt\b/g, "form Pî"],
  [/\bZing,\b/g, "Žing,"],
  [/\bPt indicates\b/g, "Pî indicates"],
  [/\bPht there is\b/g, "Phî there is"],
  [/\bPht\b/g, "Phî"],
  [/\bYii indicates\b/g, "Yü indicates"],
  [/\bYüi indicates\b/g, "Yü indicates"],
  [/\be nae Khien indicates\b/g, "Khien indicates"],
  [/\be nae Khien\b/g, "Khien"],
  [/\bEe Hsiâo Khû indicates\b/g, "Hsiâo Khû indicates"],
  [/\bHsiao Ad indicates\b/g, "Hsiâo Khû indicates"],
  [/\bEe Hsiao Ad indicates\b/g, "Hsiâo Khû indicates"],
  [/\bThung Z4n\b/g, "Thung Zăn"],
  [/\bZ4n\b/g, "Zăn"],
  [/\bLt suggests\b/g, "Lü suggests"],
  [/\bLu suggests\b/g, "Lü suggests"],
  [/\bLî suggests\b/g, "Lî suggests"],
  [/\bT4 0\b/g, "Tâ Khû"],
  [/\bT4 Awang\b/g, "Tâ Kwang"],
  [/\bH Ang\b/g, "Hăng"],
  [/\bfifth lime,/gi, "fifth line,"],
  [/\bIn the fifth lime,/gi, "In the fifth line,"],
  [/\bas \) Kun \(indicates\b/g, "Kun (indicates"],
  [/\bHsiao Khu\b/g, "Hsiâo Khû"],
  [/\(we\s*\r?\n\s*nde dt 7% "?See/gi, "(we see"],
  [/\(we\s*\nde dt 7% "?See/gi, "(we see"],
  [/\bYf KING\b/gi, "Yî KING"],
  [/\bYi KING\b/gi, "Yî KING"],
  [/\bTreatise onthe\b/gi, "Treatise on the"],
  [/\bInthe\b/g, "In the"],
  [/\bT he\b/g, "The"],
  [/\bits,\s+subject\b/gi, "its subject"],
  [/\(\s*to his\.\s*help\s*\)/g, "(to his help)"],
  [/\bshould \. /g, "should "],
  [/\bwith \. bare\b/g, "with bare"],
  [/\bsubject \. retiring\b/g, "subject retiring"],
  [/\(his wish to \. contend\)/g, "(his wish to contend)"],
  [/\(who thinks\. he\)/g, "(who thinks he)"],
  [/tail of \. a tiger/g, "tail of a tiger"],
  [/thunder \. and/g, "thunder and"],
  [/committed \. He/g, "committed. He"],
  [/\bshows\. its\b/g, "shows its"],
  [/;\s*or n a high/g, "; or in a high"],
  [/\bdeprived of his cars\b/g, "deprived of his ears"],
  [/nourishes his virtue\. \. \d+,/g, "nourishes his virtue."],
  [/ according to their kinds and classes\. \d+,.*$/s, " according to their kinds and classes."],
  [/ there will be cause for regret\. \d+\. \(To the subject of\).*$/s, " there will be cause for regret."],
  [/ affairs\. :$/g, " affairs."],
  [/\s+~$/g, ""],
  [/\bIl\./g, "II."],
  [/\bIl\b(?=\s+The)/g, "II"],
  [/\b;civided\b/gi, "; divided"],
  [/\bho\.?LfInG\b/gi, "holding"],
  [/\b3f\b/g, "î"],
  [/\b3i\b/g, "î"],
  [/\bAt 3i\b/g, "Kî"],
  [/\bWer 3t\b/gi, "Wei î"],
  [/\bKi 31\b/gi, "Kî î"],
  [/\bMing \{/g, "Ming Î"],
  [/\bKid Zan\b/gi, "Kiâ Zăn"],
  [/\bKia Zan\b/gi, "Kiâ Zăn"],
  [/\bFf-hs[ti]\b/gi, "Fû-hsî"],
  [/\bXhien\b/gi, "Khien"],
  [/\bX4ien\b/gi, "Khien"],
  [/\bXAien\b/gi, "Khien"],
  [/\beel el K hwei indicates\b/gi, "Khwei indicates"],
  [/\beel el Khwei indicates\b/gi, "Khwei indicates"],
  [/\bHsiâo Kwo indicates\b/g, "Hsiâo Kwo indicates"],
  [/\(Lî suggests\b/g, "(Lî suggests"],
  [/\bTi-yt\b/g, "Tî-yî"],
  [/\bMing f\b/g, "Ming Î"],
  [/\bwovld fain\b/g, "would fain"],
  [/\bTt-yi\b/g, "Tî-yî"],
  [/\bform Kw4i\b/g, "form Kwâi"],
  [/\bKâo 3ung\b/g, "Kâo Žung"],
  [/\bcount of At fulfilled\b/g, "count of Kî fulfilled"],
  [/\bT4 Awang\b/g, "Tâ Kwang"],
  [/\bH Ang\b/g, "Hăng"],
  [/\bKhw&n\b/gi, "Khwân"],
  [/\bKhw4n\b/gi, "Khwân"],
  [/\bKhwé&n\b/gi, "Khwân"],
  [/\bKhw&n\b/gi, "Khwân"],
  [/\bKhw4n\b/gi, "Khwân"],
  [/\bKhw&n\b/gi, "Khwân"],
  [/\b—{2,}/g, "—"],
  [/\s+'\s+/g, " "],
  [/\u2019|\u2018/g, "'"],
  [/\u201C|\u201D/g, '"'],
  [/\u2013|\u2014/g, "—"],
];

/**
 * @param {string} text
 */
export function repairLeggeSbeOcrText(text) {
  if (!text) return "";
  let out = String(text);
  for (const [re, rep] of LEGGE_SBE_OCR_REPAIRS) {
    out = out.replace(re, rep);
  }
  return out
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Line/image fields with obvious scan artifacts (not intentional Legge punctuation).
 * @param {string} text
 */
export function fieldLooksLeggeOcrJunk(text) {
  const t = String(text ?? "").trim();
  if (!t) return false;
  return (
    /\bits,\s+subject\b/i.test(t) ||
    /\(\s*to his\.\s*help\s*\)/.test(t) ||
    /\bshould \. /.test(t) ||
    / affairs\. :$/.test(t) ||
    / ~$/.test(t) ||
    /\bshows\. its\b/.test(t) ||
    /\bor n a high\b/.test(t) ||
    /\bdeprived of his cars\b/.test(t) ||
    /^T he /.test(t) ||
    / \(his wish to \. contend\)/.test(t) ||
    /\(who thinks\. he\)/.test(t) ||
    /tail of \. a tiger/.test(t) ||
    /subject \. retiring/.test(t) ||
    /with \. bare buttocks/.test(t) ||
    /nourishes his virtue\. \./.test(t) ||
    /thunder \. and/.test(t) ||
    /committed \. He/.test(t) ||
    /regret\. \d+\. \(To the subject of\)/.test(t) ||
    /according to their kinds and classes\. \d+,/.test(t) ||
    /The subject of \d therefore/.test(t) ||
    /pointed out in the conclusion/.test(t) ||
    /The constellation of the Bushel corresponds to our Ursa Major/.test(t)
  );
}

/**
 * @param {{ judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }} row
 */
export function finalizeLeggeSbeRow(row) {
  const out = { ...row, lines: { ...(row.lines ?? {}) } };
  out.judgment = repairLeggeSbeOcrText(out.judgment ?? "");
  out.image = repairLeggeSbeOcrText(out.image ?? "");
  for (const [pos, line] of Object.entries(out.lines)) {
    out.lines[Number(pos)] = repairLeggeSbeOcrText(String(line ?? ""));
  }
  if (out.yongJiu) out.yongJiu = repairLeggeSbeOcrText(out.yongJiu);
  if (out.yongLiu) out.yongLiu = repairLeggeSbeOcrText(out.yongLiu);
  return out;
}

/**
 * Join OCR hyphenation across line breaks: "sub-\nject" → "subject".
 * @param {string} text
 */
export function joinLeggeOcrHyphenation(text) {
  return String(text).replace(/([A-Za-z])-\s*\n\s*([a-z])/g, "$1$2");
}
