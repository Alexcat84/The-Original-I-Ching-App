export const TOKEN_PACKS = {
  tokens_seeker_20: {
    tokens: 20,
    price: 6.99,
    label: "Seeker Pack",
    sessionLimit: 3,
    marketingDetail: {
      es: "20 tokens por compra (pack consumible, sin renovación automática). Hasta 3 preguntas encadenadas por hilo. Imágenes generadas en resolución estándar.",
      en: "20 tokens per purchase (consumable pack, no auto-renewal). Up to 3 follow-up questions per thread. Generated images use standard resolution.",
    },
  },
  tokens_practitioner_40: {
    tokens: 40,
    price: 11.99,
    label: "Practitioner Pack",
    sessionLimit: 5,
    marketingDetail: {
      es: "40 tokens por compra (pack consumible, sin renovación automática). Hasta 5 preguntas encadenadas por hilo. Imágenes generadas en alta resolución.",
      en: "40 tokens per purchase (consumable pack, no auto-renewal). Up to 5 follow-up questions per thread. Generated images use high resolution.",
    },
  },
  tokens_master_100: {
    tokens: 100,
    price: 19.99,
    label: "Master Pack",
    sessionLimit: 8,
    marketingDetail: {
      es: "100 tokens por compra (pack consumible, sin renovación automática). Hasta 8 preguntas encadenadas por hilo. Imágenes generadas en máxima resolución.",
      en: "100 tokens per purchase (consumable pack, no auto-renewal). Up to 8 follow-up questions per thread. Generated images use maximum resolution.",
    },
  },
} as const;

export type PackId = keyof typeof TOKEN_PACKS;

/** Stable order for UI lists (token center, etc.). */
export const PACK_IDS_ORDERED: PackId[] = ["tokens_seeker_20", "tokens_practitioner_40", "tokens_master_100"];

export const FREE_TOKENS = 2;
export const FREE_SESSION_LIMIT = 1;

export function getPackConfig(productId: string) {
  return TOKEN_PACKS[productId as PackId] ?? null;
}

export function getSessionLimit(lastPack: string): number {
  if (lastPack === "free") return FREE_SESSION_LIMIT;
  return TOKEN_PACKS[lastPack as PackId]?.sessionLimit ?? FREE_SESSION_LIMIT;
}
