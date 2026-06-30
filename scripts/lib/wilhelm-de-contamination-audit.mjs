/**
 * Line-by-line DE vs Baynes EN contamination audit.
 * Targets editorial bleed, commentary in oracle slots, footers, header duplication — not MT fidelity.
 */
import { isWilhelmDeCommentaryStart } from "./wilhelm-de-commentary-markers.mjs";

/** @typedef {"clean"|"review"|"contaminated"|"de_book_extra"|"empty"} ContaminationLevel */

/** @type {RegExp[]} */
export const EDITORIAL_LINE_RES = [
  /^Bemerkung\s*:/i,
  /^Anmerkung\s*:/i,
  /^Vorbemerkung\s*:/i,
  /^Buchempfehlung/i,
  /^Klärung des Kungtse/i,
  /^klärung des Kungtse/i,
  /^Kungtse sagt/i,
  /^~~~~+/,
];

/** @type {RegExp[]} */
export const PAGINATION_NOISE_RES = [
  /Das Buch der Wandlungen/i,
  /^\d+\*\s*$/,
  /^\d+\s+Das Buch/i,
  /^S\.\s*\d+/i,
  /^ZWEITES BUCH/i,
  /^DRITTES BUCH/i,
];

/** @type {RegExp[]} */
export const INTRO_STRUCTURE_RES = [
  /^\d+\.\s+[A-Za-zÄÖÜäöüß]/,
  /^DAS [A-ZÄÖÜß\s()]+$/,
  /^oben [A-Za-zÄÖÜäöüß]+,\s+das/i,
  /^unten [A-Za-zÄÖÜäöüß]+,\s+das/i,
  /^Das Zeichen besteht aus/i,
];

/** Oracle slots must not contain Wilhelm book-I commentary prose. */
const ORACLE_FIELDS = new Set([
  "judgment_oraculo",
  "image_oraculo",
  ...Array.from({ length: 6 }, (_, i) => `L${i + 1}_oraculo`),
  "yong_oraculo",
]);

const COMMENTARY_FIELDS = new Set([
  "judgment_comentario",
  "image_comentario",
  ...Array.from({ length: 6 }, (_, i) => `L${i + 1}_comentario`),
  "yong_comentario",
]);

/**
 * @param {string} text
 */
export function splitLines(text) {
  return String(text ?? "")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * @param {string} line
 */
export function classifyDeLine(line) {
  const t = String(line ?? "").trim();
  if (!t) return { tag: "empty", label: "vacío" };

  if (/^Buchempfehlung\s*$/i.test(t) || /^\d+\*\s*$/.test(t) || /^S\.\s*\d+\s*$/.test(t)) {
    return { tag: "parse_noise", label: "footer/paginación" };
  }
  if (/^Das Buch der Wandlungen\s*$/i.test(t) || /^\d+\s+Das Buch der Wandlungen/i.test(t)) {
    return { tag: "parse_noise", label: "footer libro" };
  }
  if (EDITORIAL_LINE_RES.some((re) => re.test(t))) {
    return { tag: "editorial", label: "texto editorial Wilhelm (Bemerkung, etc.)" };
  }
  if (/^[¹²³⁴⁵⁶⁷⁸⁹⁰]+\s/.test(t) || /^[0-9]+\)\s/.test(t)) {
    return { tag: "footnote", label: "nota al pie" };
  }
  if (isWilhelmDeCommentaryStart(t)) {
    return { tag: "commentary", label: "inicio comentario Wilhelm" };
  }
  if (INTRO_STRUCTURE_RES.some((re) => re.test(t))) {
    return { tag: "intro_structure", label: "cabecera/trigrama/intro libro" };
  }
  if (t.length > 220 && /(?:Der Edle|Indem |So |Darum |Deshalb |Es handelt sich|Wenn man )/.test(t)) {
    return { tag: "commentary_prose", label: "prosa comentario (heurística)" };
  }
  return { tag: "oracle_or_neutral", label: "texto oracular / neutro" };
}

/**
 * @param {string} field
 */
function fieldKind(field) {
  if (ORACLE_FIELDS.has(field)) return "oracle";
  if (COMMENTARY_FIELDS.has(field)) return "commentary";
  if (field === "intro") return "intro";
  return "meta";
}

/**
 * @param {{
 *   hex: number;
 *   field: string;
 *   de: string;
 *   en: string;
 *   classification: string;
 * }} input
 */
