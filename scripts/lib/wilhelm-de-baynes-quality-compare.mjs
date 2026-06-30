/**
 * Heuristic quality compare: machine-translated EN vs Baynes literal EN.
 * Not a fidelity gate — semantic overlap, structure, contamination signals only.
 */

/**
 * @param {string} text
 */
function isBadMachineTranslation(text) {
  const t = String(text ?? "");
  return (
    !t.trim() ||
    /MYMEMORY WARNING:/i.test(t) ||
    /QUERY LENGTH LIMIT EXCEEDED/i.test(t)
  );
}

const GERMAN_RESIDUE_RE =
  /\b(und|der|die|das|nicht|ist|sind|dem|den|des|ein|eine|vom|zum|bei|nach|wird|werden|schon|auch|nur|noch|wenn|dass|daß|oder|aber|wie|mit|aus|auf|für|durch|über|unter|oben|unten|Edlen|Gelingen|Beharrlichkeit|Schöpferische|Wandlungen)\b/i;

const OCR_NOISE_RE =
  /Das Buch der Wandlungen|\b\d+\*\s*$|^\d+\s+Das Buch/im;

const VERDICT_LABELS = {
  strong_align: "Alineación fuerte",
  moderate_align: "Alineación moderada",
  weak_align: "Alineación débil",
  divergent: "Divergente",
  de_only: "Solo DE",
  en_only: "Solo Baynes",
  no_baynes: "Baynes vacío",
  mt_failed: "MT falló",
  both_empty: "Vacío",
};

/**
 * @param {string} text
 */
export function normalizeForCompare(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} text
 */
function tokenSet(text) {
  const normalized = normalizeForCompare(text);
  return new Set(normalized.split(" ").filter((word) => word.length > 2));
}

/**
 * @param {string} a
 * @param {string} b
 */
export function tokenJaccard(a, b) {
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (!ta.size && !tb.size) return 1;
  if (!ta.size || !tb.size) return 0;
  let intersection = 0;
  for (const token of ta) {
    if (tb.has(token)) intersection++;
  }
  return intersection / (ta.size + tb.size - intersection);
}

/**
 * @param {{
 *   de: string;
 *   enAuto: string;
 *   enBaynes: string;
 *   classification: string;
 *   field?: string;
 * }} input
 */
