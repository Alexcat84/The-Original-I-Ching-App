import type { CastResult } from "@iching-oracle/iching-engine";
import type { ValidationFailure } from "./interpretation-output-validator.js";

/**
 * H7 — verbatim fidelity of Judgment/Image quotes against the literal text
 * placed in the prompt (cast.textsForClaude). Warn-only: unlike H1/H3/H5,
 * a mismatch here never triggers a retry — see apply-interpretation-gates.ts
 * logValidationWarnings. Rationale: the model reliably "corrects" perceived
 * typographic noise (curly quotes, stray punctuation) in addition to
 * occasionally dropping real content (e.g. Legge's editorial parentheses);
 * blocking on this before production telemetry exists risks doubling API
 * cost and failing whole consultations over cosmetic drift. See
 * docs/auditorias/20260624-AUD-RDG-QA-02-verbatim-blockquote-gap.md.
 *
 * Only meaningful in ritual mode — "directo"/"profundizar" use a different
 * 2-section structure with no "El juicio"/"La imagen" headings at all.
 */

const JUDGMENT_HEADINGS =
  /^##\s*(?:El\s+juicio|The\s+judgment|O\s+julgamento|Le\s+jugement|Das\s+Urteil|Il\s+giudizio)(?:\s*\([^)]*\))?/im;
const IMAGE_HEADINGS =
  /^##\s*(?:La\s+imagen|The\s+image|A\s+imagem|L['’]image|Das\s+Bild|L['’]immagine)(?:\s*\([^)]*\))?/im;

/**
 * Typographic normalization only — collapses whitespace and maps curly
 * quotes/dashes to their ASCII equivalents. Deliberately does NOT strip or
 * reorder words/punctuation inside a sentence, so a dropped clause (e.g.
 * Legge's "(The trigram representing) ...") still fails after normalization;
 * only quote/dash style noise is absorbed.
 */
export function normalizeForVerbatimCompare(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSection(text: string, headingPattern: RegExp): string | null {
  const match = headingPattern.exec(text);
  if (!match || match.index === undefined) return null;
  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const nextHeading = rest.search(/\n##\s+/);
  const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return body.trim();
}

function buildTranslatorLabelPattern(translator: "wilhelm" | "legge" | "zhouyi"): RegExp {
  const name = translator === "zhouyi" ? "zhou\\s*yi" : translator;
  return new RegExp(`^\\*\\*${name}.*\\*\\*:?\\s*$|^\\*\\*${name}.*:\\*\\*\\s*$`, "i");
}

/**
 * Master(3) mode: find the labeled bold line ("**Wilhelm:**") and collect the
 * blockquote lines that immediately follow. Single-translator mode (no
 * label): collect the first blockquote run in the section.
 */
function extractQuote(sectionText: string | null, labelPattern: RegExp | null): string {
  if (!sectionText) return "";
  const lines = sectionText.split("\n");
  let start: number;
  if (labelPattern) {
    start = lines.findIndex((l) => labelPattern.test(l.trim()));
    if (start === -1) return "";
  } else {
    const firstQuoteLine = lines.findIndex((l) => l.trim().startsWith(">"));
    if (firstQuoteLine === -1) return "";
    start = firstQuoteLine - 1;
  }
  const quoteLines: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith(">")) {
      quoteLines.push(trimmed.replace(/^>\s*/, "").replace(/^\*(.*)\*$/, "$1"));
    } else if (quoteLines.length > 0) {
      break;
    } else if (trimmed !== "") {
      break;
    }
  }
  return quoteLines.join("\n").trim();
}

type Translator = "wilhelm" | "legge" | "zhouyi";

type CheckEntry = {
  translator: Translator;
  field: "judgment" | "image";
  heading: RegExp;
  expected: string;
};

function buildCheckEntries(cast: CastResult): CheckEntry[] {
  const t = cast.textsForClaude;
  const isMasterCombined = cast.interpretationMode === "master_combined";
  const hasTransformed = Boolean(cast.transformedHexagram);

  const entries: CheckEntry[] = [];
  const push = (translator: Translator, field: "judgment" | "image", expected: string | null | undefined) => {
    if (expected) entries.push({ translator, field, heading: field === "judgment" ? JUDGMENT_HEADINGS : IMAGE_HEADINGS, expected });
  };

  if (isMasterCombined) {
    push("wilhelm", "judgment", t.primaryJudgment);
    push("wilhelm", "image", t.primaryImage);
    push("legge", "judgment", t.leggeJudgment);
    push("legge", "image", t.leggeImage);
    push("zhouyi", "judgment", t.zhouyiJudgment);
    push("zhouyi", "image", t.zhouyiImage);
    // Transformed quotes are rendered in "El trazado"/"The turning pattern", a
    // section with no localized heading list yet — out of scope for H7 v1
    // (primary Judgment/Image is the highest-traffic, highest-confidence case).
  } else {
    // Single-translator mode: primaryJudgment/primaryImage hold whichever
    // translator was actually selected (wilhelm/legge/zhouyi) — see
    // engine.ts buildCastResultFromLines. Label the check entry with the
    // real translator so Sentry telemetry isn't misattributed to Wilhelm
    // for a Legge or Zhou Yi single-translator reading.
    const singleTranslator: Translator =
      cast.interpretationMode === "legge" || cast.interpretationMode === "zhouyi"
        ? cast.interpretationMode
        : "wilhelm";
    push(singleTranslator, "judgment", t.primaryJudgment);
    push(singleTranslator, "image", t.primaryImage);
  }
  void hasTransformed; // documented exclusion above, not a TODO
  return entries;
}

export function validateJudgmentImageVerbatim(
  text: string,
  cast: CastResult,
  mode: "ritual" | "directo" | "profundizar",
): { failures: ValidationFailure[] } {
  if (mode !== "ritual") return { failures: [] };

  const isMasterCombined = cast.interpretationMode === "master_combined";
  const entries = buildCheckEntries(cast);
  const failures: ValidationFailure[] = [];

  const sectionCache = new Map<string, string | null>();
  const sectionFor = (heading: RegExp): string | null => {
    const key = heading.source;
    if (!sectionCache.has(key)) sectionCache.set(key, extractSection(text, heading));
    return sectionCache.get(key) ?? extractSection(text, heading) ?? text;
  };

  for (const entry of entries) {
    const section = sectionFor(entry.heading) ?? text;
    const labelPattern = isMasterCombined ? buildTranslatorLabelPattern(entry.translator) : null;
    const got = extractQuote(section, labelPattern);
    const expectedNorm = normalizeForVerbatimCompare(entry.expected);
    const gotNorm = normalizeForVerbatimCompare(got);
    if (gotNorm !== expectedNorm) {
      failures.push({
        gate: "H7",
        severity: "warn",
        message: got
          ? `${entry.translator}/${entry.field} quote does not match the literal text supplied`
          : `${entry.translator}/${entry.field} quote not found`,
        detail: { translator: entry.translator, field: entry.field, expected: entry.expected, got },
      });
    }
  }

  return { failures };
}