export function auditWilhelmDeContamination(input) {
  const deLines = splitLines(input.de);
  const enLines = splitLines(input.en);
  const kind = fieldKind(input.field);

  /** @type {Array<{ lineNo: number; text: string; tag: string; label: string; severity: string }>} */
  const deLineAudit = deLines.map((text, i) => {
    const { tag, label } = classifyDeLine(text);
    let severity = "ok";

    if (tag === "parse_noise") severity = "error";
    else if (kind === "oracle" && (tag === "editorial" || tag === "commentary" || tag === "commentary_prose")) {
      severity = "error";
    } else if (kind === "oracle" && tag === "intro_structure") severity = "error";
    else if (kind === "oracle" && tag === "footnote") severity = "warn";
    else if (kind === "commentary" && tag === "parse_noise") severity = "error";
    else if (kind === "commentary" && tag === "editorial") severity = "info";
    else if (kind === "intro" && tag === "editorial") severity = "info";
    else if (kind === "intro" && tag === "parse_noise") severity = "error";

    return { lineNo: i + 1, text, tag, label, severity };
  });

  const errors = deLineAudit.filter((l) => l.severity === "error");
  const warns = deLineAudit.filter((l) => l.severity === "warn");
  const editorialInIntro = kind === "intro" ? deLineAudit.filter((l) => l.tag === "editorial") : [];
  const editorialInCommentary =
    kind === "commentary" ? deLineAudit.filter((l) => l.tag === "editorial") : [];

  /** @type {string[]} */
  const notes = [];

  if (input.classification === "en_only") {
    notes.push("Falta texto DE — Baynes tiene contenido.");
  }
  if (input.classification === "de_only") {
    notes.push("Solo DE — sin par Baynes (puede ser contenido libro alemán).");
  }

  if (kind === "oracle" && deLines.length > enLines.length + 1 && enLines.length > 0) {
    notes.push(
      `Oráculo: ${deLines.length} líneas DE vs ${enLines.length} EN — posible texto extra en DE.`,
    );
  }

  if (kind === "oracle" && deLines.length > 0 && enLines.length === 0) {
    notes.push("Oráculo DE con texto pero Baynes vacío.");
  }

  const deChars = input.de.trim().length;
  const enChars = input.en.trim().length;
  if (kind === "oracle" && deChars > enChars * 2.2 && enChars > 20) {
    notes.push(`Oráculo DE ${deChars} chars vs EN ${enChars} — sospecha mezcla comentario.`);
  }

  if (editorialInIntro.length) {
    notes.push(
      `${editorialInIntro.length} línea(s) editorial(es) en intro — válido en libro DE 1924, ausente en Baynes.`,
    );
  }

  if (editorialInCommentary.length) {
    notes.push(
      `${editorialInCommentary.length} Bemerkung/anotación en comentario — válido en Wilhelm DE, revisar si Baynes omitió.`,
    );
  }

  if (kind === "intro" && deLines.length > enLines.length + 2 && enLines.length > 0) {
    notes.push(
      `Intro: ${deLines.length} líneas DE vs ${enLines.length} EN — posible bloque extra (cabecera/trigrama/editorial).`,
    );
  }

  /** @type {ContaminationLevel} */
  let level = "clean";

  if (errors.length) level = "contaminated";
  else if (warns.length || notes.some((n) => n.includes("posible texto extra"))) level = "review";
  else if (editorialInIntro.length && kind === "intro") level = "de_book_extra";
  else if (editorialInCommentary.length && kind === "commentary") level = "de_book_extra";
  else if (
    kind === "intro" &&
    deLines.length > enLines.length + 2 &&
    enLines.length > 0
  ) {
    level = "review";
  }
  else if (!deLines.length && !enLines.length) level = "empty";

  return {
    level,
    kind,
    deLineCount: deLines.length,
    enLineCount: enLines.length,
    deLines: deLineAudit,
    enLines: enLines.map((text, i) => ({ lineNo: i + 1, text })),
    errorCount: errors.length,
    warnCount: warns.length,
    notes,
    flags: {
      parseNoise: deLineAudit.some((l) => l.tag === "parse_noise"),
      editorialInOracle: kind === "oracle" && deLineAudit.some((l) => l.tag === "editorial"),
      commentaryInOracle:
        kind === "oracle" &&
        deLineAudit.some((l) => l.tag === "commentary" || l.tag === "commentary_prose"),
      editorialInIntro: editorialInIntro.length > 0,
      extraDeLines: kind === "oracle" && deLines.length > enLines.length + 1 && enLines.length > 0,
    },
  };
}

/**
 * @param {Array<{ audit?: { level?: string } }>} rows
 */
export function summarizeContamination(rows) {
  /** @type {Record<string, number>} */
  const byLevel = {};
  /** @type {Record<string, number>} */
  const byField = {};
  for (const row of rows) {
    const level = row.audit?.level ?? "unknown";
    byLevel[level] = (byLevel[level] ?? 0) + 1;
    if (level === "contaminated" || level === "review") {
      byField[row.field] = (byField[row.field] ?? 0) + 1;
    }
  }
  return { byLevel, byField };
}
