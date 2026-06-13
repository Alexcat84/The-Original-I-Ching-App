/**
 * Client-side cleanup for cached readings (matches server strip).
 * Keep in sync with backend/claude/src/response-clean.ts (stripInterpretationFluff).
 */
export function stripInterpretationFluff(text: string): string {
  let t = text.trim();
  // Strip model-emitted document title headers ("# I CHING READING", "# ORACLE BONES READING", etc.)
  // Covers both new consultations and historical rows already stored with the header.
  while (true) {
    const next = t.replace(
      /^\s*#{0,6}\s*(?:I[\s ]+CHING|ORACLE[\s ]+BONES?)\s+READING\s*(?:\r?\n|$)/i,
      "",
    );
    if (next === t) break;
    t = next.trim();
  }
  // Internal taxonomy line (theme_category); never show in UI/PDF even if DB has legacy rows.
  while (true) {
    const next = t.replace(
      /^\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*[\w-]+(?:\s*\([^)]*\))?\s*(?:\r?\n|$)/i,
      "",
    );
    if (next === t) break;
    t = next.trim();
    t = t.replace(/^\s*\n+/m, "");
  }
  t = t.trim();
  t = t.replace(/\n+\*[^*\n][^\n]*\*\s*$/, "").trim();
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

/** Client-side punctuation normalization for cached/history readings. */
export function normalizeInterpretationPunctuation(text: string): string {
  let t = text.trim();
  t = t.replace(/[—–]/g, ",");
  t = t.replace(/(^|\n)\s*-\s+/g, "$1");
  t = t.replace(/\s-\s/g, ", ");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/,\s*,+/g, ", ");
  t = t.replace(/\s+,/g, ",");
  t = t.replace(/,\s*\./g, ".");
  t = t.replace(/\.\s*,/g, ".");
  t = t.replace(/\s+([,.;:!?])/g, "$1");
  t = t.replace(/([,;:])(?=\p{L})/gu, "$1 ");
  t = t.replace(/\)(?=\p{L})/gu, ") ");
  t = t.replace(/ {2,}/g, " ");
  return t.trim();
}
