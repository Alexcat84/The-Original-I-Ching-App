import type { TierKey } from "@iching-oracle/context-engine";

export const WATERMARK_CONFIG: Record<
  TierKey,
  { fontSize: number; opacity: number; text: string; prominent: boolean }
> = {
  free: { fontSize: 20, opacity: 0.9, text: "☯ The Original I Ching", prominent: true },
  seeker: { fontSize: 18, opacity: 0.82, text: "☯ The Original I Ching", prominent: false },
  practitioner: { fontSize: 16, opacity: 0.72, text: "☯ The Original I Ching", prominent: false },
  master: { fontSize: 14, opacity: 0.64, text: "☯ The Original I Ching", prominent: false },
  oracle: { fontSize: 13, opacity: 0.6, text: "☯ The Original I Ching", prominent: false },
};
