/**
 * Parse zeno.org Wilhelm DE Erstes Buch pages into 33-field maestro shape.
 */
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  fetchZenoHtml,
  extractMainContentHtml,
  extractSectionByH4,
  parseZenoParagraphs,
  stripHtmlToText,
  stripWilhelmDeLineLabelBullet,
  sanitizeZenoExtractText,
  ZENO_ERSTES_BUCH,
  discoverRelativeLinks,
} from "./wilhelm-de-zeno-html.mjs";
import { splitZenoBlocks, splitZenoOracleCommentary } from "./wilhelm-de-zeno-split.mjs";
import { linePosFromGermanLabel } from "./wilhelm-de-64hex-txt.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const LINE_PREFIX = String.raw`(?:O\s+|Û\s+|û\s+|±\s*)?`;
const LINE_LABEL_RE = new RegExp(
  `^${LINE_PREFIX}(?:Anfangs|Oben)\\s+(?:eine\\s+)?(?:Neun|Sechs)\\s+bedeutet[:;]|^${LINE_PREFIX}(?:Neun|Sechs)\\s+auf\\s+(?:zweitem|drittem|viertem|f[üu]nftem)\\s+Platz\\s+bedeutet[:;]`,
  "i",
);

const YONG_LABEL_RE = /^Wenn lauter (?:Neunen|Sechsen) erscheinen, bedeutet das:/i;

/**
 * Short trigram label lines only (not narrative "Oben ist…" intro paragraphs).
 * @param {string} text
 */
export function isCanonicalTrigramLine(text) {
  const t = String(text ?? "").trim();
  if (!/^oben\s|^unten\s/i.test(t)) return false;
  if (/^oben\s+ist\b|^unten\s+ist\b/i.test(t)) return false;
  if (t.length > 90) return false;
  return /^((oben|unten)\s+(das\s+)?[^,]+,\s+(das|der|die)\s+)/i.test(t);
}

/**
 * @param {string} text
 */
function normalizeTrigramLine(text) {
  return String(text ?? "")
    .trim()
    .replace(/^oben\s/i, "oben ")
    .replace(/^unten\s/i, "unten ");
}

let _injector = null;

async function loadInjector() {
  if (!_injector) {
    const mod = await import(
      pathToFileURL(join(ROOT, "scripts/iching_wilhelm_de_translation.mjs")).href
    );
    _injector = mod.default;
  }
  return _injector;
}

/**
 * @param {string} hexPath
 */
export function hexFromZenoPath(hexPath) {
  return Number(String(hexPath).match(/\/(\d{1,2})\./)?.[1] ?? 0);
}

/**
 * @param {string} html
 * @param {string} hexPath
 */
function parseHexHeaderFromMain(html, hexPath) {
  const content = extractMainContentHtml(html);
  const h4 = content.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
  const titleLine = stripHtmlToText(h4?.[1] ?? "");
  const hex = hexFromZenoPath(hexPath);
  const header = titleLine.match(/^(\d{1,2})\.\s+(.+?)\s*[\/–-]\s*(.+)$/i);
  const chineseRoman = header?.[2]?.trim() ?? "";
  const nombre = header?.[3]?.trim().toUpperCase() ?? "";

  let trigramaArriba = "";
  let trigramaAbajo = "";
  for (const m of content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const t = stripHtmlToText(m[1]);
    if (isCanonicalTrigramLine(t) && /^oben\s/i.test(t)) {
      trigramaArriba = normalizeTrigramLine(t);
    }
    if (isCanonicalTrigramLine(t) && /^unten\s/i.test(t)) {
      trigramaAbajo = normalizeTrigramLine(t);
    }
  }

  /** @type {string[]} */
  const introParts = [];
  const blocks = parseZenoParagraphs(content.replace(/^[\s\S]*?<\/h4>/i, ""));
  for (const b of blocks) {
    if (isCanonicalTrigramLine(b.text)) continue;
    introParts.push(b.text);
  }
  const introBody = introParts.join("\n\n").trim();
  const intro = [
    `${hex}. ${chineseRoman} / ${nombre}`,
    trigramaArriba,
    trigramaAbajo,
    introBody,
  ]
    .filter(Boolean)
    .join("\n");

  return { hex, chineseRoman, nombre, trigramaArriba, trigramaAbajo, introBody, intro };
}

/**
 * @param {ReturnType<typeof parseZenoParagraphs>} blocks
 */
