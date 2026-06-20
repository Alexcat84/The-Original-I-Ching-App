import type { AnyMutationRule, CastResult } from "@iching-oracle/iching-engine";
import {
  validateLineCitation,
  type SelectedLineText,
} from "./interpretation-line-gate.js";

export type { SelectedLineText };

export type ValidationFailure = {
  gate: "H1" | "H1b" | "H3" | "H4" | "H5" | "H6";
  severity: "blocking" | "warn";
  message: string;
  detail?: unknown;
};

export type InterpretationValidationResult = {
  passed: boolean;
  blockingFailures: ValidationFailure[];
  warnFailures: ValidationFailure[];
};

const INTERNAL_RULE_CODES: AnyMutationRule[] = [
  "NO_CHANGING",
  "ONE_CHANGING",
  "TWO_YIN_YANG",
  "TWO_SAME_LOWER",
  "THREE_MIDDLE",
  "FOUR_LOWEST_STABLE",
  "FIVE_ONLY_STABLE",
  "SIX_ALL_CHANGING",
  "QIAN_ALL_NINE",
  "KUN_ALL_SIX",
  "ZX_ZERO",
  "ZX_ONE",
  "ZX_TWO_UPPER",
  "ZX_THREE_JUDGMENTS",
  "ZX_FOUR_LOWER",
  "ZX_FIVE_ONLY",
  "ZX_SIX_TRANSFORMED",
];

const LINES_SECTION_HEADINGS =
  /^##\s*(?:Líneas en movimiento|Lines in motion|Linhas em movimento|爻动|Lignes en mouvement|Linien in Bewegung|Linee in movimento)(?:\s*\([^)]*\))?/im;

const RITUAL_HEADING_COUNT = 6;

