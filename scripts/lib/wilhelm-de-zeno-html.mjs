/**
 * Minimal HTML helpers for zeno.org Wilhelm DE extraction.
 */

export const ZENO_BASE = "http://www.zeno.org";
export const ZENO_WILHELM_ROOT =
  "/Philosophie/M/Anonym/I+Ging+-+Buch+der+Wandlungen";
export const ZENO_ERSTES_BUCH =
  `${ZENO_WILHELM_ROOT}/Erstes+Buch%3A+Der+Text`;
export const ZENO_ZWEITES_BUCH =
  `${ZENO_WILHELM_ROOT}/Zweites+Buch%3A+Das+Material`;

const ENTITY_MAP = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  szlig: "ß",
  ndash: "–",
  mdash: "—",
  laquo: "«",
  raquo: "»",
};

/**
 * @param {string} s
 */
export function decodeHtmlEntities(s) {
  return String(s ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITY_MAP[name.toLowerCase()] ?? m);
}

/**
 * @param {string} html
 */
export function stripHtmlToText(html) {
  return decodeHtmlEntities(
    String(html ?? "")
      .replace(/<a[^>]*class="zenoTXKonk"[^>]*>[\s\S]*?<\/a>/gi, "")
      .replace(/<a[^>]*class="zenoTXLinkInt"[^>]*>[\s\S]*?<\/a>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Book layout bullets (±, Û, O) — not part of the line label text.
 * @param {string} label
 */
export function stripWilhelmDeLineLabelBullet(label) {
  return String(label ?? "")
    .trim()
    .replace(/^(?:O\s+|Û\s+|û\s+|±\s*)/i, "");
}

/**
 * @param {string} text
 */
export function sanitizeZenoExtractText(text) {
  return String(text ?? "")
    .replace(/\n+\s*Buchempfehlung\s*$/i, "")
    .trim();
}

/**
 * @param {string} path
 */
export function zenoUrl(path) {
  if (path.startsWith("http")) return path;
  return `${ZENO_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * @param {string} path
 */
export async function fetchZenoHtml(path) {
  const url = zenoUrl(path);
  const res = await fetch(url, {
    headers: { "User-Agent": "iching-app-wilhelm-de-zeno-extract/1.0" },
  });
  if (!res.ok) throw new Error(`zeno fetch ${res.status}: ${url}`);
  const buf = await res.arrayBuffer();
  return new TextDecoder("windows-1252").decode(buf);
}

/**
 * @param {string} html
 */
export function extractMainContentHtml(html) {
  const start = html.search(/<h4[^>]*>/i);
  if (start < 0) return "";
  const endMarkers = [
    html.indexOf("<h6", start),
    html.indexOf("#### Fu", start),
    html.indexOf('class="zenoTXQuelle"', start),
    html.indexOf("<strong>Quelle:", start),
  ].filter((i) => i >= 0);
  const end = endMarkers.length ? Math.min(...endMarkers) : html.length;
  return html.slice(start, end);
}

/**
 * @param {string} pInner
 */
function paragraphIsCommentary(pInner) {
  return /zenoTXFontsize80/i.test(pInner);
}

/**
 * @param {string} contentHtml
 */
export function parseZenoParagraphs(contentHtml) {
  /** @type {Array<{ kind: "oracle" | "commentary" | "label" | "break"; text: string }>} */
  const blocks = [];
  const re = /<p([^>]*)>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(contentHtml))) {
    const attrs = m[1] ?? "";
    const inner = m[2] ?? "";
    if (/zenoIMFloat/i.test(inner) && !stripHtmlToText(inner).trim()) continue;
    const text = stripHtmlToText(inner);
    if (!text) continue;
    if (/^Buchempfehlung\s*$/i.test(text)) continue;
    if (paragraphIsCommentary(inner) || /zenoPLm/i.test(attrs)) {
      blocks.push({ kind: "commentary", text });
      continue;
    }
    blocks.push({ kind: "oracle", text });
  }
  for (const br of contentHtml.matchAll(/<br\s*\/?>/gi)) {
    void br;
  }
  return blocks;
}

/**
 * Split oracle vs commentary using first commentary block as boundary.
 *
 * @param {ReturnType<typeof parseZenoParagraphs>} blocks
 */
export function splitOracleCommentaryBlocks(blocks) {
  let oracleParts = [];
  /** @type {string[]} */
  const commentaryParts = [];
  let phase = "oracle";

  for (const b of blocks) {
    if (b.kind === "commentary") phase = "commentary";
    if (phase === "oracle") oracleParts.push(b.text);
    else commentaryParts.push(b.text);
  }

  return {
    oracle: oracleParts.join("\n").trim(),
    commentary: commentaryParts.join("\n\n").trim(),
  };
}

/**
 * @param {string} html
 * @param {RegExp} h4Pattern
 */
export function extractSectionByH4(html, h4Pattern) {
  const content = extractMainContentHtml(html);
  const h4Re = new RegExp(`<h4[^>]*>([\\s\\S]*?)</h4>`, "gi");
  let targetStart = -1;
  let targetEnd = content.length;
  let m;
  /** @type {Array<{ start: number; end: number; title: string }>} */
  const sections = [];

  while ((m = h4Re.exec(content))) {
    const title = stripHtmlToText(m[1]);
    sections.push({ start: m.index, end: 0, title });
  }
  for (let i = 0; i < sections.length; i++) {
    sections[i].end = sections[i + 1]?.start ?? content.length;
  }

  const hit = sections.find((s) => h4Pattern.test(s.title));
  if (!hit) return { title: "", bodyHtml: "", blocks: [], ...splitOracleCommentaryBlocks([]) };

  const bodyHtml = content.slice(hit.start, hit.end).replace(/^[\s\S]*?<\/h4>/i, "");
  const blocks = parseZenoParagraphs(bodyHtml);
  const split = splitOracleCommentaryBlocks(blocks);
  return { title: hit.title, bodyHtml, blocks, ...split };
}

/**
 * @param {string} html
 */
export function discoverRelativeLinks(html, prefix) {
  return [
    ...new Set(
      [...html.matchAll(/href="(\/Philosophie\/M\/Anonym\/I\+Ging[^"]+)"/g)]
        .map((m) => m[1])
        .filter((p) => p.startsWith(prefix) && !p.includes("#")),
    ),
  ];
}
