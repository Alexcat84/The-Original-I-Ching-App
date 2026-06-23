/**
 * Vertical field order for Legge appendix manual audit (Sheets export).
 */

export const LEGGE_APPENDIX_BLOCK_FIN = "block_fin";

/** @type {readonly { key: string; label: string }[]} */
export const LEGGE_APPENDIX_SECTION_FIELDS = [
  { key: "appendix_id", label: "appendix_id" },
  { key: "section_id", label: "section_id" },
  { key: "appendix_heading", label: "appendix_heading" },
  { key: "section_title", label: "section_title" },
  { key: "content", label: "content" },
  { key: "footnotes", label: "footnotes" },
];

/** @type {readonly { key: string; label: string }[]} */
export const LEGGE_APPENDIX_SYMBOLISM_FIELDS = [
  { key: "hex", label: "hex" },
  { key: "image", label: "image" },
  { key: "L1", label: "L1" },
  { key: "L2", label: "L2" },
  { key: "L3", label: "L3" },
  { key: "L4", label: "L4" },
  { key: "L5", label: "L5" },
  { key: "L6", label: "L6" },
  { key: "L7", label: "L7" },
];

export const LEGGE_APPENDIX_HEX_FIN = "hex_fin";

/**
 * @param {Record<string, string>} fields
 * @returns {string[][]}
 */
export function buildLeggeAppendixSectionBlock(fields) {
  /** @type {string[][]} */
  const out = [];
  for (const field of LEGGE_APPENDIX_SECTION_FIELDS) {
    out.push([field.key, fields[field.key] ?? ""]);
  }
  out.push([LEGGE_APPENDIX_BLOCK_FIN, ""]);
  return out;
}

/**
 * @param {Record<string, string>} fields
 * @returns {string[][]}
 */
export function buildLeggeAppendixSymbolismBlock(fields) {
  /** @type {string[][]} */
  const out = [];
  for (const field of LEGGE_APPENDIX_SYMBOLISM_FIELDS) {
    if (field.key === "L7" && !fields.L7?.trim()) continue;
    out.push([field.key, fields[field.key] ?? ""]);
  }
  out.push([LEGGE_APPENDIX_HEX_FIN, ""]);
  return out;
}

/**
 * @param {import("./legge-appendix-txt.mjs").parseLeggeAppendixTxt extends (...args: never) => infer R ? R : never} parsed
 */
export function buildLeggeAppendixSectionExportRows(parsed) {
  /** @type {string[][]} */
  const rows = [];

  for (const app of parsed.appendices) {
    if (app.sections.length) {
      for (const sec of app.sections) {
        rows.push(
          ...buildLeggeAppendixSectionBlock({
            appendix_id: app.id,
            section_id: sec.id,
            appendix_heading: app.heading ?? "",
            section_title: sec.title ?? "",
            content: sec.content ?? "",
            footnotes: sec.footnotes ?? "",
          }),
        );
      }
    } else {
      rows.push(
        ...buildLeggeAppendixSectionBlock({
          appendix_id: app.id,
          section_id: "main",
          appendix_heading: app.heading ?? "",
          section_title: app.heading ?? "",
          content: app.content ?? "",
          footnotes: app.footnotes ?? "",
        }),
      );
    }
  }

  return rows;
}

/**
 * @param {import("./legge-appendix-txt.mjs").parseLeggeAppendixTxt extends (...args: never) => infer R ? R : never} parsed
 */
export function buildLeggeAppendixSymbolismExportRows(parsed) {
  /** @type {string[][]} */
  const rows = [];
  const appII = parsed.appendices.find((a) => a.roman === "II");
  if (!appII) return rows;

  /** @type {Array<{ hex: number; image: string; lineNotes: Record<number, string> }>} */
  const entries = [];
  for (const sec of appII.sections) {
    for (const entry of sec.symbolismHex ?? []) entries.push(entry);
  }
  entries.sort((a, b) => a.hex - b.hex);

  for (const entry of entries) {
    /** @type {Record<string, string>} */
    const fields = {
      hex: String(entry.hex),
      image: entry.image ?? "",
      L1: entry.lineNotes?.[1] ?? "",
      L2: entry.lineNotes?.[2] ?? "",
      L3: entry.lineNotes?.[3] ?? "",
      L4: entry.lineNotes?.[4] ?? "",
      L5: entry.lineNotes?.[5] ?? "",
      L6: entry.lineNotes?.[6] ?? "",
    };
    if (entry.lineNotes?.[7]?.trim()) {
      fields.L7 = entry.lineNotes[7];
    }
    rows.push(...buildLeggeAppendixSymbolismBlock(fields));
  }

  return rows;
}
