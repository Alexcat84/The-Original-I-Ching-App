import wilhelmRaw from "./generated/hexagrams.wilhelm.json" with { type: "json" };
import leggeRaw from "./generated/hexagrams.legge.json" with { type: "json" };
import zhouyiRaw from "./generated/hexagrams.zhouyi.json" with { type: "json" };
import {
  hexagramsBundleSchema,
  TRANSLATOR_IDS,
  type HexagramRecord,
  type HexagramsBundle,
  type TranslatorId,
} from "./schema.js";

const wilhelmBundle: HexagramsBundle = hexagramsBundleSchema.parse(wilhelmRaw);
const leggeBundle: HexagramsBundle = hexagramsBundleSchema.parse(leggeRaw);
const zhouyiBundle: HexagramsBundle = hexagramsBundleSchema.parse(zhouyiRaw);

const bundleByTranslator: Record<TranslatorId, HexagramsBundle> = {
  wilhelm: wilhelmBundle,
  legge: leggeBundle,
  zhouyi: zhouyiBundle,
};

export interface TranslatorOption {
  readonly translator?: TranslatorId;
}

function resolveBundle(translator: TranslatorId | undefined): HexagramsBundle {
  return bundleByTranslator[translator ?? "wilhelm"];
}

export function getAllHexagramRecords(opts: TranslatorOption = {}): readonly HexagramRecord[] {
  return resolveBundle(opts.translator).hexagrams;
}

export function getHexagramRecordByBinaryTopFirst(
  key: string,
  opts: TranslatorOption = {},
): HexagramRecord {
  const bundle = resolveBundle(opts.translator);
  const found = bundle.hexagrams.find((h) => h.binaryTopFirst === key);
  if (!found) {
    throw new Error(`Unknown hexagram binary pattern: ${key}`);
  }
  return found;
}

export function getHexagramRecordByNumber(
  num: number,
  opts: TranslatorOption = {},
): HexagramRecord {
  const bundle = resolveBundle(opts.translator);
  const found = bundle.hexagrams.find((h) => h.number === num);
  if (!found) {
    throw new Error(`Unknown hexagram number: ${num}`);
  }
  return found;
}

export function getHexagramBundle(translator: TranslatorId): HexagramsBundle {
  return bundleByTranslator[translator];
}

export function getAvailableTranslators(): readonly TranslatorId[] {
  return TRANSLATOR_IDS;
}

export type { HexagramRecord, HexagramsBundle, TranslatorId } from "./schema.js";
export { TRANSLATOR_IDS } from "./schema.js";

export {
  getAllWilhelmCommentary,
  getWilhelmCommentaryByNumber,
  getAllLeggeCommentary,
  getLeggeCommentaryByNumber,
} from "./commentary.js";
export type {
  WilhelmCommentary,
  WilhelmPointCommentary,
  WilhelmAbout,
  WilhelmWenYen,
  LeggeCommentary,
  LeggeLineSymbolism,
} from "./commentary.js";
