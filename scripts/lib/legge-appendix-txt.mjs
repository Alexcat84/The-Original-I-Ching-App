/**
 * Parse Legge SBE XVI Appendix TXT into hierarchical blocks.
 */
import { readFileSync } from "node:fs";
import {
  cleanLeggeTxtText,
  cleanLeggeTxtFootnotes,
  LEGGE_TXT_SEPARATOR_RE,
  LEGGE_APPENDIX_TXT_PATH,
} from "./legge-txt-clean.mjs";
import { parseRomanNumeral } from "./legge-64hex-txt.mjs";

/** @type {RegExp} */
export const LEGGE_APPENDIX_HEADING_RE =
  /^APPENDIX\s+([IVXLCDM]+)\s*([ivxlcdm]*)\s*$/i;

/** @type {RegExp} */
export const LEGGE_APPENDIX_SECTION_RE =
  /^SECTION\s+([IVXLCDM]+)(?:\.\s*([^:\n]+)|:\s*([^:\n]+))?\s*([ivxlcdm]*)\s*$/i;

/** @type {RegExp} */
export const LEGGE_BACK_MATTER_START_RE = /^Table of Contents$/i;

/** @type {RegExp} */
export const LEGGE_TRANSLITERATION_START_RE =
  /^TRANSLITERATION OF ORIENTAL ALPHABETS/i;

/** @type {RegExp} */
export const LEGGE_HEXAGRAM_KEY_START_RE = /^HEXAGRAM KEY$/i;

/** @type {RegExp} */
const LEGGE_SYMBOLISM_HEX_RE = /^([IVXLCDM]+)\.?\s+(.*)$/;

/**
 * @param {string[]} lines
 */
export function findLeggeAppendixBackMatterStart(lines) {
  /** @type {number[]} */
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (LEGGE_BACK_MATTER_START_RE.test(t)) hits.push(i);
    if (LEGGE_TRANSLITERATION_START_RE.test(t)) hits.push(i);
    if (LEGGE_HEXAGRAM_KEY_START_RE.test(t)) hits.push(i);
  }
  return hits.length ? Math.min(...hits) : -1;
}

/**
 * Appendix VI keeps one footnotes block after both sections in the book.
 * Split by vi:7 for AU blocks (section I = vi:i–vi:6, section II = vi:7).
 * @param {string} footnotes
 */
export function splitAppendixVIFootnotes(footnotes) {
  const text = String(footnotes ?? "").trim();
  if (!text) return { sectionI: "", sectionII: "" };
  const match = text.match(/\n(?=vi:7\b)/);
  if (!match || match.index === undefined) {
    return { sectionI: text, sectionII: "" };
  }
  return {
    sectionI: text.slice(0, match.index).trim(),
    sectionII: text.slice(match.index + 1).trim(),
  };
}

/**
 * Stop collecting appendix subtitle when main body begins.
 * @param {string} line
 */
function isAppendixHeadingStop(line) {
  const t = line.trim();
  if (!t) return false;
  if (LEGGE_APPENDIX_SECTION_RE.test(t)) return true;
  if (LEGGE_APPENDIX_HEADING_RE.test(t)) return true;
  if (/^Chapter\s+[IVXLCDM]+/i.test(t)) return true;
  if (/^\d+[,.]\s/.test(t)) return true;
  if (/^This last of the/i.test(t)) return true;
  return false;
}

/** @type {RegExp} */
const LEGGE_SYMBOLISM_LINE_RE = /^(\d+|[IVX]+|S)\s*\.\s*(.*)$/i;

/** Expected SBE XVI appendix outline (main text only). */
export const LEGGE_APPENDIX_OUTLINE = [
  { roman: "I", subId: "i", sectionIds: ["I", "II"], titleHint: "Thwan" },
  { roman: "II", subId: "i", sectionIds: ["I", "II"], titleHint: "Symbolism" },
  { roman: "III", subId: null, sectionIds: ["I", "II"], titleHint: "Great Treatise" },
  { roman: "IV", subId: "i", sectionIds: ["I", "II"], titleHint: "Supplementary" },
  { roman: "V", subId: null, sectionIds: [], titleHint: "Trigrams" },
  { roman: "VI", subId: "i", sectionIds: ["I", "II"], titleHint: "Sequence" },
  { roman: "VII", subId: null, sectionIds: [], titleHint: "Promiscuous" },
];

