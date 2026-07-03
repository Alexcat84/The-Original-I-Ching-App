/**
 * Canonical field map: Wilhelm Baynes EN comments → Wilhelm DE 1924 Ten Wings maestro.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./wilhelm-comments-manual-fields.mjs";
import {
  classifyEnDePair,
  resolveDeFieldValue,
} from "./wilhelm-baynes-de-field-map.mjs";
import { WILHELM_DE_COMMENTS_MERGED } from "./wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const EN_COMMENTS = join(
  ROOT,
  "tools/datasets/wilhelm/comments/wilhelm-64hex-comments-parsed.json",
);

/** @type {Record<string, string>} */
const SECTION_TITLES = {
  meta: "Identidad",
  preface: "Prefacio (Wen Wang)",
  sequence: "Secuencia (Shuo Gua)",
  tsa_kua: "Notas misc / Tsa Kua",
  judgment_echo: "Eco del juicio",
  tuan: "Comentario a la decisión (Tuan)",
  image_echo: "Eco de la imagen",
  da_xiang: "Gran imagen (Ta Hsiang)",
  lines_l1: "Línea 1",
  lines_l2: "Línea 2",
  lines_l3: "Línea 3",
  lines_l4: "Línea 4",
  lines_l5: "Línea 5",
  lines_l6: "Línea 6",
  yong: "Yong (用九 / 用六)",
  wen_yen: "Wen Yen",
};

/** @type {Array<{ id: string; title: string; subtitle?: string; fields: string[] }>} */
export const WILHELM_COMMENTS_FIELD_BLOCKS = (() => {
  /** @type {Map<string, string[]>} */
  const bySection = new Map();
  for (const { key, section } of WILHELM_COMMENTS_MANUAL_FIELDS) {
    if (!bySection.has(section)) bySection.set(section, []);
    bySection.get(section).push(key);
  }
  return [...bySection.entries()].map(([id, fields]) => ({
    id,
    title: SECTION_TITLES[id] ?? id,
    subtitle: "Ten Wings / Drittes Buch",
    fields,
  }));
})();

export const WILHELM_COMMENTS_FIELD_ORDER = WILHELM_COMMENTS_FIELD_BLOCKS.flatMap(
  (block) => block.fields,
);

/**
 * @param {{ hex?: number; deMaestroPath?: string; enMaestroPath?: string }} [options]
 */
export async function buildWilhelmCommentsEnDeRows(options = {}) {
  const dePath = options.deMaestroPath ?? WILHELM_DE_COMMENTS_MERGED;
  const enPath = options.enMaestroPath ?? EN_COMMENTS;
  const deMaestro = JSON.parse(await readFile(dePath, "utf8"));
  const enMaestro = JSON.parse(await readFile(enPath, "utf8"));

  /** @type {Array<object>} */
  const rows = [];

  for (const block of WILHELM_COMMENTS_FIELD_BLOCKS) {
    for (const fieldKey of block.fields) {
      for (let hex = 1; hex <= 64; hex++) {
        if (options.hex && hex !== options.hex) continue;

        const enFields = enMaestro.hexagrams[String(hex)]?.fields ?? {};
        const deFields = deMaestro.hexagrams[String(hex)]?.fields ?? {};
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

export function summarizeWilhelmCommentsEnDeRows(rows) {
  return {
    total: rows.length,
    blocks: WILHELM_COMMENTS_FIELD_BLOCKS.length,
    fieldsPerHex: WILHELM_COMMENTS_FIELD_ORDER.length,
    pair: rows.filter((r) => r.classification === "pair").length,
    en_only: rows.filter((r) => r.classification === "en_only").length,
    de_only: rows.filter((r) => r.classification === "de_only").length,
    both_empty: rows.filter((r) => r.classification === "both_empty").length,
  };
}
