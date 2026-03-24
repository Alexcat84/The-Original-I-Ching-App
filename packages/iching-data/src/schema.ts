import { z } from "zod";

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

export type HexagramRecord = z.infer<typeof hexagramRecordSchema>;