/**
 * @param {string} token
 */
function parseLineNumberToken(token) {
  if (/^s$/i.test(token)) return 5;
  if (/^\d+$/.test(token)) return Number(token);
  return parseRomanNumeral(token);
}

/**
 * @param {string[]} lines
 */
export function splitAppendixContentAndFootnotes(lines) {
  /** @type {string[]} */
  const contentLines = [];
  /** @type {string[]} */
  const footnoteLines = [];
  let section = "content";

  for (const raw of lines) {
    const t = raw.trim();
    if (LEGGE_TXT_SEPARATOR_RE.test(t)) {
      if (section === "content") section = "footnotes";
      continue;
    }
    if (section === "content") contentLines.push(raw);
    else footnoteLines.push(raw);
  }

  const footnoteStart = footnoteLines.findIndex(
    (l) => l.trim() && !/^Footnotes$/i.test(l.trim()),
  );
  const footnotes =
    footnoteStart >= 0
      ? cleanLeggeTxtFootnotes(footnoteLines.slice(footnoteStart).join("\n"))
      : "";

  return {
    content: cleanLeggeTxtText(contentLines.join("\n")),
    footnotes,
  };
}

/**
 * Parse Appendix II Great Symbolism hex blocks (image + line glosses).
 * @param {string} content
 */
