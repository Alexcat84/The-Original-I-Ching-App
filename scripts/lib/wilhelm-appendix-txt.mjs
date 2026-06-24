/**
 * Parse Wilhelm practical appendix TXT (consultation + eight houses).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripWilhelmTxtFootnoteLine } from "./wilhelm-64hex-txt-footnotes.mjs";
import { cleanWilhelmTxtText, WILHELM_APPENDIX_TXT_PATH } from "./wilhelm-txt-clean.mjs";

export { WILHELM_APPENDIX_TXT_PATH };

/**
 * @param {string[]} lines
 */
function linesToText(lines) {
  /** @type {string[]} */
  const paras = [];
  /** @type {string[]} */
  let current = [];
  for (const raw of lines) {
    const t = stripWilhelmTxtFootnoteLine(raw).trim();
    if (!t) {
      if (current.length) {
        paras.push(current.join("\n"));
        current = [];
      }
    } else {
      current.push(t);
    }
  }
  if (current.length) paras.push(current.join("\n"));
  return cleanWilhelmTxtText(paras.join("\n\n"));
}

/**
 * @param {string} rawText
 */
export function parseWilhelmAppendixTxt(rawText) {
  const lines = cleanWilhelmTxtText(rawText).split("\n");

  const yarrowStart = lines.findIndex((l) =>
    /^1\. THE YARROW-STALK ORACLE$/i.test(stripWilhelmTxtFootnoteLine(l).trim()),
  );
  const coinStart = lines.findIndex((l) =>
    /^2\. THE COIN ORACLE$/i.test(stripWilhelmTxtFootnoteLine(l).trim()),
  );
  const housesStart = lines.findIndex((l) =>
    /^II\. The Hexagrams Arranged by Houses$/i.test(stripWilhelmTxtFootnoteLine(l).trim()),
  );
  const trigramMemoStart = lines.findIndex((l) =>
    /^THE EIGHT PRIMARY TRIGRAMS ACCORDING TO THEIR FORM/i.test(
      stripWilhelmTxtFootnoteLine(l).trim(),
    ),
  );

  const consultingIntro =
    yarrowStart > 0 ? linesToText(lines.slice(1, yarrowStart)) : "";

  const yarrow_oracle =
    yarrowStart >= 0 && coinStart > yarrowStart
      ? linesToText(lines.slice(yarrowStart + 1, coinStart))
      : "";

  const coin_oracle =
    coinStart >= 0 && housesStart > coinStart
      ? linesToText(lines.slice(coinStart + 1, housesStart))
      : "";

  const housesIntroEnd = trigramMemoStart >= 0 ? trigramMemoStart : housesStart + 1;
  const houses_intro =
    housesStart >= 0
      ? linesToText(lines.slice(housesStart + 1, housesIntroEnd))
      : "";

  const trigram_mnemonic =
    trigramMemoStart >= 0
      ? linesToText(
          lines.slice(
            trigramMemoStart + 1,
            lines.findIndex(
              (l, i) => i > trigramMemoStart && /^THE EIGHT HOUSES$/i.test(cleanLine(l)),
            ),
          ),
        )
      : "";

  const housesStartIdx = lines.findIndex((l) => /^THE EIGHT HOUSES$/i.test(cleanLine(l)));
  /** @type {Array<{ id: number; name: string; entries: string[] }>} */
  const houses = [];

  if (housesStartIdx >= 0) {
    /** @type {number[]} */
    const houseHeaderIdx = [];
    for (let i = housesStartIdx + 1; i < lines.length; i++) {
      if (/^\d+\. The House of /i.test(cleanLine(lines[i]))) houseHeaderIdx.push(i);
    }
    for (let h = 0; h < houseHeaderIdx.length; h++) {
      const start = houseHeaderIdx[h];
      const end = h + 1 < houseHeaderIdx.length ? houseHeaderIdx[h + 1] : lines.length;
      const header = cleanLine(lines[start]);
      const m = /^(\d+)\. The House of (.+)$/.exec(header);
      const slice = lines.slice(start + 1, end);
      /** @type {string[]} */
      const entries = [];
      for (const raw of slice) {
        const t = cleanLine(raw);
        if (/^\d+\. /.test(t)) entries.push(t);
      }
      houses.push({
        id: m ? Number(m[1]) : h + 1,
        name: m ? m[2].trim() : header,
        entries,
      });
    }
  }

  return {
    title: "Appendixes",
    consulting_intro: consultingIntro,
    yarrow_oracle,
    coin_oracle,
    houses_intro,
    trigram_mnemonic,
    houses,
  };
}

/**
 * @param {string} line
 */
function cleanLine(line) {
  return stripWilhelmTxtFootnoteLine(line).trim();
}

/**
 * @param {string} [filePath]
 */
export function parseWilhelmAppendixTxtFile(filePath = WILHELM_APPENDIX_TXT_PATH) {
  return parseWilhelmAppendixTxt(readFileSync(filePath, "utf8"));
}
