#!/usr/bin/env node
/** Scan Legge bundle for OCR junk patterns vs EPUB. */
import { parseAllLeggeEpubOrThrow } from "../scripts/lib/hexagram-fidelity-legge-epub.mjs";
import { textsMatch } from "../scripts/lib/hexagram-fidelity-normalize.mjs";
import LEGGE from "../scripts/iching_legge_translation.mjs";

const epub = await parseAllLeggeEpubOrThrow();
const JUNK =
  /its,\s*subject|to his\.\s*help|should \.\s| affairs\. :$| ~$|shows\. its|\bor n a high\b|deprived of his cars\b|^T he |subject of 2 therefore|constellation of the Bushel|\. \d+\.\s+\(To the subject|\. \d+,|nourishes his virtue\. \.| \(his wish to \. |who thinks\. he|tail of \. a|committed \. He|thunder \. and|subject \. retiring|subject with \. bare| \(try to\) be, there will be cause for regret\. 4\./;

const out = [];
for (let n = 1; n <= 64; n++) {
  const row = LEGGE[String(n)];
  const fields = [
    ["judgment", row.legge_judgment?.text],
    ["image", row.legge_image?.text],
    ...(row.yong_supernumerary ? [["yong", row.yong_supernumerary]] : []),
  ];
  for (let p = 1; p <= 6; p++) fields.push([`L${p}`, row.legge_lines[String(p)]?.text]);
  for (const [f, t] of fields) {
    const s = String(t ?? "").trim();
    if (!s) continue;
    const ev =
      f === "yong"
        ? epub[n]?.yongJiu ?? epub[n]?.yongLiu
        : f.startsWith("L")
          ? epub[n]?.lines?.[Number(f.slice(1))]
          : epub[n]?.[f];
    const junk = JUNK.test(s);
    const diff =
      ev &&
      !textsMatch(s, ev, "legge") &&
      !textsMatch(
        s.replace(/\b(six|line)\b/gi, "LINE"),
        String(ev).replace(/\b(six|line)\b/gi, "LINE"),
        "legge",
      );
    if (junk || diff) out.push({ n, f, junk, diff, bundle: s, epub: ev ?? null });
  }
}
console.log(JSON.stringify(out, null, 2));
