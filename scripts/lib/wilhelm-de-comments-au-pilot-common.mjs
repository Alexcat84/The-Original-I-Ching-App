/**
 * Shared helpers for Wilhelm DE comments AU pilot (JPG-verified contenido_pdf).
 * QA code: AU-FID-W-021 · v1.0.0
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeWilhelmDeAuBookText } from "./wilhelm-de-comments-anna-au-gold.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** @param {string} t */
export function fixHyphens(t) {
  return String(t ?? "").replace(/-\n(?=[a-zäöüß])/gi, "");
}

/** Opening ,, → „ per 1924 Diederichs scan. */
/** @param {string} t */
export function bookQuotes(t) {
  return fixHyphens(t).replace(/,,(?=[A-ZÄÖÜ„"])/g, "„");
}

/** @param {string} bRaw */
export function extractLineAFromFirstQuoteLine(bRaw) {
  const line = bookQuotes(fixHyphens(bRaw)).split("\n")[0]?.trim() ?? "";
  return line;
}

/** @param {string} yongBRaw */
export function extractYongAFromB(yongBRaw) {
  const t = bookQuotes(fixHyphens(yongBRaw));
  const m = t.match(/^([„"][^\n]+(?:\n[^\n"]+)?["""])/);
  if (m) return m[1].replace(/\n/g, " ").trim();
  return t.split("\n")[0]?.trim() ?? "";
}

/** @param {string} raw */
export function extractImageOracleTwoLines(raw) {
  const lines = String(raw ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.slice(0, 2).join("\n");
}

/** Drop publisher back-matter / ads accidentally OCR-merged into line commentary. */
/** @param {string} t */
export function stripBackMatterBleed(t) {
  return String(t ?? "")
    .replace(/\nVERZEICHNIS[\s\S]*$/i, "")
    .replace(/\nNIFAL[\s\S]*$/i, "")
    .replace(/\nRELIGIÖSE STIMMEN[\s\S]*$/i, "")
    .replace(/\nRELIGION UND PHILOSOPHIE CHINAS[\s\S]*$/i, "")
    .replace(/\nINHALT\s*\n[\s\S]*$/i, "")
    .replace(/\nDRUCK DER HOFBUCHDRUCKEREI[\s\S]*$/i, "")
    .trim();
}

/** Remove trailing OCR noise lines (margin bleed, single letters, CJK headers). */
/** @param {string} t */
export function stripTrailingOcrGarbage(t) {
  /** @param {string} line */
  const isGarbageLine = (line) => {
    const x = line.trim();
    if (!x) return true;
    if (/^[\u4e00-\u9fff\u200b\u2060\s·]{1,10}$/u.test(x)) return true;
    if (/^[a-zäöüß]{1,3}$/i.test(x)) return true;
    if (/^[\u0f00-\u0fff\u0900-\u097f]+$/u.test(x)) return true;
    if (/^[+\-÷\.0-9]{1,8}$/.test(x)) return true;
    if (
      /^(dem|tä|Ein|Artere|T|Zet|ste|Dr|fel|d|I|S|g|r|f|e|F|Er|en|D|e|h|i|Ar|7d|21|20|-20|7-)$/i.test(
        x,
      )
    )
      return true;
    return false;
  };
  const lines = String(t ?? "").trim().split("\n");
  while (lines.length && isGarbageLine(lines[lines.length - 1] ?? "")) {
    lines.pop();
  }
  return lines.join("\n").trim();
}

/** @param {string} t */
export function trimCommentaryLeadingGarbage(t) {
  let s = String(t ?? "").trim();
  const anchor = s.search(
    /(?:^|\n)(?:Der Baum auf dem Berg|Feuer über Holz|Das Feuer|Der Himmel bewegt|Während im Kommentar|Bemerkung:)/m,
  );
  if (anchor > 0) s = s.slice(anchor).trim();
  return s;
}

/** @param {string} t */
export function isGarbageCommentaryExtract(t) {
  const s = String(t ?? "").trim();
  if (s.length < 80) return true;
  const words = s.match(/[A-Za-zäöüßÄÖÜ]{4,}/g) ?? [];
  if (words.length < 4) return true;
  if (/^(dem|tä|Ein|Artere|Dr\.|T\n)/m.test(s) && !/^(Der Baum|Das Feuer|Der Himmel|Während)/m.test(s)) {
    return true;
  }
  return false;
}

/** @param {string} t */
export function stripBookPageFooters(t) {
  return String(t ?? "")
    .replace(/\n\d+\s*\nDas Buch der Wandlungen\s*II\s*\n/gi, "\n")
    .replace(/\n\d+\s+Das Buch der Wandlungen\s*II\s*$/gi, "")
    .trim();
}

/** Global OCR artifact cleanup (JPG spot-check batch 4–64). */
/** @param {string} raw */
export function cleanPassArtifacts(raw) {
  let t = bookQuotes(fixHyphens(raw));
  t = t
    .replace(/\biẞt\b/g, "ißt")
    .replace(/\bGroBem\b/g, "Großem")
    .replace(/\bmuB\b/g, "muß")
    .replace(/\bEntsprediens\b/g, "Entsprechens")
    .replace(/\bZeidiens\b/g, "Zeichens")
    .replace(/\bDadurdi\b/g, "Dadurch")
    .replace(/\bfünfist\b/g, "fünftem")
    .replace(/Der\s*\ner Herr/g, "Der Herr")
    .replace(/Das\s*\nas Zeichen,,/g, 'Das Zeichen „')
    .replace(/Das\s*\nas Zeichen/g, "Das Zeichen")
    .replace(/Die\s*\n?H\s*\nie Herren/g, "Die Herren")
    .replace(/Ob\s*\n?wohl\b/g, "Obwohl")
    .replace(/D\s*\nie Herren/g, "Die Herren")
    .replace(/Di\s*\nie Herren/g, "Die Herren")
    .replace(/Wandlungen П\n/g, "Wandlungen auf\n")
    .replace(/\u041f/g, "")
    .replace(/D\s*\/as Zeichen/g, "Das Zeichen")
    .replace(/\nwww\s*$/i, "")
    .replace(/\n[·履復无妄革蒙]{1,4}\s*$/u, "")
    .replace(/\n[\u0400-\u04FF]{2,}[^\n]*$/u, "")
    .replace(/\n[^\n]*[\u0900-\u097F][^\n]*$/u, "")
    .replace(/\n[^\n]*[\u4e00-\u9fff][^\n]*$/u, "")
    .replace(/\n\$\s*\nEt\s*$/i, "")
    .replace(/\n\[?\s*\nS?\s*$/i, "")
    .replace(/\nE\s*\nE\s*$/i, "")
    .replace(/\nA\s*\nais[\s\S]*$/i, "")
    .replace(/\n•\s*\n\$\d+/g, "\n")
    .replace(/\n—\s*$/m, "");
  t = stripTrailingOcrGarbage(stripBookPageFooters(stripBackMatterBleed(t)));
  return t.trim();
}
/** @param {string} p2 @param {string} p4 */
/** @param {string} t */
function hasBackMatterBleed(t) {
  return /\nVERZEICHNIS\b|\nNIFAL\b|\nRELIGIÖSE STIMMEN\b|\nINHALT\s*\n/i.test(String(t ?? ""));
}

export function pickBestPassText(p2, p4) {
  const a = fixHyphens(String(p2 ?? "")).trim();
  const b = fixHyphens(String(p4 ?? "")).trim();
  if (!a) return hasBackMatterBleed(b) ? stripBackMatterBleed(b) : b;
  if (!b) return hasBackMatterBleed(a) ? stripBackMatterBleed(a) : a;
  const aBleed = hasBackMatterBleed(a);
  const bBleed = hasBackMatterBleed(b);
  if (aBleed && !bBleed) return b;
  if (bBleed && !aBleed) return a;
  const na = normalizeWilhelmDeAuBookText(a);
  const nb = normalizeWilhelmDeAuBookText(b);
  if (na === nb) return a.length >= b.length ? a : b;
  if (b.length < Math.min(48, na.length * 0.2) && na.length > 80) return a;
  if (a.length < Math.min(48, nb.length * 0.2) && nb.length > 80) return b;
  if (nb.length > na.length * 1.05 && nb.includes(na.slice(0, Math.min(40, na.length)))) return b;
  if (na.length > nb.length * 1.05 && na.includes(nb.slice(0, Math.min(40, nb.length)))) return a;
  return b;
}

/** Strip Kernzeichen OCR header + fix recurring ruler_note typos (JPG-verified patterns). */
/** @param {string} raw */
export function cleanRulerNote(raw) {
  let t = cleanPassArtifacts(raw);
  t = t.replace(/^\([^)]+\)\s*\n?/m, "");
  t = t.replace(/^Kernzeichen:\s*[^\n]*\n(?:[^\n]{1,24}\n){0,4}/i, "");
  t = t.replace(/^(?:Sun|Gen|Li|Kan|Dui|Kiän)\s+und\s*\n(?:Sun|Gen|Li|Kan|Dui|Kiän)\s*\n/im, "");
  t = t.replace(/^err des Zeichens/, "Herr des Zeichens");
  t = t.replace(/^er Herr/, "Der Herr");
  t = t.replace(/^er Sinn/, "Der Sinn");
  t = t.replace(/^ie Neun/, "Die Neun");
  t = t.replace(/^ie Herren/, "Die Herren");
  t = t.replace(/^Di\s*\nie Herren/, "Die Herren");
  t = t.replace(/^Der ist obere Sedis con[^\n]*\n/i, "");
  t = t.replace(
    /sind die Herren\nCharakter, und die Sechs auf fünftem Platz entspricht ihr\. Die Neun auf\nzweitem Platz/,
    "sind die Herren des Zeichens. Die Neun auf zweitem Platz hat einen festen und zentralen Charakter, und die Sechs auf fünftem Platz entspricht ihr. Die Neun auf zweitem Platz",
  );
  t = t.replace(/\nDer\n(?=Die Sechs auf drittem Platz tritt)/, "; die Neun auf fünftem Platz ist der beherrschende Herr des Zeichens.\n");
  t = t.replace(/\n(?:Li|Di)\n(?=Die Sechs auf drittem Platz tritt)/, "; die Neun auf fünftem Platz ist der beherrschende Herr des Zeichens.\n");
  t = t.replace(
    /am\n(?:Der\n)?stituierende Herr des Zeichens/,
    "am äußersten Platz ganz oben steht, darum ist die obere Sechs der konstituierende Herr des Zeichens",
  );
  t = t.replace(/fünf-\nder Bewegung\s*\nten/, "fünftem Platz");
  t = t.replace(/fünf-\nten/, "fünftem");
  t = t.replace(/des Lichten wie/, "des Lichts wie");
  t = t.replace(
    /obere\n"\nnährung der Würdigen/,
    "obere Neun. Die dem Zeichen „Tiegel“ zugrunde liegende Idee ist die Ernährung der Würdigen",
  );
  t = t.replace(/\n寫[\s\S]*?(?=\nFeste ist in der Mitte)/, "\n");
  t = t.replace(/\n(?:jef|des|im-|Jan|A|ge|en|fel|d)\s*$/gim, "");
  t = t.replace(/\nryearzu[^\n]*[\s\S]*$/i, "");
  t = t.replace(/\n[^\n]*[\u0400-\u04FF][^\n]*[\s\S]*$/u, "");
  t = t.replace(/\n(?:zur Entscheidung!|Der\s*)$/i, "");
  t = t.replace(/\nDienferren[^\n]*/g, "");
  return stripTrailingOcrGarbage(t.trim());
}
/** @param {string} raw */
export function extractCommentaryImageFromImageOracleBlob(raw) {
  const t = bookQuotes(fixHyphens(raw));
  const start = t.indexOf("Der Himmel bewegt sich");
  const end = t.indexOf("\nAnfangs Sechs");
  if (start === -1 || end === -1) return "";
  return t.slice(start, end).trim();
}

/** Hex 1-style: Bemerkung + Verdoppelung before line sections. */
/** @param {string} raw */
export function extractCommentaryImageBeforeLines(raw) {
  const t = bookQuotes(fixHyphens(raw));
  const verdStart = t.indexOf("Die Verdoppelung des Zeichens");
  const lineStart = t.indexOf("\nAnfangs Neun:");
  if (verdStart === -1 || lineStart === -1) {
    return t.split("\nAnfangs Neun:")[0]?.trim() ?? t;
  }
  const bemerkung = t.slice(0, verdStart).trim();
  const verd = t.slice(verdStart, lineStart).trim();
  return `${bemerkung}\n\n${verd}`.trim();
}

/** @param {string} raw */
export function cleanCommentaryDecision(raw) {
  return cleanPassArtifacts(raw)
    .replace(/\nman\n-\n-\n(?=Vorangehen)/, "\n")
    .replace(/beständig\.\ndie Einflüsse/, "beständig die Einflüsse")
    .replace(/\nWANAN\n/, "\n")
    .replace(/\n42\.\s*$/m, "")
    .trim();
}

/** Kommentar zu den Bildern: paragraphs after DAS BILD echo (2 lines). */
/** @param {string} raw */
export function extractCommentaryImageAfterOracleEcho(raw) {
  const t = bookQuotes(fixHyphens(raw));
  const firstNl = t.indexOf("\n");
  const secondNl = firstNl === -1 ? -1 : t.indexOf("\n", firstNl + 1);
  if (secondNl === -1) return "";
  const lineStart = t.search(/\n(?:O )?Anfangs (?:Neun|Sechs)/);
  const end = lineStart === -1 ? t.length : lineStart;
  return t.slice(secondNl + 1, end).trim();
}

/** Die Reihenfolge (wing 9) — OCR cleanup common in pass02. */
/** @param {string} raw */
export function cleanSequenceWing9(raw) {
  return bookQuotes(fixHyphens(raw))
    .replace(/Erde\nAnfangs\nerfüllt/, "Erde erfüllt")
    .replace(/Zeichentri\nAnfangsschwierigkeit/, "Zeichen Anfangsschwierigkeit")
    .replace(
      /entsteht, wenn Himmel und Erde das Lichte und das Schattige sich/,
      "entsteht, wenn Himmel und Erde — das Lichte und das Schattige — sich",
    )
    .replace(/\n―\n-\s*$/, "")
    .replace(/\n-\s*$/, "")
    .trim();
}

/** @param {string} raw */
export function cleanLineBCommon(raw) {
  return cleanPassArtifacts(raw)
    .replace(/MiBerfolg/g, "Mißerfolg")
    .replace(/\n\+\n/, "\n")
    .replace(/\n""\n/, "\n")
    .replace(/\n---\s*$/, "")
    .replace(/\.in Betracht/, " in Betracht")
    .replace(/ist ⚫ zehn/, "ist — zehn")
    .replace(/Indem dawird der/, "Indem dadurch wird der")
    .replace(/Guai "der Durchbruch"/, 'Guai „der Durchbruch"')
    .trim();
}

/** @param {string} raw */
export function cleanWenYen(raw) {
  return bookQuotes(fixHyphens(raw))
    .replace(/\n2\$\nEs\n/, "\n")
    .replace(/Zur Anfangssechs:\nZu den einzelnen Linien\n/, "Zu den einzelnen Linien\n\nZur Anfangssechs:\n")
    .replace(/\n•\n(?=Wenn Himmel)/, "\n")
    .trim();
}

/** @param {number} hex */
export function loadErstesJudgmentEcho(hex) {
  return loadErstesField(hex, "judgment_oraculo");
}

/** @param {number} hex @param {string} field */
export function loadErstesField(hex, field) {
  const path = join(ROOT, `tools/manual-gold/wilhelm-de-hex-${hex}.tsv`);
  try {
    const body = readFileSync(path, "utf8");
    for (const line of body.split("\n")) {
      if (line.startsWith(`${field}\t`)) {
        const parts = line.split("\t");
        return parts[1] ?? "";
      }
    }
  } catch {
    // missing erstes tsv
  }
  return "";
}

/** @param {import('./wilhelm-de-comments-hex-starts.json')} map @param {number} hex */
export function jpgPageRangeForHex(map, hex) {
  const row = map.starts.find((s) => s.hex === hex);
  if (!row) throw new Error(`No hex start for ${hex}`);
  const end = row.endBookPage ?? row.bookPage;
  return `${row.bookPage}-${end}`;
}
