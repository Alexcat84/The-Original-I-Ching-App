import { z } from "zod";

/**
 * Optional scholarly commentary layer for the hexagram library. Sourced from
 * the audited "TXT maestro" datasets (tools/datasets/wilhelm, tools/datasets/legge)
 * — see docs/auditorias/20260623-POL-DAT-MAESTRO-00-txt-maestro-notes-policy.md. This is
 * intentionally separate from `schema.ts` (HexagramRecord/HexagramsBundle):
 * the engine (iching-engine), the image pipeline (image-engine), and the AI
 * prompt builder (backend/claude) must never see or depend on this data —
 * it is library-display-only. Zhou Yi never had commentary and has no
 * schema here by design.
 */

export const wilhelmPointCommentarySchema = z.object({
  bookOne: z.string(),
  tenWings: z.string(),
});
export type WilhelmPointCommentary = z.infer<typeof wilhelmPointCommentarySchema>;

export const wilhelmAboutSchema = z.object({
  intro: z.string(),
  miscNotes: z.string(),
  rulerNote: z.string(),
  sequence: z.string(),
});
export type WilhelmAbout = z.infer<typeof wilhelmAboutSchema>;

export const wilhelmWenYenSchema = z.object({
  text: z.string(),
  note: z.string(),
});
export type WilhelmWenYen = z.infer<typeof wilhelmWenYenSchema>;

export const wilhelmCommentaryLineSchema = z.object({
  position: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  commentary: wilhelmPointCommentarySchema,
});

export const wilhelmCommentarySchema = z.object({
  number: z.number().int().min(1).max(64),
  about: wilhelmAboutSchema,
  wenYen: wilhelmWenYenSchema.nullable(),
  judgment: wilhelmPointCommentarySchema,
  image: wilhelmPointCommentarySchema,
  lines: z.array(wilhelmCommentaryLineSchema).length(6),
  yong: wilhelmPointCommentarySchema.nullable(),
});
export type WilhelmCommentary = z.infer<typeof wilhelmCommentarySchema>;

export const wilhelmCommentaryFileSchema = z.array(wilhelmCommentarySchema).length(64);

export const leggeLineSymbolismSchema = z.object({
  position: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.literal(7),
  ]),
  note: z.string(),
});
export type LeggeLineSymbolism = z.infer<typeof leggeLineSymbolismSchema>;

export const leggeCommentarySchema = z.object({
  number: z.number().int().min(1).max(64),
  footnotes: z.string(),
  thwanIntro: z.string().nullable(),
  linesIntro: z.string().nullable(),
  imageSymbolism: z.string(),
  lineSymbolism: z.array(leggeLineSymbolismSchema).min(6).max(7),
});
export type LeggeCommentary = z.infer<typeof leggeCommentarySchema>;

export const leggeCommentaryFileSchema = z.array(leggeCommentarySchema).length(64);
