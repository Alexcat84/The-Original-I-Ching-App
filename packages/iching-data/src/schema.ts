import { z } from "zod";

export const TRANSLATOR_IDS = ["wilhelm", "legge", "zhouyi"] as const;
export type TranslatorId = (typeof TRANSLATOR_IDS)[number];

export const hexagramLineSchema = z.object({
  position: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  text: z.string(),
  type: z.enum(["yin", "yang"]),
});

export const hexagramRecordSchema = z
  .object({
    number: z.number().int().min(1).max(64),
    name: z.string(),
    chineseName: z.string(),
    pinyin: z.string(),
    upperTrigram: z.string(),
    lowerTrigram: z.string(),
    judgment: z.string(),
    image: z.string(),
    lines: z.array(hexagramLineSchema).length(6),
    binaryTopFirst: z.string().length(6).regex(/^[01]+$/),
    yongJiu: z.string().optional(),
    yongLiu: z.string().optional(),
  })
  .superRefine((row, ctx) => {
    const positions = row.lines.map((l) => l.position).sort((a, b) => a - b);
    const expected = [1, 2, 3, 4, 5, 6];
    if (positions.join() !== expected.join()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Hexagram ${row.number}: lines must cover positions 1–6 exactly once`,
      });
    }
  });

export const hexagramsFileSchema = z.array(hexagramRecordSchema).length(64);

export const hexagramsBundleSchema = z.object({
  translator: z.enum(TRANSLATOR_IDS),
  edition: z.string(),
  sourceUrl: z.string().url(),
  licenseNote: z.string(),
  generatedAt: z.string(),
  hexagrams: hexagramsFileSchema,
});

export type HexagramRecord = z.infer<typeof hexagramRecordSchema>;
export type HexagramsBundle = z.infer<typeof hexagramsBundleSchema>;

export const mutationRuleRecordSchema = z.object({
  id: z.string(),
  changingCount: z.number().int().nullable(),
  systemCode: z.string(),
  pdfPage: z.number().int().optional(),
  printedPage: z.number().int().optional(),
  bookText: z.string(),
  readsFrom: z.string(),
  textTypes: z.array(z.string()),
  systemMatch: z.string(),
  variant: z.string().optional(),
  specialHexagrams: z.array(z.number()).nullable().optional(),
  systemMatchNote: z.string().optional(),
  engineChangeRequired: z.boolean().optional(),
  rulerNote: z.string().nullable().optional(),
  extrapolated: z.boolean().optional(),
  extrapolationNote: z.string().optional(),
});

export const mutationRulesBundleSchema = z.object({
  system: z.enum(["huang", "zhuxi"]),
  source: z.string(),
  edition: z.string().optional(),
  generatedAt: z.string(),
  pageMapping: z.any().optional(),
  rules: z.array(mutationRuleRecordSchema),
});

export type MutationRuleRecord = z.infer<typeof mutationRuleRecordSchema>;
export type MutationRulesBundle = z.infer<typeof mutationRulesBundleSchema>;
