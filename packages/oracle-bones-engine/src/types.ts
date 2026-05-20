export type OracleBonesVerdict =
  | "auspicious_clear"
  | "auspicious_moderate"
  | "inauspicious_moderate"
  | "inauspicious_clear";

export type OracleBoneMedium = "turtle" | "ox";

export interface OracleBonesCastResult {
  id: string;
  /** Winning crack motif id 1–4 */
  patternId: number;
  verdict: OracleBonesVerdict;
  /** Whether the oracle affirms the positive charge */
  affirmsPositive: boolean;
  positiveCharge: string;
  negativeCharge: string;
  medium: OracleBoneMedium;
}

export interface PerformOracleBonesOptions {
  rng?: () => number;
  id?: string;
}
