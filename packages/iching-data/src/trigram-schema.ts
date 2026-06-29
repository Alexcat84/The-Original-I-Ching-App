import { z } from "zod";

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

export const trigramRecordSchema = z.object({
  id: z.enum(TRIGRAM_IDS),
  chinese: z.string(),
  pinyin: z.string(),
  /** Canonical Wilhelm DE label (join key from hexagram upperTrigram/lowerTrigram). */
  wilhelmLabel: z.string(),
  /** Legacy Baynes EN + OCR variants accepted by trigramIdFromWilhelmLabel. */
  aliases: z.array(z.string()).default([]),
});
export type TrigramRecord = z.infer<typeof trigramRecordSchema>;

export const trigramsFileSchema = z
  .object({ trigrams: z.array(trigramRecordSchema) })
  .transform((file) => file.trigrams)
  .pipe(z.array(trigramRecordSchema).length(8));
