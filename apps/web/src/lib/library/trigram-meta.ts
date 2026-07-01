/**
 * Canonical trigram metadata for the I Ching library filter UI.
 *
 * Wilhelm DE labels every hexagram with a German trigram name (e.g.
 * "das Schöpferische"). For the library filter we want a stable identifier plus
 * the universal Chinese glyph and pinyin — the dropdown reads the same to every
 * reader. We do NOT translate the eight trigrams into 11 locales.
 *
 * Glyph + pinyin come from @iching-oracle/iching-data/generated/trigrams.json.
 * Label → id resolution (including legacy Baynes EN aliases) lives in iching-data.
 */
import {
  getAllTrigrams,
  trigramIdFromWilhelmLabel,
  TRIGRAM_IDS,
  type TrigramId,
} from "@iching-oracle/iching-data";

export { TRIGRAM_IDS, trigramIdFromWilhelmLabel };
export type { TrigramId };

export interface TrigramMeta {
  readonly id: TrigramId;
  readonly chinese: string;
  readonly pinyin: string;
  /** Canonical Wilhelm DE label (used to map back from the dataset). */
  readonly wilhelmLabel: string;
}

const TRIGRAMS: ReadonlyArray<TrigramMeta> = getAllTrigrams();

const BY_ID: Record<TrigramId, TrigramMeta> = TRIGRAMS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TrigramId, TrigramMeta>,
);

export function listTrigrams(): ReadonlyArray<TrigramMeta> {
  return TRIGRAMS;
}

export function getTrigramById(id: TrigramId): TrigramMeta {
  return BY_ID[id];
}

export function isTrigramId(value: string): value is TrigramId {
  return (TRIGRAM_IDS as readonly string[]).includes(value);
}

export function formatTrigramLabel(meta: TrigramMeta): string {
  return `${meta.chinese} ${meta.pinyin}`;
}
