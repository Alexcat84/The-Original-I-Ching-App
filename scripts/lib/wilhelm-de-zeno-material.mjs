/**
 * Crawl zeno.org Zweites Buch (Das Material) + front matter into structured JSON.
 */
import {
  discoverRelativeLinks,
  extractMainContentHtml,
  fetchZenoHtml,
  stripHtmlToText,
  ZENO_WILHELM_ROOT,
  ZENO_ZWEITES_BUCH,
} from "./wilhelm-de-zeno-html.mjs";

/**
 * @param {string} html
 */
function extractPermalink(html) {
  const m = html.match(/Permalink:\s*\n+\s*(http:\/\/www\.zeno\.org\/nid\/[^\s<]+)/i);
  return m?.[1] ?? "";
}

/**
 * @param {string} html
 */
function extractSourceCitation(html) {
  const m = html.match(/Quelle:\s*\n+\s*([\s\S]*?)(?:\n+Permalink:|$)/i);
  return stripHtmlToText(m?.[1] ?? "").trim();
}

/**
 * @param {string} path
 * @param {Set<string>} visited
 * @param {string} prefix
 */
async function crawlBranch(path, visited, prefix) {
  if (visited.has(path)) return [];
  visited.add(path);

  const html = await fetchZenoHtml(path);
  const titleMatch = html.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
  const title = stripHtmlToText(titleMatch?.[1] ?? path.split("/").pop() ?? path);
  const body = stripHtmlToText(extractMainContentHtml(html));

  /** @type {Array<{ path: string; title: string; permalink: string; source: string; text: string; childPaths: string[] }>} */
  const nodes = [
    {
      path,
      title,
      permalink: extractPermalink(html),
      source: extractSourceCitation(html),
      text: body,
      childPaths: [],
    },
  ];

  const childLinks = discoverRelativeLinks(html, prefix).filter(
    (p) => p !== path && p.startsWith(path) && p.length > path.length,
  );
  childLinks.sort();

  for (const child of childLinks) {
    if (!child.startsWith(`${path}/`)) continue;
    const direct = child.slice(path.length + 1);
    if (direct.includes("/")) continue;
    nodes[0].childPaths.push(child);
  }

  for (const child of nodes[0].childPaths) {
    const sub = await crawlBranch(child, visited, prefix);
    nodes.push(...sub);
  }

  return nodes;
}

/**
 * Full material + intro crawl from zeno.org.
 */
export async function crawlWilhelmDeZenoMaterial() {
  const visited = new Set();
  /** @type {Array<{ section: string; nodes: object[] }>} */
  const parts = [];

  const introPaths = [
    `${ZENO_WILHELM_ROOT}/Aus+der+Einleitung+zur+Erstausgabe/Zur+%C3%9Cbersetzung`,
    `${ZENO_WILHELM_ROOT}/Aus+der+Einleitung+zur+Erstausgabe/I.+Der+Gebrauch+des+Buchs+der+Wandlungen`,
  ];

  /** @type {object[]} */
  const introNodes = [];
  for (const p of introPaths) {
    try {
      const html = await fetchZenoHtml(p);
      introNodes.push({
        path: p,
        title: stripHtmlToText(html.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i)?.[1] ?? p),
        permalink: extractPermalink(html),
        source: extractSourceCitation(html),
        text: stripHtmlToText(extractMainContentHtml(html)),
        childPaths: [],
      });
    } catch (err) {
      introNodes.push({
        path: p,
        title: p,
        error: err instanceof Error ? err.message : String(err),
        childPaths: [],
      });
    }
  }
  parts.push({ section: "einleitung-erstausgabe", nodes: introNodes });

  const materialIndex = await fetchZenoHtml(ZENO_ZWEITES_BUCH);
  const topBranches = discoverRelativeLinks(materialIndex, `${ZENO_ZWEITES_BUCH}/`).filter(
    (p) => p.startsWith(`${ZENO_ZWEITES_BUCH}/`) && p !== ZENO_ZWEITES_BUCH,
  );

  /** @type {object[]} */
  const materialNodes = [];
  for (const branch of [...new Set(topBranches)].sort()) {
    const depth = branch.split("/").length;
    const indexDepth = ZENO_ZWEITES_BUCH.split("/").length;
    if (depth !== indexDepth + 1) continue;
    const sub = await crawlBranch(branch, visited, `${ZENO_ZWEITES_BUCH}/`);
    materialNodes.push(...sub);
    await sleep(150);
  }
  parts.push({ section: "zweites-buch-material", nodes: materialNodes });

  return {
    schemaVersion: "1.0.0",
    source: "zeno.org",
    license: "Gemeinfrei",
    crawledAt: new Date().toISOString(),
    parts,
    pageCount: parts.reduce((n, p) => n + p.nodes.length, 0),
  };
}

/**
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
