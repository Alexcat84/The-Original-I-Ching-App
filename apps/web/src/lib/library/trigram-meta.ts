/**
 * Canonical trigram metadata for the I Ching library filter UI.
 *
 * Wilhelm/Baynes labels every hexagram with a paraphrased English trigram
 * name (e.g. "THE CREATIVE", "THE RECEPTIVE"). For the library filter we want
 * a stable, language-agnostic identifier plus the universal Chinese glyph and
 * pinyin, so the dropdown reads the same to every reader. We do NOT translate
 * the eight trigrams into 11 locales — the Chinese glyph + pinyin is the
 * universally accepted reference.
 */

export const TRIGRAM_IDS = [
  "heaven",
  "earth",
  "water",
  "thunder",
  "mountain",
  "wind",
  "lake",
  "fire",
] as const;

export type TrigramId = (typeof TRIGRAM_IDS)[number];

export interface TrigramMeta {
  readonly id: TrigramId;
  readonly chinese: string;
  readonly pinyin: string;
  /** Wilhelm's English label (used to map back from the dataset). */
  readonly wilhelmLabel: string;
}

const TRIGRAMS: ReadonlyArray<TrigramMeta> = [
  { id: "heaven", chinese: "乾", pinyin: "qián", wilhelmLabel: "THE CREATIVE" },
  { id: "earth", chinese: "坤", pinyin: "kūn", wilhelmLabel: "THE RECEPTIVE" },
  { id: "water", chinese: "坎", pinyin: "kǎn", wilhelmLabel: "THE ABYSMAL" },
  { id: "thunder", chinese: "震", pinyin: "zhèn", wilhelmLabel: "THE AROUSING" },
  { id: "mountain", chinese: "艮", pinyin: "gèn", wilhelmLabel: "KEEPING STILL" },
  { id: "wind", chinese: "巽", pinyin: "xùn", wilhelmLabel: "THE GENTLE" },
  { id: "lake", chinese: "兌", pinyin: "duì", wilhelmLabel: "THE JOYOUS" },
  { id: "fire", chinese: "離", pinyin: "lí", wilhelmLabel: "THE CLINGING" },
];

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
