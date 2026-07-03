/**
 * Heuristic EN (Baynes base) ↔ DE literal compare — no MT column required.
 */

const OCR_NOISE_RE =
  /Das Buch der Wandlungen|\b\d+\*\s*$|^\d+\s+Das Buch/im;

/** Non-Latin letters / stray scripts often from JPG OCR */
const OCR_SCRIPT_NOISE_RE =
  /[^\u0000-\u024F\u1E00-\u1EFF\s.,;:!?…"'«»()\[\]{}\-—–\n\r\t\d/\\]/;

const EXACT_MATCH_FIELDS = new Set(["hex", "chinese", "hex_font"]);

const LABEL_FIELDS = new Set([
  ...[1, 2, 3, 4, 5, 6].map((n) => `L${n}_etiqueta`),
  "yong_etiqueta",
]);

const TRIGRAM_FIELDS = new Set(["trigrama_arriba", "trigrama_abajo"]);

const VERDICT_LABELS = {
  exact: "Coincidencia exacta",
  meta_ok: "Metadato OK",
  meta_drift: "Metadato distinto",
  label_pair: "Par etiqueta (idiomas distintos)",
  structure_ok: "Estructura similar",
  structure_drift: "Estructura distinta",
  en_only: "Solo EN (falta DE)",
  de_only: "Solo DE (falta EN)",
  both_empty: "Vacío en ambos",
  title_pair: "Título (DE vs EN)",
};

/**
 * @param {string} text
 */
function countLines(text) {
  return String(text ?? "")
    .split("\n")
    .filter((line) => line.trim()).length;
}

/**
 * @param {string} field
 */
function fieldKind(field) {
  if (EXACT_MATCH_FIELDS.has(field)) return "exact";
  if (field === "nombre") return "title";
  if (field === "chinese_roman") return "roman";
  if (LABEL_FIELDS.has(field)) return "label";
  if (TRIGRAM_FIELDS.has(field)) return "trigram";
  if (field.endsWith("_oraculo")) return "oracle";
  if (field.endsWith("_comentario") || field === "intro") return "commentary";
  return "text";
}

/**
 * @param {{
 *   en: string;
 *   de: string;
 *   field: string;
 *   classification: string;
 * }} input
 */
export function compareWilhelmEnDeField(input) {
  const en = String(input.en ?? "");
  const de = String(input.de ?? "");
  const field = input.field;
  const classification = input.classification;
  const kind = fieldKind(field);

  if (classification === "both_empty") {
    return {
      verdict: "both_empty",
      label: VERDICT_LABELS.both_empty,
      notes: ["Sin contenido en EN ni DE."],
    };
  }

  if (classification === "en_only") {
    return {
      verdict: "en_only",
      label: VERDICT_LABELS.en_only,
      notes: ["Baynes tiene texto; maestro DE vacío en este campo."],
    };
  }

  if (classification === "de_only") {
    return {
      verdict: "de_only",
      label: VERDICT_LABELS.de_only,
      notes: ["Maestro DE tiene texto; Baynes vacío en este campo."],
    };
  }

  /** @type {string[]} */
  const notes = [];
  const enLen = en.trim().length;
  const deLen = de.trim().length;
  const enLines = countLines(en);
  const deLines = countLines(de);

  if (kind === "exact") {
    const ok = en.trim() === de.trim();
    return {
      verdict: ok ? "exact" : "meta_drift",
      label: ok ? VERDICT_LABELS.exact : VERDICT_LABELS.meta_drift,
      notes: ok ? ["Valor idéntico."] : [`EN: "${en.trim()}" · DE: "${de.trim()}"`],
    };
  }

  if (kind === "title") {
    return {
      verdict: "title_pair",
      label: VERDICT_LABELS.title_pair,
      notes: [
        "Título en idiomas distintos (Baynes EN vs Wilhelm DE) — comparar sentido, no literalidad.",
      ],
    };
  }

  if (kind === "roman") {
    const norm = (s) => s.toUpperCase().replace(/\s+/g, " ").trim();
    const ok = norm(en) === norm(de);
    return {
      verdict: ok ? "meta_ok" : "meta_drift",
      label: ok ? VERDICT_LABELS.meta_ok : VERDICT_LABELS.meta_drift,
      notes: ok ? ["Romanización alineada."] : [`EN: ${norm(en)} · DE: ${norm(de)}`],
    };
  }

  if (kind === "label") {
    return {
      verdict: "label_pair",
      label: VERDICT_LABELS.label_pair,
      notes: ["Etiqueta DE vs EN — distinto idioma; alinear por posición de línea."],
    };
  }

  if (kind === "trigram") {
    const enHasDe = /\b(das|der|die|des|oben|unten)\b/i.test(de);
    notes.push(
      enHasDe
        ? "Trigrama DE aún en inglés en maestro — revisar build/runtime."
        : "Trigrama DE en alemán vs Baynes EN — comparar sentido.",
    );
    return {
      verdict: "meta_ok",
      label: VERDICT_LABELS.meta_ok,
      notes,
    };
  }

  if (OCR_NOISE_RE.test(de)) {
    notes.push("Posible ruido OCR en DE (footer / paginación).");
  }
  if (OCR_SCRIPT_NOISE_RE.test(de)) {
    notes.push("Caracteres no latinos en DE — probable error OCR (revisar contra JPG).");
  }

  const lineDelta = Math.abs(enLines - deLines);
  if (lineDelta <= 1 && enLines > 0) {
    notes.push(`Estructura: ${enLines} líneas EN ≈ ${deLines} DE.`);
  } else if (enLines > 0 || deLines > 0) {
    notes.push(`Estructura: ${enLines} líneas EN vs ${deLines} DE.`);
  }

  if (deLen > enLen * 2.5 && enLen > 40) {
    notes.push(
      `DE mucho más largo (${deLen} vs ${enLen} chars) — posible mezcla de comentario Wilhelm en campo oracular.`,
    );
  } else if (enLen > deLen * 2.5 && deLen > 40) {
    notes.push(`EN más largo (${enLen} vs ${deLen} chars).`);
  }

  notes.push("Comparación directa DE↔EN — revisar sentido manualmente (sin MT automática).");

  const structureOk =
    lineDelta <= 2 &&
    !(deLen > enLen * 2.5 && enLen > 40) &&
    !notes.some((n) => n.includes("OCR"));

  return {
    verdict: structureOk ? "structure_ok" : "structure_drift",
    label: structureOk ? VERDICT_LABELS.structure_ok : VERDICT_LABELS.structure_drift,
    notes,
    lengths: { en: enLen, de: deLen },
    lines: { en: enLines, de: deLines },
  };
}

/**
 * @param {Array<{ compare?: { verdict?: string } }>} rows
 */
export function summarizeEnDeQualityVerdicts(rows) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const row of rows) {
    const verdict = row.compare?.verdict ?? "unknown";
    counts[verdict] = (counts[verdict] ?? 0) + 1;
  }
  return counts;
}
