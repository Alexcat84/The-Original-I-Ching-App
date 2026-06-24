import trigramsRaw from "./generated/trigrams.json" with { type: "json" };
import { trigramsFileSchema, type TrigramRecord } from "./trigram-schema.js";

const trigrams: readonly TrigramRecord[] = trigramsFileSchema.parse(trigramsRaw);

export function getAllTrigrams(): readonly TrigramRecord[] {
  return trigrams;
}

export type { TrigramRecord, TrigramId } from "./trigram-schema.js";
export { TRIGRAM_IDS } from "./trigram-schema.js";