function parseLinesFromBlocks(blocks) {
  /** @type {Record<number, { label: string; oracle: string; commentary: string }>} */
  const lines = {};
  /** @type {{ label: string; oracle: string; commentary: string } | null} */
  let yong = null;

  /** @type {{ label: string; parts: string[] } | null} */
  let cur = null;

  function flush() {
    if (!cur) return;
    const pos = linePosFromGermanLabel(cur.label);
    const isYong = YONG_LABEL_RE.test(cur.label);
    const split = splitZenoOracleCommentary(cur.parts, { isYong, isLine: !isYong });
    const entry = {
      label: stripWilhelmDeLineLabelBullet(cur.label),
      oracle: split.oracle,
      commentary: sanitizeZenoExtractText(split.commentary),
    };
    if (isYong) yong = entry;
    else if (typeof pos === "number") lines[pos] = entry;
    cur = null;
  }

  for (const b of blocks) {
    const t = b.text.trim();
    if (!t) continue;
    if (/^Buchempfehlung\s*$/i.test(t)) continue;
    if (LINE_LABEL_RE.test(t) || YONG_LABEL_RE.test(t)) {
      flush();
      cur = { label: t, parts: [] };
      continue;
    }
    if (!cur) continue;
    cur.parts.push(t);
  }
  flush();

  return { lines, yong };
}

/**
 * @param {string} hexPath relative e.g. /Philosophie/.../1.+Kiën...
 */
export async function parseWilhelmDeHexFromZeno(hexPath) {
  const mainHtml = await fetchZenoHtml(hexPath);
  const header = parseHexHeaderFromMain(mainHtml, hexPath);
  const hex = header.hex;
  if (hex < 1 || hex > 64) throw new Error(`invalid hex from ${hexPath}`);

  const injector = await loadInjector();
  const row = injector[String(hex)] ?? {};

  const urteilHtml = await fetchZenoHtml(`${hexPath}/Das+Urteil`);
  const bildHtml = await fetchZenoHtml(`${hexPath}/Das+Bild`);
  const linesHtml = await fetchZenoHtml(`${hexPath}/Die+einzelnen+Linien`);

  const urteil = extractSectionByH4(urteilHtml, /^Das Urteil/i);
  const bild = extractSectionByH4(bildHtml, /^Das Bild/i);
  const linesSection = extractSectionByH4(linesHtml, /^Die einzelnen Linien/i);
  const urteilSplit = splitZenoBlocks(urteil.blocks, { isJudgment: true });
  const bildSplit = splitZenoBlocks(bild.blocks, { isImage: true });
  const { lines, yong } = parseLinesFromBlocks(linesSection.blocks);

  /** @type {Record<string, string>} */
  const fields = {
    hex: String(hex),
    nombre: header.nombre,
    chinese: String(row.trad_chinese ?? ""),
    chinese_roman: header.chineseRoman,
    hex_font: String(row.hex_font ?? ""),
    trigrama_arriba: header.trigramaArriba,
    trigrama_abajo: header.trigramaAbajo,
    intro: header.intro,
    judgment_oraculo: urteilSplit.oracle,
    judgment_comentario: urteilSplit.commentary,
    image_oraculo: bildSplit.oracle,
    image_comentario: bildSplit.commentary,
  };

  for (let p = 1; p <= 6; p++) {
    const L = lines[p];
    fields[`L${p}_etiqueta`] = L?.label ?? "";
    fields[`L${p}_oraculo`] = L?.oracle ?? "";
    fields[`L${p}_comentario`] = L?.commentary ?? "";
  }

  fields.yong_etiqueta = yong?.label ?? "";
  fields.yong_oraculo = yong?.oracle ?? "";
  fields.yong_comentario = yong?.commentary ?? "";

  for (const key of Object.keys(fields)) {
    fields[key] = sanitizeZenoExtractText(fields[key]);
  }

  return {
    hex,
    hexPath,
    zenoPermalink: extractPermalink(mainHtml),
    fields,
    source: "zeno.org:wilhelm-de-erstes-buch",
  };
}

/**
 * @param {string} html
 */
function extractPermalink(html) {
  const m = html.match(/Permalink:\s*\n+\s*(http:\/\/www\.zeno\.org\/nid\/\d+)/i);
  return m?.[1] ?? "";
}

/**
 * Discover 64 hex relative paths from Erstes Buch index.
 */
export async function discoverZenoHexPaths() {
  const html = await fetchZenoHtml(ZENO_ERSTES_BUCH);
  const links = discoverRelativeLinks(html, `${ZENO_ERSTES_BUCH}/`);
  const hexLinks = links.filter(
    (p) =>
      /Erste\+Abteilung\/\d+\./.test(p) || /Zweite\+Abteilung\/\d+\./.test(p),
  );
  hexLinks.sort((a, b) => {
    const na = Number(a.match(/\/(\d{1,2})\./)?.[1] ?? 0);
    const nb = Number(b.match(/\/(\d{1,2})\./)?.[1] ?? 0);
    return na - nb;
  });
  if (hexLinks.length !== 64) {
    throw new Error(`expected 64 hex links, got ${hexLinks.length}`);
  }
  return hexLinks;
}
