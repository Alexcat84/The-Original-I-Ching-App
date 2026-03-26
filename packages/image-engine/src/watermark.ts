import type { TierKey } from "@iching-oracle/context-engine";

export const WATERMARK_CONFIG: Record<
  TierKey,
  { fontSize: number; opacity: number; text: string; prominent: boolean }
> = {
  free: { fontSize: 18, opacity: 0.88, text: "☯ El autentico I Ching", prominent: true },
  seeker: { fontSize: 15, opacity: 0.75, text: "☯ El autentico I Ching", prominent: false },
  practitioner: { fontSize: 12, opacity: 0.55, text: "☯ Autentico I Ching", prominent: false },
  master: { fontSize: 10, opacity: 0.4, text: "☯ I Ching", prominent: false },
  oracle: { fontSize: 9, opacity: 0.28, text: "☯", prominent: false },
};