export function parseSymbolismHexEntries(content) {
  const lines = String(content ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  /** @type {Array<{ hex: number; image: string; lineNotes: Record<number, string> }>} */
  const entries = [];
  /** @type {number | null} */
  let currentHex = null;
  /** @type {string[]} */
  let imageParts = [];
  /** @type {Record<number, string>} */
  let lineNotes = {};

  /**
   * @param {number} hex
   * @param {string} imageSeed
   */
  function startHex(hex, imageSeed) {
    if (currentHex !== null) {
      entries.push({
        hex: currentHex,
        image: cleanLeggeTxtText(imageParts.join("\n")),
        lineNotes: { ...lineNotes },
      });
    }
    currentHex = hex;
    imageParts = imageSeed ? [imageSeed] : [];
    lineNotes = {};
  }

  function flush() {
    if (currentHex === null) return;
    entries.push({
      hex: currentHex,
      image: cleanLeggeTxtText(imageParts.join("\n")),
      lineNotes: { ...lineNotes },
    });
    currentHex = null;
    imageParts = [];
    lineNotes = {};
  }

  for (const line of lines) {
    const hexMatch = line.match(LEGGE_SYMBOLISM_HEX_RE);
    if (hexMatch) {
      const rest = hexMatch[2].trim();
      if (/^\d+\./.test(rest)) continue;
      startHex(parseRomanNumeral(hexMatch[1]), rest);
      continue;
    }

    const lineMatch = line.match(LEGGE_SYMBOLISM_LINE_RE);
    if (lineMatch && currentHex !== null) {
      const pos = parseLineNumberToken(lineMatch[1]);
      if (pos >= 1 && pos <= 7) {
        lineNotes[pos] = cleanLeggeTxtText(lineMatch[2]);
      }
      continue;
    }

    if (currentHex !== null && !Object.keys(lineNotes).length) {
      imageParts.push(line);
    }
  }

  flush();
  return entries;
}

/**
 * @param {string} roman
 * @param {string | null} subId
 */
export function buildAppendixId(roman, subId) {
  return `appendix-${roman.toUpperCase()}${subId ? `-${subId.toLowerCase()}` : ""}`;
}

/**
 * @param {string} roman
 * @param {string | null} name
 * @param {string | null} subId
 */
export function buildSectionId(roman, name, subId) {
  const base = `section-${roman.toUpperCase()}`;
  const bits = [];
  if (name?.trim()) bits.push(name.trim().replace(/\s+/g, "-").toUpperCase());
  if (subId?.trim()) bits.push(subId.toLowerCase());
  return bits.length ? `${base}-${bits.join("-")}` : base;
}

/**
 * @param {string} [filePath]
 */
export function parseLeggeAppendixTxt(filePath = LEGGE_APPENDIX_TXT_PATH) {
  const raw = cleanLeggeTxtText(readFileSync(filePath, "utf8"));
  const allLines = raw.split("\n");

  const backMatterStart = findLeggeAppendixBackMatterStart(allLines);
  const mainEnd = backMatterStart >= 0 ? backMatterStart : allLines.length;
  const lines = allLines.slice(0, mainEnd);

  /** @type {Array<{ type: "appendix"|"section"; lineIndex: number; title: string; roman: string; subId: string | null; sectionName: string | null }>} */
  const markers = [];

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    const app = t.match(LEGGE_APPENDIX_HEADING_RE);
    if (app) {
      markers.push({
        type: "appendix",
        lineIndex: i,
        title: t,
        roman: app[1].toUpperCase(),
        subId: app[2]?.trim() || null,
        sectionName: null,
      });
      continue;
    }
    const sec = t.match(LEGGE_APPENDIX_SECTION_RE);
    if (sec) {
      markers.push({
        type: "section",
        lineIndex: i,
        title: t,
        roman: sec[1].toUpperCase(),
        subId: sec[4]?.trim() || null,
        sectionName: (sec[2] ?? sec[3] ?? "").trim() || null,
      });
    }
  }

  /** @type {Array<object>} */
  const appendices = [];
  /** @type {object | null} */
  let currentAppendix = null;
  /** @type {object | null} */
  let pendingSection = null;

  /**
   * @param {number} endLine
   */
  function flushSection(endLine) {
    if (!currentAppendix || !pendingSection) return;
    const bodyLines = lines.slice(pendingSection.startLine, endLine);
    const { content, footnotes } = splitAppendixContentAndFootnotes(bodyLines);
    /** @type {object} */
    const section = {
      id: pendingSection.id,
      roman: pendingSection.roman,
      title: pendingSection.title,
      sectionName: pendingSection.sectionName,
      lineStart: pendingSection.startLine + 1,
      lineEnd: endLine,
      content,
      footnotes,
    };

    if (currentAppendix.roman === "II") {
      section.symbolismHex = parseSymbolismHexEntries(content);
      section.symbolismHexCount = section.symbolismHex.length;
    }

    currentAppendix.sections.push(section);
    pendingSection = null;
  }

  /**
   * @param {number} endLine
   */
  function flushAppendixBody(endLine) {
    if (!currentAppendix || pendingSection) return;
    if (currentAppendix.sections.length > 0) return;
    const bodyLines = lines.slice(currentAppendix.bodyStartLine, endLine);
    const { content, footnotes } = splitAppendixContentAndFootnotes(bodyLines);
    currentAppendix.content = content;
    currentAppendix.footnotes = footnotes;
    currentAppendix.lineEnd = endLine;
  }

  /**
   * @param {number} endLine
   */
  function closeAppendix(endLine) {
    flushSection(endLine);
    flushAppendixBody(endLine);
    if (currentAppendix) {
      if (currentAppendix.roman === "VI" && currentAppendix.sections.length === 2) {
        const secI = currentAppendix.sections[0];
        const secII = currentAppendix.sections[1];
        if (secII.footnotes?.trim() && !secI.footnotes?.trim()) {
          const split = splitAppendixVIFootnotes(secII.footnotes);
          secI.footnotes = split.sectionI;
          secII.footnotes = split.sectionII;
        }
      }
      appendices.push(currentAppendix);
      currentAppendix = null;
    }
  }

  for (let m = 0; m < markers.length; m++) {
    const marker = markers[m];
    const next = markers[m + 1];
    const endLine = next ? next.lineIndex : mainEnd;

    if (marker.type === "appendix") {
      closeAppendix(marker.lineIndex);
      const headingLines = [];
      let bodyStart = marker.lineIndex + 1;
      for (let i = marker.lineIndex + 1; i < endLine; i++) {
        const t = lines[i].trim();
        if (!t) continue;
        if (isAppendixHeadingStop(t)) {
          bodyStart = i;
          break;
        }
        headingLines.push(t);
        bodyStart = i + 1;
      }

      currentAppendix = {
        id: buildAppendixId(marker.roman, marker.subId),
        roman: marker.roman,
        subId: marker.subId,
        title: marker.title,
        heading: cleanLeggeTxtText(headingLines.join("\n")),
        lineStart: marker.lineIndex + 1,
        lineEnd: endLine,
        bodyStartLine: bodyStart,
        sections: [],
        content: "",
        footnotes: "",
      };
      continue;
    }

    if (marker.type === "section" && currentAppendix) {
      flushSection(marker.lineIndex);
      flushAppendixBody(marker.lineIndex);
      pendingSection = {
        id: buildSectionId(marker.roman, marker.sectionName, marker.subId),
        roman: marker.roman,
        title: marker.title,
        sectionName: marker.sectionName,
        startLine: marker.lineIndex + 1,
      };
    }
  }

  closeAppendix(mainEnd);

  /** @type {object | null} */
  let backMatter = null;
  if (backMatterStart >= 0) {
    const tail = allLines.slice(backMatterStart);
    const transliterationIdx = tail.findIndex((l) =>
      LEGGE_TRANSLITERATION_START_RE.test(l.trim()),
    );
    const hexKeyIdx = tail.findIndex((l) => LEGGE_HEXAGRAM_KEY_START_RE.test(l.trim()));
    const tocIdx = tail.findIndex((l) => LEGGE_BACK_MATTER_START_RE.test(l.trim()));
    backMatter = {
      tableOfContents:
        tocIdx >= 0
          ? cleanLeggeTxtText(tail.slice(tocIdx).join("\n"))
          : "",
      transliteration:
        transliterationIdx >= 0
          ? cleanLeggeTxtText(
              tail
                .slice(
                  transliterationIdx,
                  hexKeyIdx >= 0 ? hexKeyIdx : tocIdx >= 0 ? tocIdx : tail.length,
                )
                .join("\n"),
            )
          : "",
      hexagramKey:
        hexKeyIdx >= 0
          ? cleanLeggeTxtText(
              tail
                .slice(
                  hexKeyIdx,
                  tocIdx >= 0 ? tocIdx : tail.length,
                )
                .join("\n"),
            )
          : "",
      lineStart: backMatterStart + 1,
    };
  }

  return {
    source: filePath,
    parsedAt: new Date().toISOString(),
    mainLineCount: mainEnd,
    appendixCount: appendices.length,
    appendices,
    backMatter,
  };
}

