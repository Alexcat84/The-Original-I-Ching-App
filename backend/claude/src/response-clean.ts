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

/** Remove model-added boilerplate and trailing asterisk disclaimers from oracle text. */
export function stripInterpretationFluff(text: string): string {
  let t = text.trim();
  // Internal taxonomy line (theme_category); never persist in interpretation text.
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
