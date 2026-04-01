export const TOKEN_PACKS = {
  tokens_seeker_20: {
    tokens: 20,
    price: 6.99,
    label: "Seeker Pack",
    sessionLimit: 3,
  },
  tokens_practitioner_40: {
    tokens: 40,
    price: 11.99,
    label: "Practitioner Pack",
    sessionLimit: 5,
  },
  tokens_master_100: {
    tokens: 100,
    price: 19.99,
    label: "Master Pack",
    sessionLimit: 8,
  },
} as const;

export type PackId = keyof typeof TOKEN_PACKS;

export const FREE_TOKENS = 2;
export const FREE_SESSION_LIMIT = 1;

export function getPackConfig(productId: string) {
  return TOKEN_PACKS[productId as PackId] ?? null;
}

export function getSessionLimit(lastPack: string): number {
  if (lastPack === "free") return FREE_SESSION_LIMIT;
  return TOKEN_PACKS[lastPack as PackId]?.sessionLimit ?? FREE_SESSION_LIMIT;
}
