import { similarityHint, textsMatch, textsMatchStrict, wilhelmImageOracleOnly } from "./hexagram-fidelity-normalize.mjs";

/**
 * @typedef {"match"|"mismatch"|"missing_gold"|"missing_bundle"|"skipped"} DiffStatus
 */

/**
 * @param {object} args
 * @param {string} args.translator
 * @param {number} args.hex
 * @param {string} args.field
 * @param {number|null} args.linePos
 * @param {string} args.expected
 * @param {string} args.actual
 * @param {string} [args.note]
 * @param {boolean} [args.strict]
 */
export function makeDiff(args) {
  const { translator, hex, field, linePos, note, strict = false } = args;
  let expected = args.expected;
  let actual = args.actual;
  if (translator === "wilhelm" && field === "image") {
    expected = wilhelmImageOracleOnly(expected);
    actual = wilhelmImageOracleOnly(actual);
  }
  const expEmpty = !String(expected ?? "").trim();
  const actEmpty = !String(actual ?? "").trim();

  // Both sides empty is not evidence of a verified match — it means gold extraction
  // found nothing AND the bundle has nothing, which textsMatch("","") would otherwise
  // silently score as "exact". Flag it instead so a real content gap (bundle empty
  // because the ingester mirrored an empty gold field) can never hide behind 100%.
  let status;
  let hint;
  if (expEmpty && actEmpty) {
    status = "missing_gold";
    hint = "both_empty";
  } else {
    const match = strict
      ? textsMatchStrict(expected, actual, translator)
      : textsMatch(expected, actual, translator);
    hint = similarityHint(expected, actual, translator);
    status = "mismatch";
    if (match) status = "match";
    else if (hint === "missing_in_gold") status = "missing_gold";
    else if (hint === "missing_in_bundle") status = "missing_bundle";
  }

  return {
    translator,
    hex,
    field,
    linePos: linePos ?? null,
    status,
    hint,
    expected: expected ?? "",
    actual: actual ?? "",
    ...(note ? { note } : {}),
  };
}

export function summarizeDiffs(diffs) {
  const summary = {
    total: diffs.length,
    match: 0,
    mismatch: 0,
    missing_gold: 0,
    missing_bundle: 0,
    skipped: 0,
  };
  for (const d of diffs) {
    summary[d.status] = (summary[d.status] ?? 0) + 1;
  }
  summary.matchPct =
    summary.total > 0
      ? Number(((summary.match / summary.total) * 100).toFixed(2))
      : 0;
  return summary;
}

export function bundleHexToFields(hex, translator) {
  const fields = [];
  fields.push({ field: "judgment", linePos: null, actual: hex.judgment ?? "" });
  fields.push({ field: "image", linePos: null, actual: hex.image ?? "" });
  for (const line of hex.lines ?? []) {
    fields.push({
      field: "line",
      linePos: line.position,
      actual: line.text ?? "",
    });
  }
  if (hex.yongJiu) {
    fields.push({ field: "yongJiu", linePos: null, actual: hex.yongJiu });
  }
  if (hex.yongLiu) {
    fields.push({ field: "yongLiu", linePos: null, actual: hex.yongLiu });
  }
  return fields;
}

export function goldWilhelmFields(gold) {
  const fields = [
    { field: "judgment", linePos: null, expected: gold.judgment ?? "" },
    { field: "image", linePos: null, expected: gold.image ?? "" },
  ];
  for (let p = 1; p <= 6; p++) {
    fields.push({ field: "line", linePos: p, expected: gold.lines?.[p] ?? "" });
  }
  if (gold.yongJiu) fields.push({ field: "yongJiu", linePos: null, expected: gold.yongJiu });
  if (gold.yongLiu) fields.push({ field: "yongLiu", linePos: null, expected: gold.yongLiu });
  return fields;
}

export function goldLeggeFields(gold) {
  const fields = [
    { field: "judgment", linePos: null, expected: gold.judgment ?? "" },
    { field: "image", linePos: null, expected: gold.image ?? "" },
  ];
  for (let p = 1; p <= 6; p++) {
    fields.push({ field: "line", linePos: p, expected: gold.lines?.[p] ?? "" });
  }
  if (gold.supernumerary) {
    fields.push({
      field: hexUsesYongJiu(gold.hex) ? "yongJiu" : "yongLiu",
      linePos: null,
      expected: gold.supernumerary,
    });
  }
  return fields;
}

function hexUsesYongJiu(hex) {
  return hex === 1;
}

export function goldZhouYiFields(gold, hexNumber) {
  const fields = [
    { field: "judgment", linePos: null, expected: gold.judgment ?? "" },
  ];
  if (gold.image != null) {
    fields.push({ field: "image", linePos: null, expected: gold.image });
  }
  for (let p = 1; p <= 6; p++) {
    fields.push({ field: "line", linePos: p, expected: gold.lines?.[p] ?? "" });
  }
  if (gold.yongJiu) fields.push({ field: "yongJiu", linePos: null, expected: gold.yongJiu });
  if (gold.yongLiu) fields.push({ field: "yongLiu", linePos: null, expected: gold.yongLiu });
  if (hexNumber === 1 && !gold.yongJiu) {
    fields.push({ field: "yongJiu", linePos: null, expected: "", note: "optional" });
  }
  if (hexNumber === 2 && !gold.yongLiu) {
    fields.push({ field: "yongLiu", linePos: null, expected: "", note: "optional" });
  }
  return fields;
}
