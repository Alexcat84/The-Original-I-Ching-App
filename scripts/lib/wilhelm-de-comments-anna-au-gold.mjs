/**
 * Wilhelm DE comments — AU gold from JPG (book-primary over Anna dual-pass).
 */
import { readFileSync } from "node:fs";
import { normalizeWilhelmDeTxtText } from "./wilhelm-de-64hex-txt.mjs";
import {
  WILHELM_COMMENTS_HEX_FIN,
  WILHELM_COMMENTS_MANUAL_FIELDS,
} from "./wilhelm-comments-manual-fields.mjs";
import { classifyAnnaFieldPair, normalizeAnnaCommentsField } from "./wilhelm-de-comments-anna-reconcile.mjs";

/** @typedef {'cerrado' | 'vacio_en_libro' | 'pendiente'} AuEstado */
/** @typedef {'coincide_pass02' | 'coincide_pass04' | 'coincide_ambos' | 'coincide_ninguno' | 'na'} ResolucionDisputa */

export const AU_ESTADO_CLOSED = /** @type {const} */ (["cerrado", "vacio_en_libro"]);

/**
 * @param {string} cell
 */
export function unescapeAuTsvCell(cell) {
  return String(cell ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\(\n)/g, "$1");
}

/** Merged runtime overlays — not re-read from Drittes JPG at promote. */
export const WILHELM_DE_COMMENTS_MERGED_META_OVERLAY_KEYS = new Set([
  "chinese",
  "hex_font",
  "chinese_roman",
]);

/**
 * @param {string | { contenido_pdf?: string } | undefined} fieldValue
 */
export function readAuGoldFieldText(fieldValue) {
  if (typeof fieldValue === "string") return fieldValue;
  if (fieldValue && typeof fieldValue === "object") {
    return String(fieldValue.contenido_pdf ?? "");
  }
  return "";
}

/**
 * Book transcription normalization (JPG → maestro).
 * @param {string} raw
 */
export function normalizeWilhelmDeAuBookText(raw) {
  let t = unescapeAuTsvCell(raw);
  // Case-sensitive: only join OCR continuation hyphens (next char lowercase), not book layout "-\n-\nQuote".
  t = t.replace(/-\r?\n(?=[a-zäöüß])/g, "");
  return normalizeWilhelmDeTxtText(t);
}

/**
 * @param {string} a
 * @param {string} b
 */
export function auTextsEqual(a, b) {
  return normalizeWilhelmDeAuBookText(a) === normalizeWilhelmDeAuBookText(b);
}

/**
 * @param {string} pass02
 * @param {string} pass04
 * @param {string} pdf
 * @param {string} disputeStatus
 * @returns {ResolucionDisputa}
 */
export function classifyAuDisputeResolution(pass02, pass04, pdf, disputeStatus) {
  if (disputeStatus === "identical" || disputeStatus === "both_empty") return "na";
  const p = normalizeWilhelmDeAuBookText(pdf);
  if (!p) return "na";
  const m02 = auTextsEqual(pass02, p);
  const m04 = auTextsEqual(pass04, p);
  if (m02 && m04) return "coincide_ambos";
  if (m02) return "coincide_pass02";
  if (m04) return "coincide_pass04";
  return "coincide_ninguno";
}

/**
 * @param {string} estado
 * @returns {estado is 'cerrado' | 'vacio_en_libro'}
 */
export function isAuEstadoClosed(estado) {
  return AU_ESTADO_CLOSED.includes(/** @type {AuEstado} */ (estado));
}

/**
 * @param {string} tsvBody
 */
