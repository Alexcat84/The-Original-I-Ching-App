/**
 * Client-side cleanup for cached readings (matches server strip).
 * Keep in sync with backend/claude/src/response-clean.ts (stripInterpretationFluff).
 */
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
 * Match backend/claude/src/response-clean.ts normalizeInterpretationPunctuation exactly
 * so cached threads and PDF export get the same typography fixes as fresh API responses.
 */
export function normalizeInterpretationPunctuation(text: string): string {
  let t = text.trim();
  t = t.replace(/[—–]/g, ",");
  t = t.replace(/(^|\n)\s*-\s+/g, "$1");
  t = t.replace(/\s-\s/g, ", ");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/,\s*,+/g, ", ");
  t = t.replace(/\s+,/g, ",");
  t = t.replace(/,\./g, ".");
  t = t.replace(/,(?!\s)(?=\p{L})/gu, ", ");
  t = t.replace(/;(?!\s)(?=\p{L})/gu, "; ");
  t = t.replace(/:(?!\s)(?=\p{L})/gu, ": ");
  t = t.replace(/\)(?=\p{L})/gu, ") ");
  t = t.replace(/,\s+\./g, ".");
  t = t.replace(/:\s+(\p{Ll})/gu, (_m, ch: string) => `: ${ch.toUpperCase()}`);
  return t.trim();
}
