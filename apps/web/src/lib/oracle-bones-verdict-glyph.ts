import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";

/** Simplified-Chinese glyph composited on oracle-bone imagery. */
export function oracleBonesVerdictChinese(verdict: OracleBonesVerdict): string {
  if (verdict === "auspicious_clear" || verdict === "auspicious_moderate") return "吉";
  return "凶";
}

/** SVG fragment + fill for verdict-colored glyph (gradients: clear vs moderate tones). */
export type OracleBonesVerdictGlyphSvgStyle = {
  /** Insert inside parent `<defs>`; must use unique `idPrefix`-based gradient id. */
  glyphGradientDefs: string;
  /** `fill` attribute: `url(#id)` or solid hex. */
  glyphFill: string;
  /** Light outer stroke for contrast on textured shells. */
  glyphStroke: string;
  /** Stroke width in overlay viewBox units (~1344-wide scene). */
  overlayStrokeWidth: number;
};

/**
 * Unique id prefix: alphanumeric + hyphen only (valid in SVG ids).
 */
export function oracleBonesVerdictGlyphSvgStyle(
  verdict: OracleBonesVerdict,
  idPrefix: string,
): OracleBonesVerdictGlyphSvgStyle {
  const pid = idPrefix.replace(/[^a-zA-Z0-9-]/g, "") || "obg";
  const gid = `${pid}-gf`;

  switch (verdict) {
    case "auspicious_clear":
      return {
        glyphGradientDefs: `<linearGradient id="${gid}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4ade80"/><stop offset="50%" stop-color="#22c55e"/><stop offset="100%" stop-color="#14532d"/></linearGradient>`,
        glyphFill: `url(#${gid})`,
        glyphStroke: "rgba(255,255,252,0.96)",
        overlayStrokeWidth: 5.5,
      };
    case "auspicious_moderate":
      return {
        glyphGradientDefs: `<linearGradient id="${gid}" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#3d6b4f"/></linearGradient>`,
        glyphFill: `url(#${gid})`,
        glyphStroke: "rgba(236,253,245,0.94)",
        overlayStrokeWidth: 5,
      };
    case "inauspicious_clear":
      return {
        glyphGradientDefs: `<linearGradient id="${gid}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fb7185"/><stop offset="45%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient>`,
        glyphFill: `url(#${gid})`,
        glyphStroke: "rgba(255,250,250,0.96)",
        overlayStrokeWidth: 5.5,
      };
    default:
      return {
        glyphGradientDefs: `<linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="100%" stop-color="#9f3942"/></linearGradient>`,
        glyphFill: `url(#${gid})`,
        glyphStroke: "rgba(255,245,245,0.92)",
        overlayStrokeWidth: 5,
      };
  }
}
