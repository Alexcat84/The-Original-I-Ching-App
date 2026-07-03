import trigramsRaw from "./generated/trigrams.json" with { type: "json" };
import { trigramsFileSchema, type TrigramId, type TrigramRecord } from "./trigram-schema.js";

const trigrams: readonly TrigramRecord[] = trigramsFileSchema.parse(trigramsRaw);

const labelToId = new Map<string, TrigramId>();
for (const trigram of trigrams) {
  labelToId.set(trigram.wilhelmLabel, trigram.id);
  for (const alias of trigram.aliases) {
    labelToId.set(alias, trigram.id);
  }
}

export function getAllTrigrams(): readonly TrigramRecord[] {
  return trigrams;
}

/** Map a Wilhelm DE canonical label or legacy Baynes/OCR alias to TrigramId. */
export function trigramIdFromWilhelmLabel(label: string): TrigramId {
  const id = labelToId.get(label.trim());
  if (!id) {
    throw new Error(`Unknown Wilhelm trigram label: ${label}`);
  }
  return id;
}

export type { TrigramRecord, TrigramId } from "./trigram-schema.js";
export { TRIGRAM_IDS } from "./trigram-schema.js";
