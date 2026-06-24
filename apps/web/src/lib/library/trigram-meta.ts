/**
 * Canonical trigram metadata for the I Ching library filter UI.
 *
 * Wilhelm/Baynes labels every hexagram with a paraphrased English trigram
 * name (e.g. "THE CREATIVE", "THE RECEPTIVE"). For the library filter we want
 * a stable, language-agnostic identifier plus the universal Chinese glyph and
 * pinyin, so the dropdown reads the same to every reader. We do NOT translate
 * the eight trigrams into 11 locales — the Chinese glyph + pinyin is the
 * universally accepted reference.
 *
 * The glyph + pinyin are NOT hardcoded here — they're imported from
 * @iching-oracle/iching-data's generated trigrams.json (built by
 * scripts/build-trigrams.mjs, pinyin derived from hanzi at build time so
 * there is exactly one place this data is authored). This file only owns the
 * UI-facing lookup helpers.
 */
import { getAllTrigrams, TRIGRAM_IDS, type TrigramId } from "@iching-oracle/iching-data";

export { TRIGRAM_IDS };
export type { TrigramId };

export interface TrigramMeta {
  readonly id: TrigramId;
  readonly chinese: string;
  readonly pinyin: string;
  /** Wilhelm's English label (used to map back from the dataset). */
  readonly wilhelmLabel: string;
}

const TRIGRAMS: ReadonlyArray<TrigramMeta> = getAllTrigrams();

const BY_ID: Record<TrigramId, TrigramMeta> = TRIGRAMS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TrigramId, TrigramMeta>,
);

const BY_WILHELM_LABEL = new Map<string, TrigramMeta>(
  TRIGRAMS.map((t) => [t.wilhelmLabel, t] as const),
);

export function listTrigrams(): ReadonlyArray<TrigramMeta> {
  return TRIGRAMS;
}

export function getTrigramById(id: TrigramId): TrigramMeta {
  return BY_ID[id];
}

export function trigramIdFromWilhelmLabel(label: string): TrigramId {
  const meta = BY_WILHELM_LABEL.get(label);
  if (!meta) {
    throw new Error(`Unknown Wilhelm trigram label: ${label}`);
  }
  return meta.id;
}

export function isTrigramId(value: string): value is TrigramId {
  return (TRIGRAM_IDS as readonly string[]).includes(value);
}

export function formatTrigramLabel(meta: TrigramMeta): string {
  return `${meta.chinese} ${meta.pinyin}`;
}