function extractSection(text: string, headingPattern: RegExp): string | null {
  const match = headingPattern.exec(text);
  if (!match || match.index === undefined) return null;
  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const nextHeading = rest.search(/\n##\s+/);
  const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return body.trim();
}

/** Body of «Líneas en movimiento» excluding the opener paragraph. */
export function extractLinesSectionBody(text: string): string | null {
  const section = extractSection(text, LINES_SECTION_HEADINGS);
  if (!section) return null;

  const blockquoteStart = section.search(/\n>\s*\*/);
  const entryStart = section.search(
    /\n\s*(?:\d+\.\s*)?(?:\*\*)?(?:Línea|Line|Linea|第)\s*[1-6]/im,
  );

  let splitAt = -1;
  if (blockquoteStart !== -1 && entryStart !== -1) {
    splitAt = Math.min(blockquoteStart, entryStart);
  } else if (blockquoteStart !== -1) {
    splitAt = blockquoteStart;
  } else if (entryStart !== -1) {
    splitAt = entryStart;
  } else {
    const doubleNl = section.indexOf("\n\n");
    splitAt = doubleNl === -1 ? section.length : doubleNl;
  }

  if (splitAt <= 0) return section;
  return section.slice(splitAt).trim();
}

function omittedChangingPositions(cast: CastResult): number[] {
  const selected = new Set(
    cast.textsForClaude.selectedLineTexts.map((l) => l.position),
  );
  return cast.changingLines.filter((p) => !selected.has(p));
}

function lineEntryPattern(position: number): RegExp {
  // Terminator requires structural marker (colon, paren, bracket, comma, period, or space+open-paren)
  // but NOT bare whitespace alone — prevents false positives on prose like "Line 1 is not interpreted…"
  return new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?(?:\\*\\*)?(?:Línea|Line|Linea|Linha|Ligne|Linie|第|爻)\\s*${position}(?:\\*\\*)?(?:\\s*\\(|:|\\)|\\]|,|\\.)`,
    "im",
  );
}

function positionFollowedByBlockquote(text: string, position: number): boolean {
  const posPattern = new RegExp(
    `(?:Línea|Line|Linea|Linha|Ligne|Linie|第|爻)\\s*${position}[^\\n]*\\n(?:[^\\n]*\\n){0,2}\\s*>\\s*\\*`,
    "im",
  );
  return posPattern.test(text);
}

/**
 * H3 — detect structured interpretation entries for changing positions
 * that the mutation rule excluded (not in selectedLineTexts).
 */
export function validateNoFabricatedLines(
  text: string,
  cast: CastResult,
): { passed: boolean; fabricated: number[] } {
  const omitted = omittedChangingPositions(cast);
  if (omitted.length === 0) return { passed: true, fabricated: [] };

  // Robustness: fall back to the whole text when the Lines-section heading is
  // not recognized (output language whose heading is not in LINES_SECTION_HEADINGS),
  // so H3 never silently passes by failing to locate the section.
  // The selected positions are never flagged (only omitted ones).
  const body = extractLinesSectionBody(text) ?? text;

  const fabricated: number[] = [];
  for (const pos of omitted) {
    if (lineEntryPattern(pos).test(body) || positionFollowedByBlockquote(body, pos)) {
      fabricated.push(pos);
    }
  }
  return { passed: fabricated.length === 0, fabricated };
}

/**
 * H1b — each selected line must appear as blockquote in the Lines section.
 */
export function validateLineBlockquoteInSection(
  text: string,
  selectedLineTexts: SelectedLineText[],
): { passed: boolean; missing: number[] } {
  if (selectedLineTexts.length === 0) return { passed: true, missing: [] };

  const section = extractSection(text, LINES_SECTION_HEADINGS) ?? text;
  const missing: number[] = [];

  for (const lt of selectedLineTexts) {
    const fingerprint = lt.text.split("\n")[0].replace(/[。！？，、；：]$/u, "").slice(0, 20).trim();
    if (fingerprint.length < 2) continue;
    const blockquotePattern = new RegExp(
      `>\\s*\\*[^*]*${escapeRegex(fingerprint.slice(0, 12))}`,
      "i",
    );
    if (!blockquotePattern.test(section)) {
      missing.push(lt.position);
    }
  }
  return { passed: missing.length === 0, missing };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function validateNoInternalRuleCodes(text: string): boolean {
  for (const code of INTERNAL_RULE_CODES) {
    if (text.includes(code)) return false;
  }
  return true;
}

export function validateSpecialYaoHandling(
  text: string,
  cast: CastResult,
): { passed: boolean; reason?: string } {
  const rule = cast.mutationRule;
  if (rule !== "QIAN_ALL_NINE" && rule !== "KUN_ALL_SIX") {
    return { passed: true };
  }

  const special = cast.textsForClaude.specialYaoText?.trim();
  if (!special) return { passed: true };

  const fingerprint = special.slice(0, 28).trim();
  if (fingerprint.length >= 2 && !text.includes(fingerprint)) {
    return { passed: false, reason: "special yao text not cited" };
  }

  const body = extractLinesSectionBody(text) ?? text;
  for (const pos of cast.changingLines) {
    if (lineEntryPattern(pos).test(body)) {
      return { passed: false, reason: `individual line ${pos} entry in QIAN/KUN cast` };
    }
  }
  return { passed: true };
}

export function validateSectionStructure(
  text: string,
  mode: "ritual" | "directo" | "profundizar",
  hasTransformedHexagram?: boolean,
): { passed: boolean; count: number } {
  if (mode !== "ritual") return { passed: true, count: 0 };
  const headings = text.match(/^##\s+/gm);
  const count = headings?.length ?? 0;
  // When there is no transformed hexagram, the «Trazado» section is correctly
  // absent → expect 5 headings; with transformed hexagram → expect 6.
  const expected = hasTransformedHexagram === false ? RITUAL_HEADING_COUNT - 1 : RITUAL_HEADING_COUNT;
  return { passed: count >= expected, count };
}

export function validateInterpretationOutput(
  text: string,
  cast: CastResult,
  options?: { mode?: "ritual" | "directo" | "profundizar" },
): InterpretationValidationResult {
  const mode = options?.mode ?? "ritual";
  const selected = cast.textsForClaude.selectedLineTexts;
  const blockingFailures: ValidationFailure[] = [];
  const warnFailures: ValidationFailure[] = [];

  const h1 = validateLineCitation(text, selected);
  if (!h1.passed) {
    blockingFailures.push({
      gate: "H1",
      severity: "blocking",
      message: "Selected line text fingerprint missing from response",
      detail: h1.missing,
    });
  }

  const h3 = validateNoFabricatedLines(text, cast);
  if (!h3.passed) {
    blockingFailures.push({
      gate: "H3",
      severity: "blocking",
      message: "Fabricated line entries for omitted changing positions",
      detail: h3.fabricated,
    });
  }

  const h5 = validateSpecialYaoHandling(text, cast);
  if (!h5.passed) {
    blockingFailures.push({
      gate: "H5",
      severity: "blocking",
      message: h5.reason ?? "Special yao handling failed",
    });
  }

  const h1b = validateLineBlockquoteInSection(text, selected);
  if (!h1b.passed) {
    warnFailures.push({
      gate: "H1b",
      severity: "warn",
      message: "Selected line text not in blockquote within Lines section",
      detail: h1b.missing,
    });
  }

  if (!validateNoInternalRuleCodes(text)) {
    warnFailures.push({
      gate: "H4",
      severity: "warn",
      message: "Internal mutation rule code leaked to user-visible output",
    });
  }

  const hasTransformed = Boolean(cast.transformedHexagram);
  const h6 = validateSectionStructure(text, mode, hasTransformed);
  if (!h6.passed) {
    const expectedSections = hasTransformed ? RITUAL_HEADING_COUNT : RITUAL_HEADING_COUNT - 1;
    warnFailures.push({
      gate: "H6",
      severity: "warn",
      message: `Expected at least ${expectedSections} ## sections in ritual mode`,
      detail: { count: h6.count },
    });
  }

  return {
    passed: blockingFailures.length === 0,
    blockingFailures,
    warnFailures,
  };
}

export function hasBlockingFailures(result: InterpretationValidationResult): boolean {
  return result.blockingFailures.length > 0;
}
