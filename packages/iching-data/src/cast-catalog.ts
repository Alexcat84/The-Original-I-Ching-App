import catalogRaw from "./generated/cast-catalog.json" with { type: "json" };
import { z } from "zod";

const selectionSchema = z.object({
  kind: z.enum(["line", "judgment", "image", "yong"]),
  hex: z.number().int().min(1).max(64),
  position: z.number().int().min(1).max(6).optional(),
  emphasis: z.enum(["primary", "secondary"]).optional(),
  judgmentScope: z.enum(["primary", "transformed"]).optional(),
});

const systemEntrySchema = z.object({
  rule: z.string(),
  selections: z.array(selectionSchema),
});

const castCatalogEntrySchema = z.object({
  castIndex: z.number().int().min(1).max(4096),
  primary: z.number().int().min(1).max(64),
  mask: z.number().int().min(0).max(63),
  transformed: z.number().int().min(1).max(64),
  changingLines: z.array(z.number().int().min(1).max(6)),
  lineValues: z.array(z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)])).length(6),
  huang: systemEntrySchema,
  zhuxi: systemEntrySchema,
});

const castCatalogSchema = z.object({
  schemaVersion: z.number(),
  entries: z.array(castCatalogEntrySchema).length(4096),
});

export type CastCatalogEntry = z.infer<typeof castCatalogEntrySchema>;
export type CastCatalogSelection = z.infer<typeof selectionSchema>;

const parsed = castCatalogSchema.parse(catalogRaw);
const byCastIndex = new Map(parsed.entries.map((e) => [e.castIndex, e]));

export function getCastCatalogEntry(castIndex: number): CastCatalogEntry {
  const entry = byCastIndex.get(castIndex);
  if (!entry) {
    throw new Error(`Unknown castIndex: ${castIndex}`);
  }
  return entry;
}

export function getAllCastCatalogEntries(): readonly CastCatalogEntry[] {
  return parsed.entries;
}

export { parsed as castCatalogBundle };
