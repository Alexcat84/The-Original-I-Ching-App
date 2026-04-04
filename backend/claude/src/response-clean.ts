/** Remove model-added boilerplate and trailing asterisk disclaimers from oracle text. */
export function stripInterpretationFluff(text: string): string {
  let t = text.trim();
  t = t.replace(/\n*\*[^*\n][\s\S]*?\*\s*$/, "").trim();
  const boiler: RegExp[] = [
    /(?:^|\n)(?:Es importante tener en cuenta|Debes tener presente|Cabe recordar|Ten en cuenta que|Es crucial entender|Recuerda que|No olvides que)[^\n]*\n?/gi,
    /(?:^|\n)(?:It is important to note|Please note that|Keep in mind that|Remember that)[^\n]*\n?/gi,
    /(?:^|\n)[^\n]*interpretación[^\n]*simbólica[^\n]*\n?/gi,
    /(?:^|\n)[^\n]*no debe considerarse[^\n]*predicción[^\n]*\n?/gi,
    /(?:^|\n)[^\n]*predicción certera[^\n]*\n?/gi,
  ];
  for (const r of boiler) t = t.replace(r, "\n");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Keep prose natural by avoiding dash-heavy phrasing and bullet-like hyphen lines.
 * Also fixes common LLM typography glitches (missing space after comma, ",.", etc.).
 * Uses Unicode property escapes (\p{L}, \p{Ll}) — requires modern JS runtimes.
 */
export function normalizeInterpretationPunctuation(text: string): string {
  let t = text.trim();
  t = t.replace(/[—–]/g, ",");
  t = t.replace(/(^|\n)\s*-\s+/g, "$1");
  t = t.replace(/\s-\s/g, ", ");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/,\s*,+/g, ", ");
  t = t.replace(/\s+,/g, ",");
  // Comma + period with no space (LLM glitch)
  t = t.replace(/,\./g, ".");
  // Letter immediately after comma / semicolon / colon (no space), e.g. ",según" ",Seguir"
  // Skips decimals like 1,5 (digit after comma).
  t = t.replace(/,(?!\s)(?=\p{L})/gu, ", ");
  t = t.replace(/;(?!\s)(?=\p{L})/gu, "; ");
  t = t.replace(/:(?!\s)(?=\p{L})/gu, ": ");
  // Closing paren flush against a word
  t = t.replace(/\)(?=\p{L})/gu, ") ");
  t = t.replace(/,\s+\./g, ".");
  // After ": " begin with uppercase when the model left a lowercase sentence start
  t = t.replace(/:\s+(\p{Ll})/gu, (_m, ch: string) => `: ${ch.toUpperCase()}`);
  return t.trim();
}