export function compareWilhelmDeBaynesQuality(input) {
  const de = String(input.de ?? "");
  const enAuto = String(input.enAuto ?? "");
  const enBaynes = String(input.enBaynes ?? "");
  const classification = input.classification;

  if (classification === "both_empty") {
    return {
      verdict: "both_empty",
      label: VERDICT_LABELS.both_empty,
      score: null,
      openingScore: null,
      notes: ["Ambos campos vacíos."],
      lengths: { de: 0, enAuto: 0, enBaynes: 0 },
      lines: { de: 0, enAuto: 0, enBaynes: 0 },
    };
  }

  if (classification === "de_only") {
    return {
      verdict: "de_only",
      label: VERDICT_LABELS.de_only,
      score: null,
      openingScore: null,
      notes: ["Solo alemán — sin par Baynes (esperado en sequence / wen_yen)."],
      lengths: { de: de.trim().length, enAuto: enAuto.trim().length, enBaynes: 0 },
      lines: countLines(de, enAuto, ""),
    };
  }

  if (classification === "en_only") {
    return {
      verdict: "en_only",
      label: VERDICT_LABELS.en_only,
      score: null,
      openingScore: null,
      notes: ["Solo Baynes — falta texto DE en maestro."],
      lengths: { de: 0, enAuto: enAuto.trim().length, enBaynes: enBaynes.trim().length },
      lines: countLines("", enAuto, enBaynes),
    };
  }

  if (!enBaynes.trim()) {
    return {
      verdict: "no_baynes",
      label: VERDICT_LABELS.no_baynes,
      score: null,
      openingScore: null,
      notes: ["Baynes vacío pese a clasificación de par."],
      lengths: { de: de.trim().length, enAuto: enAuto.trim().length, enBaynes: 0 },
      lines: countLines(de, enAuto, enBaynes),
    };
  }

  if (!enAuto.trim() || isBadMachineTranslation(enAuto)) {
    return {
      verdict: "mt_failed",
      label: VERDICT_LABELS.mt_failed,
      score: null,
      openingScore: null,
      notes: ["Traducción automática vacía o no disponible en caché."],
      lengths: { de: de.trim().length, enAuto: 0, enBaynes: enBaynes.trim().length },
      lines: countLines(de, enAuto, enBaynes),
    };
  }

  const score = tokenJaccard(enAuto, enBaynes);
  const firstAuto = enAuto.split("\n").find((line) => line.trim())?.trim() ?? "";
  const firstBaynes = enBaynes.split("\n").find((line) => line.trim())?.trim() ?? "";
  const openingScore = tokenJaccard(firstAuto, firstBaynes);

  /** @type {string[]} */
  const notes = [];
  const deLen = de.trim().length;
  const baynesLen = enBaynes.trim().length;
  const lineCounts = countLines(de, enAuto, enBaynes);

  if (deLen > baynesLen * 2.5 && baynesLen > 0) {
    notes.push(
      `DE mucho más largo que Baynes (${deLen} vs ${baynesLen} chars) — posible mezcla de comentario Wilhelm en campo oráculo.`,
    );
  }

  if (GERMAN_RESIDUE_RE.test(enAuto)) {
    notes.push("Residuos alemanes en traducción automática.");
  }

  if (OCR_NOISE_RE.test(de)) {
    notes.push("Ruido OCR en texto DE (footer / paginación).");
  }

  if (lineCounts.de > lineCounts.enBaynes + 3 && lineCounts.enBaynes > 0) {
    notes.push(
      `Estructura: DE ${lineCounts.de} líneas vs Baynes ${lineCounts.enBaynes} (MT: ${lineCounts.enAuto}).`,
    );
  }

  if (openingScore >= 0.35) {
    notes.push(`Primera línea alineada (Jaccard ${pct(openingScore)}).`);
  } else if (firstBaynes.length > 10) {
    notes.push(`Primera línea poco alineada (Jaccard ${pct(openingScore)}).`);
  }

  if (score >= 0.45) {
    notes.push(`Solapamiento léxico alto MT↔Baynes (${pct(score)}).`);
  } else if (score >= 0.2) {
    notes.push(`Solapamiento léxico moderado MT↔Baynes (${pct(score)}).`);
  } else {
    notes.push(`Solapamiento léxico bajo MT↔Baynes (${pct(score)}).`);
  }

  let verdict = "divergent";
  if (score >= 0.45) verdict = "strong_align";
  else if (score >= 0.25) verdict = "moderate_align";
  else if (score >= 0.12) verdict = "weak_align";

  if (notes.some((note) => note.includes("mezcla de comentario") || note.includes("OCR"))) {
    if (verdict === "strong_align") verdict = "moderate_align";
  }

  return {
    verdict,
    label: VERDICT_LABELS[verdict] ?? verdict,
    score: round3(score),
    openingScore: round3(openingScore),
    notes,
    lengths: {
      de: deLen,
      enAuto: enAuto.trim().length,
      enBaynes: baynesLen,
    },
    lines: lineCounts,
  };
}

/**
 * @param {string} de
 * @param {string} enAuto
 * @param {string} enBaynes
 */
function countLines(de, enAuto, enBaynes) {
  const count = (text) => String(text ?? "").split("\n").filter((line) => line.trim()).length;
  return { de: count(de), enAuto: count(enAuto), enBaynes: count(enBaynes) };
}

/**
 * @param {number} value
 */
function round3(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * @param {number} value
 */
function pct(value) {
  return `${Math.round(value * 100)}%`;
}

/**
 * @param {Array<{ compare?: { verdict?: string } }>} rows
 */
export function summarizeQualityVerdicts(rows) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const row of rows) {
    const verdict = row.compare?.verdict ?? "unknown";
    counts[verdict] = (counts[verdict] ?? 0) + 1;
  }
  return counts;
}
