import {
  getAllHexagramRecords,
  getHexagramBundle,
  getHexagramRecordByBinaryTopFirst,
  getHexagramRecordByNumber,
  type HexagramRecord,
  type TranslatorId,
} from "@iching-oracle/iching-data";
import { trigramIdFromWilhelmLabel, type TrigramId } from "./trigram-meta";

const HEXAGRAM_GLYPH_BASE = 0x4dc0;

function glyphForNumber(num: number): string {
  return String.fromCodePoint(HEXAGRAM_GLYPH_BASE + num - 1);
}

export interface LibrarySummary {
  readonly number: number;
  readonly glyph: string;
  readonly chineseName: string;
  readonly pinyin: string;
  readonly englishName: string;
  readonly upperTrigram: TrigramId;
  readonly lowerTrigram: TrigramId;
  readonly binaryTopFirst: string;
}

export interface LibraryDetailMutation {
  readonly position: number;
  readonly fromNumber: number;
  readonly toNumber: number;
  readonly toGlyph: string;
  readonly toChineseName: string;
  readonly toPinyin: string;
  readonly toEnglishName: string;
}

export interface LibraryDetailRecords {
  readonly wilhelm: HexagramRecord;
  readonly legge: HexagramRecord;
  readonly zhouyi: HexagramRecord;
}

export interface LibraryDetail {
  readonly summary: LibrarySummary;
  readonly records: LibraryDetailRecords;
  readonly mutations: ReadonlyArray<LibraryDetailMutation>;
  readonly sources: Record<TranslatorId, { edition: string; sourceUrl: string }>;
}

/**
 * Wilhelm is the canonical structural source. All three bundles share the
 * same number/binary/Chinese-name layout, so we build summaries from the
 * Wilhelm bundle only (and read the English `name` from there too).
 */
export function getLibrarySummaries(): ReadonlyArray<LibrarySummary> {
  const records = getAllHexagramRecords();
  return records.map((r) => ({
    number: r.number,
    glyph: glyphForNumber(r.number),
    chineseName: r.chineseName,
    pinyin: r.pinyin,
    englishName: r.name,
    upperTrigram: trigramIdFromWilhelmLabel(r.upperTrigram),
    lowerTrigram: trigramIdFromWilhelmLabel(r.lowerTrigram),
    binaryTopFirst: r.binaryTopFirst,
  }));
}

/**
 * Returns the six outgoing mutations: flip line p (1 = bottom = last char of
 * `binaryTopFirst`) and look up the target hexagram. Mutations are listed in
 * line order (1..6, bottom to top) which matches the line order shown in
 * each translator tab on the detail page.
 */
function buildMutations(binaryTopFirst: string, fromNumber: number): LibraryDetailMutation[] {
  const out: LibraryDetailMutation[] = [];
  for (let position = 1; position <= 6; position += 1) {
    const idx = 6 - position;
    const flipped =
      binaryTopFirst.slice(0, idx) +
      (binaryTopFirst[idx] === "1" ? "0" : "1") +
      binaryTopFirst.slice(idx + 1);
    const target = getHexagramRecordByBinaryTopFirst(flipped);
    out.push({
      position,
      fromNumber,
      toNumber: target.number,
      toGlyph: glyphForNumber(target.number),
      toChineseName: target.chineseName,
      toPinyin: target.pinyin,
      toEnglishName: target.name,
    });
  }
  return out;
}

export function getLibraryDetail(num: number): LibraryDetail | null {
  if (!Number.isInteger(num) || num < 1 || num > 64) {
    return null;
  }
  const wilhelm = getHexagramRecordByNumber(num, { translator: "wilhelm" });
  const legge = getHexagramRecordByNumber(num, { translator: "legge" });
  const zhouyi = getHexagramRecordByNumber(num, { translator: "zhouyi" });

  const summary: LibrarySummary = {
    number: wilhelm.number,
    glyph: glyphForNumber(wilhelm.number),
    chineseName: wilhelm.chineseName,
    pinyin: wilhelm.pinyin,
    englishName: wilhelm.name,
    upperTrigram: trigramIdFromWilhelmLabel(wilhelm.upperTrigram),
    lowerTrigram: trigramIdFromWilhelmLabel(wilhelm.lowerTrigram),
    binaryTopFirst: wilhelm.binaryTopFirst,
  };

  const wilhelmBundle = getHexagramBundle("wilhelm");
  const leggeBundle = getHexagramBundle("legge");
  const zhouyiBundle = getHexagramBundle("zhouyi");

  return {
    summary,
    records: { wilhelm, legge, zhouyi },
    mutations: buildMutations(wilhelm.binaryTopFirst, wilhelm.number),
    sources: {
      wilhelm: { edition: wilhelmBundle.edition, sourceUrl: wilhelmBundle.sourceUrl },
      legge: { edition: leggeBundle.edition, sourceUrl: leggeBundle.sourceUrl },
      zhouyi: { edition: zhouyiBundle.edition, sourceUrl: zhouyiBundle.sourceUrl },
    },
  };
}
