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
  /** Wilhelm's English label (join key from a hexagram's upperTrigram/lowerTrigram). */
  wilhelmLabel: z.string(),
});
export type TrigramRecord = z.infer<typeof trigramRecordSchema>;

export const trigramsFileSchema = z
  .object({ trigrams: z.array(trigramRecordSchema) })
  .transform((file) => file.trigrams)
  .pipe(z.array(trigramRecordSchema).length(8));