export function parseAnnaCommentsAuVerticalTsv(tsvBody) {
  const lines = String(tsvBody ?? "").replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) throw new Error("AU TSV vacío");

  const header = lines[0].split("\t");
  const col = (name) => header.indexOf(name);

  const iCampo = col("campo");
  const iPdf = col("contenido_pdf");
  const iEstado = col("au_estado");
  const iResolucion = col("resolucion_disputa");
  const iReconciliado = col("contenido_reconciliado");
  const iPass02 = col("pass02");
  const iPass04 = col("pass04");

  if (iCampo < 0 || iPdf < 0 || iEstado < 0) {
    throw new Error(`AU TSV header inválido: ${lines[0]}`);
  }

  /** @type {Record<string, { contenido_pdf: string; au_estado: string; resolucion_disputa?: string; contenido_reconciliado?: string; pass02?: string; pass04?: string }>} */
  const fields = {};
  let hex = null;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split("\t");
    const campo = parts[iCampo]?.trim();
    if (!campo) continue;
    if (campo === WILHELM_COMMENTS_HEX_FIN) {
      const hexCell = parts[iCampo + 1] ?? parts[1];
      hex = Number(hexCell);
      continue;
    }
    fields[campo] = {
      contenido_pdf: unescapeAuTsvCell(parts[iPdf] ?? ""),
      au_estado: String(parts[iEstado] ?? "").trim(),
      ...(iResolucion >= 0 ? { resolucion_disputa: String(parts[iResolucion] ?? "").trim() } : {}),
      ...(iReconciliado >= 0 ? { contenido_reconciliado: unescapeAuTsvCell(parts[iReconciliado] ?? "") } : {}),
      ...(iPass02 >= 0 ? { pass02: unescapeAuTsvCell(parts[iPass02] ?? "") } : {}),
      ...(iPass04 >= 0 ? { pass04: unescapeAuTsvCell(parts[iPass04] ?? "") } : {}),
    };
  }

  if (!hex || hex < 1 || hex > 64) throw new Error("AU TSV sin hex_fin válido");
  return { hex, fields };
}

/**
 * @param {string} tsvBody
 */
export function parseAnnaCommentsDisputesFlatTsv(tsvBody) {
  const lines = String(tsvBody ?? "").replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  const header = lines[0].split("\t");
  const col = (name) => header.indexOf(name);
  /** @type {Array<object>} */
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const p = lines[i].split("\t");
    rows.push({
      hex: Number(p[col("hex")]),
      field: p[col("campo")],
      status: p[col("estado")],
      pass02: unescapeAuTsvCell(p[col("pass02")] ?? ""),
      pass04: unescapeAuTsvCell(p[col("pass04")] ?? ""),
      reconciled: unescapeAuTsvCell(p[col("reconciliado")] ?? ""),
      pickReason: unescapeAuTsvCell(p[col("razon_pick")] ?? ""),
      contenido_pdf: unescapeAuTsvCell(p[col("contenido_pdf")] ?? ""),
      au_estado: String(p[col("au_estado")] ?? "").trim(),
      resolucion_disputa: String(p[col("resolucion_disputa")] ?? "").trim(),
      jpg_paginas: String(p[col("jpg_paginas")] ?? "").trim(),
    });
  }
  return rows;
}

/**
 * @param {object} row
 * @param {string} disputeStatus
 */
export function enrichAuRowResolution(row, disputeStatus) {
  const resolucion = classifyAuDisputeResolution(
    row.pass02 ?? "",
    row.pass04 ?? "",
    row.contenido_pdf ?? "",
    disputeStatus,
  );
  return { ...row, resolucion_disputa: resolucion };
}

/**
 * Resolve maestro value for one field at promote time.
 * @param {object} args
 */
export function resolveCommentsFieldForPromote({
  field,
  pass02,
  pass04,
  reconciled,
  auField,
  disputeStatus,
  hexAuClosed,
}) {
  const estado = auField?.au_estado ?? "pendiente";
  if (isAuEstadoClosed(estado)) {
    return {
      value: estado === "vacio_en_libro" ? "" : normalizeWilhelmDeAuBookText(auField.contenido_pdf),
      source: "au_jpg",
      resolucion: auField.resolucion_disputa ?? "na",
    };
  }

  if (disputeStatus === "disputed" || disputeStatus === "pass02_only" || disputeStatus === "pass04_only") {
    return {
      value: null,
      source: "blocked_pending_au",
      reason: `Disputa sin contenido_pdf cerrado (${field})`,
    };
  }

  if (hexAuClosed && classifyAnnaFieldPair(pass02, pass04) === "identical") {
    return {
      value: normalizeAnnaCommentsField(pass02),
      source: "anna_identical_post_hex_au",
      resolucion: "na",
    };
  }

  return {
    value: null,
    source: "blocked_pending_hex_au",
    reason: `Hex sin AU completo (${field})`,
  };
}

