/** @typedef {"judgment"|"image"|"line"|"yongJiu"|"yongLiu"} OracleFieldKey */

/**
 * @param {import("@iching-oracle/iching-data").HexagramRecord} hex
 * @returns {Array<{ field: OracleFieldKey; linePos: number|null; label: string; order: number; text: string }>}
 */
export function runtimeHexToReviewRows(hex) {
  /** @type {Array<{ field: OracleFieldKey; linePos: number|null; label: string; order: number; text: string }>} */
  const rows = [
    { field: "judgment", linePos: null, label: "Juicio", order: 1, text: hex.judgment ?? "" },
    { field: "image", linePos: null, label: "Imagen", order: 2, text: hex.image ?? "" },
  ];
  for (let p = 1; p <= 6; p++) {
    const line = hex.lines?.find((l) => l.position === p);
    rows.push({
      field: "line",
      linePos: p,
      label: `Línea ${p}`,
      order: 2 + p,
      text: line?.text ?? "",
    });
  }
  if (hex.number === 1 || hex.yongJiu) {
    rows.push({
      field: "yongJiu",
      linePos: null,
      label: "用九",
      order: 9,
      text: hex.yongJiu ?? "",
    });
  }
  if (hex.number === 2 || hex.yongLiu) {
    rows.push({
      field: "yongLiu",
      linePos: null,
      label: "用六",
      order: 9,
      text: hex.yongLiu ?? "",
    });
  }
  return rows;
}

/**
 * @param {{ judgment?: string; image?: string; lines?: Record<number, string>; yongJiu?: string; yongLiu?: string }} gold
 * @param {number} hexNumber
 * @returns {Array<{ field: OracleFieldKey; linePos: number|null; label: string; order: number; text: string }>}
 */
export function epubGoldToReviewRows(gold, hexNumber) {
  /** @type {Array<{ field: OracleFieldKey; linePos: number|null; label: string; order: number; text: string }>} */
  const rows = [
    { field: "judgment", linePos: null, label: "Juicio", order: 1, text: gold.judgment ?? "" },
    { field: "image", linePos: null, label: "Imagen", order: 2, text: gold.image ?? "" },
  ];
  for (let p = 1; p <= 6; p++) {
    rows.push({
      field: "line",
      linePos: p,
      label: `Línea ${p}`,
      order: 2 + p,
      text: gold.lines?.[p] ?? "",
    });
  }
  if (hexNumber === 1) {
    rows.push({
      field: "yongJiu",
      linePos: null,
      label: "用九",
      order: 9,
      text: gold.yongJiu ?? "",
    });
  }
  if (hexNumber === 2) {
    rows.push({
      field: "yongLiu",
      linePos: null,
      label: "用六",
      order: 9,
      text: gold.yongLiu ?? "",
    });
  }
  return rows;
}

/**
 * @param {string} a
 * @param {string} b
 */
export function verbatimTextsEqual(a, b) {
  return String(a ?? "").trim() === String(b ?? "").trim();
}

/**
 * @param {OracleFieldKey} field
 * @param {number|null} linePos
 */
export function fieldKeyString(field, linePos) {
  if (field === "line") return `L${linePos}`;
  return field;
}
