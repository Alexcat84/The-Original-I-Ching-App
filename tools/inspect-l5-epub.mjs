import { readWilhelmEpubHexHtml } from "../scripts/lib/wilhelm-epub-extract.mjs";
import {
  findWilhelmEpubSectionStart,
  extractWilhelmCommentaryParagraphs,
} from "../scripts/lib/wilhelm-epub-full.mjs";
import { blockquoteTextsFromDiv as bqFromDiv } from "../scripts/lib/hexagram-fidelity-wilhelm-epub.mjs";

const html = await readWilhelmEpubHexHtml(1);
const i = findWilhelmEpubSectionStart(html, "LINES");
const part = html.slice(i);
const divs = [...part.matchAll(/<div class="calibre12">([\s\S]*?)<\/div>/gi)];

let lineIdx = 0;
for (let d = 0; d < divs.length; d++) {
  const m = divs[d];
  const bqs = bqFromDiv(m[1]);
  if (bqs.length < 2 || !/means:/i.test(bqs[0])) continue;
  lineIdx++;
  if (lineIdx !== 5) continue;
  console.log("L5 label:", bqs[0]);
  console.log("L5 oracle:", bqs.slice(1).join(" | "));
  const afterStart = m.index + m[0].length;
  const afterEnd = d + 1 < divs.length ? divs[d + 1].index : part.length;
  const after = part.slice(afterStart, afterEnd);
  const comm = extractWilhelmCommentaryParagraphs(after);
  console.log("\nCommentary paragraphs:", comm.length);
  comm.forEach((p, i) => console.log(`P${i} (${p.length}):`, p.slice(0, 150)));
  const bqInAfter = [...after.matchAll(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi)];
  console.log("\nBlockquotes in commentary region:", bqInAfter.length);
  for (const b of bqInAfter) {
    console.log("BQ:", b[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300));
  }
}
