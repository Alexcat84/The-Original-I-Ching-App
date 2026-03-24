export type OracleBonesVerdict =
  | "auspicious_clear"
  | "auspicious_moderate"
  | "inauspicious_moderate"
  | "inauspicious_clear"
  | "silent";

export type OracleBoneMedium = "turtle" | "ox";

export interface OracleBonesCastResult {
  id: string;
  /** Winning crack motif id 1–4, or 5 when ancestors are silent after indeterminate rounds */
  patternId: number;
  verdict: OracleBonesVerdict;
  /** How many indeterminate (pattern 5) draws occurred before this result */
  ambiguousPasses: number;
  /** Whether the oracle affirms the positive charge; null if silent */
  affirmsPositive: boolean | null;
  positiveCharge: string;
  negativeCharge: string;
  medium: OracleBoneMedium;
}

export interface PerformOracleBonesOptions {
  rng?: () => number;
  id?: string;
}