/**
 * @param {Record<string, object>} auHexFields
 */
export function isHexAuFullyClosed(auHexFields) {
  for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
    if (key === "hex") continue;
    const row = auHexFields[key];
    if (!row || !isAuEstadoClosed(row.au_estado)) return false;
  }
  return true;
}

/**
 * @param {object} auGoldPayload
 * @param {object} reconciled
 * @param {object} pass02
 * @param {object} pass04
 * @param {Array<{ hex: number; field: string; status: string }>} compareRows
 */
export function buildPromotedCommentsFromAuGold(auGoldPayload, reconciled, pass02, pass04, compareRows) {
  /** @type {Record<string, object>} */
  const hexagrams = {};
  /** @type {Array<object>} */
  const blocked = [];

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const auHex = auGoldPayload.hexagrams?.[key]?.fields ?? {};
    const hexClosed = isHexAuFullyClosed(auHex);
    /** @type {Record<string, string>} */
    const fields = { ...(reconciled.hexagrams?.[key]?.fields ?? {}) };

    for (const { key: field } of WILHELM_COMMENTS_MANUAL_FIELDS) {
      if (field === "hex") continue;
      const row = compareRows.find((r) => r.hex === n && r.field === field);
      const status = row?.status ?? "both_empty";
      const resolved = resolveCommentsFieldForPromote({
        field,
        pass02: row?.pass02 ?? pass02.hexagrams?.[key]?.fields?.[field] ?? "",
        pass04: row?.pass04 ?? pass04.hexagrams?.[key]?.fields?.[field] ?? "",
        reconciled: fields[field] ?? "",
        auField: auHex[field],
        disputeStatus: status,
        hexAuClosed: hexClosed,
      });
      if (resolved.value === null) {
        blocked.push({ hex: n, field, reason: resolved.reason, source: resolved.source });
        continue;
      }
      fields[field] = resolved.value;
    }

    hexagrams[key] = {
      ...(reconciled.hexagrams?.[key] ?? {}),
      fields,
      promoteSource: hexClosed ? "au_jpg_closed" : "partial_au",
    };
  }

  return { hexagrams, blocked, promotable: blocked.length === 0 };
}

/**
 * @param {object} auGoldPayload
 * @param {Array<{ hex: number; field: string; status: string }>} disputeRows
 */
export function validateCommentsAuGoldForPromote(auGoldPayload, disputeRows) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  for (const row of disputeRows) {
    const auField = auGoldPayload.hexagrams?.[String(row.hex)]?.fields?.[row.field];
    const estado = auField?.au_estado ?? "pendiente";
    if (!isAuEstadoClosed(estado)) {
      errors.push(`hex ${row.hex} ${row.field}: disputa sin AU (${estado})`);
      continue;
    }
    if (estado === "cerrado" && !normalizeWilhelmDeAuBookText(auField.contenido_pdf)) {
      errors.push(`hex ${row.hex} ${row.field}: au_estado=cerrado pero contenido_pdf vacío`);
    }
  }

  for (let n = 1; n <= 64; n++) {
    const fields = auGoldPayload.hexagrams?.[String(n)]?.fields;
    if (!fields) {
      warnings.push(`hex ${n}: sin bloque AU`);
      continue;
    }
    if (!isHexAuFullyClosed(fields)) {
      warnings.push(`hex ${n}: AU hex incompleto`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * @param {number} hex
 * @param {Record<string, object>} fields
 * @param {string} jpgPages
 */
export function buildAuGoldHexEntry(hex, fields, jpgPages = "") {
  return {
    hex,
    jpgPages,
    fields,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * @param {string} hexStartsPath
 */
export function loadCommentsHexJpgRange(hexStartsPath, hex) {
  const map = JSON.parse(readFileSync(hexStartsPath, "utf8"));
  const hit = map.starts?.find((s) => s.hex === hex);
  if (!hit) return "";
  const end = hit.endBookPage ?? hit.bookPage;
  return `${hit.bookPage}${end && end !== hit.bookPage ? `-${end}` : ""}`;
}
