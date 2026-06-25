export type CoinFace = "H" | "T";

/**
 * Wilhelm/Baynes (1950), Appendix I §2: "The inscribed side counts as yin, with
 * the value 2, and the reverse side counts as yang, with the value 3." On this
 * coin the inscribed (Han) face is "H"; the reverse (Manchu) face is "T".
 *
 * Pure, framework-free so it can also be imported directly (no build step,
 * Node's native TS support) by scripts/verify-divination-wilhelm-appendix.mjs.
 */
export function lineValueFromCoins(coins: CoinFace[]): 6 | 7 | 8 | 9 {
  const sum = coins.reduce((s, c) => s + (c === "H" ? 2 : 3), 0);
  return sum as 6 | 7 | 8 | 9;
}