/**
 * @param {ReturnType<typeof parseLeggeAppendixTxt>} parsed
 */
export function validateLeggeAppendixStructure(parsed) {
  /** @type {string[]} */
  const errors = [];

  if (parsed.appendixCount !== 7) {
    errors.push(`expected 7 appendices, found ${parsed.appendixCount}`);
  }

  for (const expected of LEGGE_APPENDIX_OUTLINE) {
    const app = parsed.appendices.find((a) => a.roman === expected.roman);
    if (!app) {
      errors.push(`missing APPENDIX ${expected.roman}`);
      continue;
    }
    if (expected.subId && app.subId !== expected.subId) {
      errors.push(
        `APPENDIX ${expected.roman}: expected subId "${expected.subId}", got "${app.subId ?? ""}"`,
      );
    }
    if (!app.heading?.trim()) {
      errors.push(`APPENDIX ${expected.roman}: empty heading`);
    }

    const sectionRomans = app.sections.map((s) => s.roman);
    if (expected.sectionIds.length === 0) {
      if (sectionRomans.length) {
        errors.push(`APPENDIX ${expected.roman}: expected no SECTION headings`);
      } else if (!app.content?.trim()) {
        errors.push(`APPENDIX ${expected.roman}: empty body content`);
      }
    } else {
      if (sectionRomans.length !== expected.sectionIds.length) {
        errors.push(
          `APPENDIX ${expected.roman}: expected ${expected.sectionIds.length} sections, found ${sectionRomans.length}`,
        );
      }
      for (const secId of expected.sectionIds) {
        if (!sectionRomans.includes(secId)) {
          errors.push(`APPENDIX ${expected.roman}: missing SECTION ${secId}`);
        }
      }
      for (const sec of app.sections) {
        if (!sec.content?.trim()) {
          errors.push(`APPENDIX ${expected.roman} SECTION ${sec.roman}: empty content`);
        }
      }
    }
  }

  const appII = parsed.appendices.find((a) => a.roman === "II");
  if (appII) {
    const secI = appII.sections.find((s) => s.roman === "I");
    const secII = appII.sections.find((s) => s.roman === "II");
    if (secI && secI.symbolismHexCount !== 30) {
      errors.push(`APPENDIX II SECTION I: expected 30 symbolism hex, found ${secI.symbolismHexCount ?? 0}`);
    }
    if (secII && secII.symbolismHexCount !== 34) {
      errors.push(`APPENDIX II SECTION II: expected 34 symbolism hex, found ${secII.symbolismHexCount ?? 0}`);
    }
    /** @type {Array<{ hex: number; image: string; lineNotes: Record<number, string> }>} */
    const symbolismEntries = [];
    for (const sec of appII.sections) {
      for (const entry of sec.symbolismHex ?? []) symbolismEntries.push(entry);
    }
    symbolismEntries.sort((a, b) => a.hex - b.hex);
    for (const entry of symbolismEntries) {
      if (!entry.image?.trim()) {
        errors.push(`APPENDIX II hex ${entry.hex}: empty symbolism image`);
      }
      for (let line = 1; line <= 6; line++) {
        if (!entry.lineNotes?.[line]?.trim()) {
          errors.push(`APPENDIX II hex ${entry.hex}: missing L${line}`);
        }
      }
      if (entry.hex <= 2 && !entry.lineNotes?.[7]?.trim()) {
        errors.push(`APPENDIX II hex ${entry.hex}: missing L7`);
      }
    }
  }

  if (!parsed.backMatter?.tableOfContents?.trim()) {
    errors.push("missing back matter Table of Contents");
  }
  if (!parsed.backMatter?.transliteration?.trim()) {
    errors.push("missing back matter transliteration");
  }
  if (!parsed.backMatter?.hexagramKey?.trim()) {
    errors.push("missing back matter hexagram key");
  }

  const appVI = parsed.appendices.find((a) => a.roman === "VI");
  if (appVI) {
    const secI = appVI.sections.find((s) => s.roman === "I");
    if (secI && !secI.footnotes?.trim()) {
      errors.push("APPENDIX VI SECTION I: empty footnotes");
    }
  }

  const appVII = parsed.appendices.find((a) => a.roman === "VII");
  if (appVII) {
    if (/TRANSLITERATION OF ORIENTAL ALPHABETS/i.test(appVII.content ?? "")) {
      errors.push("APPENDIX VII: back matter leaked into content");
    }
    if (appVII.footnotes?.trim()) {
      errors.push("APPENDIX VII: unexpected footnotes (book has none)");
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Flatten appendices for CSV/AU export (one row per block).
 * @param {ReturnType<typeof parseLeggeAppendixTxt>} parsed
 */
export function flattenLeggeAppendixBlocks(parsed) {
  /** @type {Array<{ appendix: string; section: string; field: string; content: string }>} */
  const rows = [];
  for (const app of parsed.appendices) {
    if (app.sections.length) {
      for (const sec of app.sections) {
        rows.push({
          appendix: app.id,
          section: sec.id,
          field: "content",
          content: sec.content,
        });
        if (sec.footnotes) {
          rows.push({
            appendix: app.id,
            section: sec.id,
            field: "footnotes",
            content: sec.footnotes,
          });
        }
        if (sec.symbolismHex?.length) {
          for (const entry of sec.symbolismHex) {
            rows.push({
              appendix: app.id,
              section: sec.id,
              field: `symbolism.${entry.hex}.image`,
              content: entry.image,
            });
          }
        }
      }
    } else {
      rows.push({
        appendix: app.id,
        section: "main",
        field: "content",
        content: app.content,
      });
      if (app.footnotes) {
        rows.push({
          appendix: app.id,
          section: "main",
          field: "footnotes",
          content: app.footnotes,
        });
      }
    }
  }
  return rows;
}
