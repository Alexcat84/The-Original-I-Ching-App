/**
 * Canonical field map: Wilhelm Baynes EN maestro (base) → Wilhelm DE 1924 literal.
 * Every key in tools/datasets/wilhelm-baynes/book-one/wilhelm-64hex-parsed.json is included.
 */
import { readFile } from "node:fs/promises";
import {
  WILHELM_DE_BOOK_ONE_MERGED,
  WILHELM_BAYNES_BOOK_ONE_PARSED,
} from "./wilhelm-de-dataset-paths.mjs";

/** @type {Array<{ id: string; title: string; subtitle?: string; fields: string[] }>} */
export const WILHELM_BAYNES_FIELD_BLOCKS = [
  {
    id: "identity",
    title: "Identidad",
    subtitle: "hex · nombre · hanzi · romanización · glifo · trigramas",
    fields: [
      "hex",
      "nombre",
      "chinese",
      "chinese_roman",
      "hex_font",
      "trigrama_arriba",
      "trigrama_abajo",
    ],
  },
  {
    id: "intro",
    title: "Introducción",
    subtitle: "Erstes Buch — contexto del hexagrama",
    fields: ["intro"],
  },
  {
    id: "judgment_oracle",
    title: "Das Urteil",
    subtitle: "Texto oracular",
    fields: ["judgment_oraculo"],
  },
  {
    id: "judgment_commentary",
    title: "Das Urteil",
    subtitle: "Comentario Wilhelm (libro I)",
    fields: ["judgment_comentario"],
  },
  {
    id: "image_oracle",
    title: "Das Bild",
    subtitle: "Texto oracular",
    fields: ["image_oraculo"],
  },
  {
    id: "image_commentary",
    title: "Das Bild",
    subtitle: "Comentario Wilhelm (libro I)",
    fields: ["image_comentario"],
  },
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
    {
      id: `line_${n}_etiqueta`,
      title: `Línea ${n}`,
      subtitle: "Etiqueta",
      fields: [`L${n}_etiqueta`],
    },
    {
      id: `line_${n}_oraculo`,
      title: `Línea ${n}`,
      subtitle: "Oráculo",
      fields: [`L${n}_oraculo`],
    },
    {
      id: `line_${n}_comentario`,
      title: `Línea ${n}`,
      subtitle: "Comentario Wilhelm (libro I)",
      fields: [`L${n}_comentario`],
    },
  ]),
  {
    id: "yong_etiqueta",
    title: "Yong (用九 / 用六)",
    subtitle: "Etiqueta",
    fields: ["yong_etiqueta"],
  },
  {
    id: "yong_oraculo",
    title: "Yong (用九 / 用六)",
    subtitle: "Texto oracular",
    fields: ["yong_oraculo"],
  },
  {
    id: "yong_comentario",
    title: "Yong (用九 / 用六)",
    subtitle: "Comentario Wilhelm (libro I)",
    fields: ["yong_comentario"],
  },
];

export const WILHELM_BAYNES_FIELD_ORDER = WILHELM_BAYNES_FIELD_BLOCKS.flatMap(
  (block) => block.fields,
);

/**
 * @param {string} enText
 * @param {string} deText
 */
export function classifyEnDePair(enText, deText) {
  const en = String(enText ?? "").trim().length > 0;
  const de = String(deText ?? "").trim().length > 0;
  if (en && de) return "pair";
  if (en && !de) return "en_only";
  if (!en && de) return "de_only";
  return "both_empty";
}

/**
 * @param {Record<string, string>} deFields
 * @param {string} fieldKey
 */
export function resolveDeFieldValue(deFields, fieldKey) {
  return String(deFields[fieldKey] ?? "");
}

/**
 * @param {{ hex?: number; deMaestroPath?: string }} [options]
 */
export async function buildWilhelmBaynesDeRows(options = {}) {
  const dePath = options.deMaestroPath ?? WILHELM_DE_BOOK_ONE_MERGED;
  const deOracle = JSON.parse(await readFile(dePath, "utf8"));
  const baynesMaestro = JSON.parse(await readFile(WILHELM_BAYNES_BOOK_ONE_PARSED, "utf8"));

  /** @type {Array<object>} */
  const rows = [];

  for (const block of WILHELM_BAYNES_FIELD_BLOCKS) {
    for (const fieldKey of block.fields) {
      for (let hex = 1; hex <= 64; hex++) {
        if (options.hex && hex !== options.hex) continue;

        const enFields = baynesMaestro.hexagrams[String(hex)]?.fields ?? {};
        const deFields = deOracle.hexagrams[String(hex)]?.fields ?? {};
        const en = String(enFields[fieldKey] ?? "");
        const de = resolveDeFieldValue(deFields, fieldKey);

        rows.push({
          blockId: block.id,
          blockTitle: block.title,
          blockSubtitle: block.subtitle ?? "",
          field: fieldKey,
          hex,
          classification: classifyEnDePair(en, de),
          en,
          de,
        });
      }
    }
  }

  return rows;
}

export function summarizeWilhelmBaynesDeRows(rows) {
  return {
    total: rows.length,
    blocks: WILHELM_BAYNES_FIELD_BLOCKS.length,
    fieldsPerHex: WILHELM_BAYNES_FIELD_ORDER.length,
    pair: rows.filter((r) => r.classification === "pair").length,
    en_only: rows.filter((r) => r.classification === "en_only").length,
    de_only: rows.filter((r) => r.classification === "de_only").length,
    both_empty: rows.filter((r) => r.classification === "both_empty").length,
  };
}
