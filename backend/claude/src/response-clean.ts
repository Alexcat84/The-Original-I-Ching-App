const SNAPSHOT_LEAK_DELIMITERS = ["[SNAPSHOT_START]", "THREAD_LINK:", "ACTION_CORE:"];

/**
 * Safety net for partial snapshots (missing [SNAPSHOT_END]) that the regex
 * in interpretation.ts cannot strip.  Cut at the first leak delimiter.
 */
export function stripSnapshotLeaks(text: string): string {
  let t = text;
  for (const delimiter of SNAPSHOT_LEAK_DELIMITERS) {
    const idx = t.indexOf(delimiter);
    if (idx !== -1) t = t.slice(0, idx);
  }
  // Remove any orphaned [SNAPSHOT_END] that survived the main regex (happens when
  // the model emits the closing marker without a preceding [SNAPSHOT_START]).
  t = t.replace(/\[SNAPSHOT_END\]/g, "");
  return t.trim();
}

const MUTATION_RULE_CODE_RE =
  /\b(?:NO_CHANGING|ONE_CHANGING|TWO_YIN_YANG|TWO_SAME_LOWER|THREE_MIDDLE|FOUR_LOWEST_STABLE|FIVE_ONLY_STABLE|SIX_ALL_CHANGING|QIAN_ALL_NINE|KUN_ALL_SIX|ZX_ZERO|ZX_ONE|ZX_TWO_UPPER|ZX_THREE_JUDGMENTS|ZX_FOUR_LOWER|ZX_FIVE_ONLY|ZX_SIX_TRANSFORMED)\b/g;

/** Safety net: remove any mutation rule code identifiers that leaked into the response.
 *  Primary fix is removing them from the prompt; this catches edge cases. */
function stripMutationRuleCodes(text: string): string {
  // "(regla TWO_SAME_LOWER: explanation)" → "(explanation)"
  let t = text.replace(/\(\s*regla\s+[A-Z_]+\s*:\s*/g, "(");
  // Any remaining bare rule code
  t = t.replace(MUTATION_RULE_CODE_RE, "");
  // Clean up empty parens left behind
  t = t.replace(/\(\s*\)/g, "");
  return t;
}

/** Remove model-added boilerplate and trailing asterisk disclaimers from oracle text. */
export function stripInterpretationFluff(text: string): string {
  let t = text.trim();
  // Strip model-emitted document title headers ("# I CHING READING", "# ORACLE BONES READING", etc.)
  // These are internal formatting instructions that must never surface in the UI or PDF.
  while (true) {
    const next = t.replace(
      /^\s*#{0,6}\s*(?:I[\s ]+CHING|ORACLE[\s ]+BONES?)\s+READING\s*(?:\r?\n|$)/i,
      "",
    );
    if (next === t) break;
    t = next.trim();
  }
  // Internal taxonomy line (theme_category); never persist in interpretation text.
  while (true) {
    const next = t.replace(
      /^\s*#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*[\w-]+(?:\s*\([^)]*\))?\s*(?:\r?\n|$)/i,
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
  t = stripMutationRuleCodes(t);
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
  t = t.replace(/,\s*\./g, ".");
  t = t.replace(/\.\s*,/g, ".");
  t = t.replace(/\s+([,.;:!?])/g, "$1");
  t = t.replace(/([,;:])(?=\p{L})/gu, "$1 ");
  t = t.replace(/\)(?=\p{L})/gu, ") ");
  t = t.replace(/ {2,}/g, " ");
  return t.trim();
}
