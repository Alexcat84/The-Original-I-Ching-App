#!/usr/bin/env node
import { fetchZenoHtml, stripHtmlToText, ZENO_WILHELM_ROOT, ZENO_ERSTES_BUCH, ZENO_ZWEITES_BUCH } from "./lib/wilhelm-de-zeno-html.mjs";
import { discoverZenoHexPaths } from "./lib/wilhelm-de-zeno-parse.mjs";

const terms = [
  "Drittes",
  "drittes",
  "Kommentar zur Entscheidung",
  "Kommentar zu den Bildern",
  "Die Kommentare",
  "Wen Yen",
  "Wen Yän",
  "Textworte",
  "Kernzeichen",
  "Die Reihenfolge",
  "Vermischte Zeichen",
];

function allIChingLinks(html) {
  return [
    ...new Set(
      [...html.matchAll(/href="(\/Philosophie\/M\/Anonym\/I\+Ging[^"#]*)"/g)].map((m) =>
        decodeURIComponent(m[1]),
      ),
    ),
  ];
}

async function scanHtml(label, html) {
  const text = stripHtmlToText(html);
  const hits = terms.filter((t) => text.includes(t));
  const allLinks = allIChingLinks(html);
  const komLinks = allLinks.filter((l) => /komment|drittes|textwort|wen|reihenfolge|kernzeichen/i.test(l));
  return { label, hits, komLinks, linkCount: allLinks.length, textLen: text.length };
}

const rootHtml = await fetchZenoHtml(ZENO_WILHELM_ROOT);
const erstesHtml = await fetchZenoHtml(ZENO_ERSTES_BUCH);
const zweitesHtml = await fetchZenoHtml(ZENO_ZWEITES_BUCH);
const hexPaths = await discoverZenoHexPaths();

const scans = [
  await scanHtml("root", rootHtml),
  await scanHtml("erstes-buch-index", erstesHtml),
  await scanHtml("zweites-buch-index", zweitesHtml),
  await scanHtml("hex-1", await fetchZenoHtml(hexPaths[0])),
  await scanHtml("hex-43", await fetchZenoHtml(hexPaths[42])),
];

for (const s of scans) {
  console.log(`\n=== ${s.label} (${s.textLen} chars) ===`);
  console.log("term hits:", s.hits.join(", ") || "(none)");
  console.log("kom/drittes links:", s.komLinks.length);
  for (const l of s.komLinks.slice(0, 20)) console.log(" ", l);
}

const pool = new Set();
for (const html of [rootHtml, erstesHtml, zweitesHtml]) {
  for (const l of allIChingLinks(html)) pool.add(l);
}
const suspicious = [...pool].filter((l) =>
  /komment|drittes|dritte|textwort|wen|reihenfolge|kernzeichen|vermischte/i.test(l),
);
console.log("\n=== Suspicious links (root+erstes+zweites) ===", suspicious.length);
for (const l of suspicious.sort()) console.log(l);

// Sample hex subpages beyond Urteil/Bild/Linien
const hex1 = hexPaths[0];
for (const suffix of [
  "Das+Urteil",
  "Das+Bild",
  "Die+einzelnen+Linien",
  "Kommentar+zur+Entscheidung",
  "Kommentar+zu+den+Bildern",
  "Die+Kommentare",
  "Kernzeichen",
]) {
  const url = `${hex1}/${suffix}`;
  try {
    const h = await fetchZenoHtml(url);
    const t = stripHtmlToText(h).slice(0, 120);
    console.log(`\nOK ${suffix}:`, t.replace(/\s+/g, " "));
  } catch (e) {
    console.log(`\nFAIL ${suffix}:`, String(e.message).slice(0, 80));
  }
}

// Raw HTML search for "Drittes" anywhere in root
const rawHits = ["Drittes", "DRITTES", "Kommentare", "Die Kommentare"].filter((t) =>
  rootHtml.includes(t),
);
console.log("\nRaw HTML string search on root:", rawHits.length ? rawHits : "none");
