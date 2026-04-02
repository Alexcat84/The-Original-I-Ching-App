import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { oracleBonesVerdictChinese } from "@/lib/oracle-bones-verdict-glyph";

/** Large verdict glyph on mock / SVG bone image (PNG already has glyph baked in at finalize). */
export function OracleBonesVerdictOverlay({ verdict }: { verdict: OracleBonesVerdict }) {
  return (
    <div className="bones-verdict-overlay" aria-hidden="true">
      <span className="bones-verdict-overlay__glyph">{oracleBonesVerdictChinese(verdict)}</span>
    </div>
  );
}
