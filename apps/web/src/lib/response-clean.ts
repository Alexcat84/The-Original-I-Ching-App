/**
 * Strips a trailing signature/disclaimer clause the model sometimes appends AFTER the real
 * reading (a copyright notice, "all rights reserved" in any language, or a bare mention of
 * the app's own domain used as a self-signature). Keep in sync with
 * backend/claude/src/response-clean.ts (stripTrailingSignatureClause): see that copy for
 * the full safety-bound rationale (never removes real reading content by construction).
 */
function stripTrailingSignatureClause(text: string): string {
  const SIGNATURE_TRIGGER =
    /(©|rights reserved|derechos reservados|tous droits|r[eé]serv[eé]s|rechte vorbehalten|diritti riservati|판권|保留所有|無断複写|転載を禁|theoriginaliching\.com)/i;

  const lastBreak = text.lastIndexOf("\n\n");
  const head = lastBreak === -1 ? "" : text.slice(0, lastBreak + 2);
  const lastParagraph = (lastBreak === -1 ? text : text.slice(lastBreak + 2)).trim();

  function isSignatureLike(s: string): boolean {
    if (!s || s.length > 160) return false;
    if (!SIGNATURE_TRIGGER.test(s)) return false;
    const rest = s.replace(SIGNATURE_TRIGGER, "").trim();
    return rest.length <= 60;
  }

  const sentences = lastParagraph.split(/(?<=[.!?])\s+/);

  if (head && sentences.length === 1 && isSignatureLike(lastParagraph)) {
    return head.trim();
  }

  if (sentences.length < 2) return text;
  const tail = sentences[sentences.length - 1].trim();
  if (!isSignatureLike(tail)) return text;
  const kept = sentences.slice(0, -1).join(" ").trimEnd();
  if (!kept) return text;
  return `${head}${kept}`.trim();
}

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
  t = stripTrailingSignatureClause(t);
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
