/**
 * QA code: TS-CLAUDE-004 judgment-image-gate · v1.0.0
 * Area: backend/claude/src/interpretation-judgment-image-gate
 * Family: CLAUDE
 */

import { describe, it, expect } from "vitest";
import type { CastResult, Hexagram, TextsForClaude } from "@iching-oracle/iching-engine";
import { buildCastFixture } from "@iching-oracle/iching-engine";
import { validateJudgmentImageVerbatim, normalizeForVerbatimCompare } from "./interpretation-judgment-image-gate.js";

// ---------------------------------------------------------------------------
// Minimal hand-built fixtures — H7 only reads interpretationMode,
// transformedHexagram and textsForClaude.{primary,legge,zhouyi}{Judgment,Image}.
// ---------------------------------------------------------------------------

function makeHexagram(overrides: Partial<Hexagram> = {}): Hexagram {
  return {
    number: 1,
    name: "The Creative",
    chineseName: "乾",
    pinyin: "qián",
    upperTrigram: "THE CREATIVE",
    lowerTrigram: "THE CREATIVE",
    judgment: "j",
    image: "i",
    lines: [],
    ...overrides,
  };
}

function makeCast(overrides: {
  interpretationMode?: CastResult["interpretationMode"];
  transformedHexagram?: Hexagram | null;
  textsForClaude: Partial<TextsForClaude>;
}): CastResult {
  return {
    id: "test-cast",
    question: "¿pregunta?",
    language: "es",
    interpretationMode: overrides.interpretationMode ?? "wilhelm",
    lines: [],
    primaryHexagram: makeHexagram(),
    transformedHexagram: overrides.transformedHexagram ?? null,
    changingLines: [],
    mutationRule: "NO_CHANGING",
    textsForClaude: {
      primaryJudgment: "",
      primaryImage: "",
      selectedLineTexts: [],
      transformedJudgment: null,
      transformedImage: null,
      specialYaoText: null,
      ruleExplanation: "",
      ...overrides.textsForClaude,
    },
    timestamp: new Date("2026-01-01T00:00:00Z"),
  };
}

// ---------------------------------------------------------------------------
// normalizeForVerbatimCompare
// ---------------------------------------------------------------------------

describe("normalizeForVerbatimCompare", () => {
  it("maps curly quotes to straight quotes", () => {
    expect(normalizeForVerbatimCompare("the earth’s condition")).toBe("the earth's condition");
  });

  it("maps em/en dash to hyphen", () => {
    expect(normalizeForVerbatimCompare("a—b–c")).toBe("a-b-c");
  });

  it("collapses internal whitespace/newlines", () => {
    expect(normalizeForVerbatimCompare("a\n\n  b   c")).toBe("a b c");
  });

  it("does not remove words or punctuation that isn't quote/dash/whitespace", () => {
    const withParens = "(The trigram representing) the earth";
    expect(normalizeForVerbatimCompare(withParens)).toContain("(The trigram representing)");
  });
});

// ---------------------------------------------------------------------------
// validateJudgmentImageVerbatim — single-translator mode
// ---------------------------------------------------------------------------

describe("validateJudgmentImageVerbatim — single-translator ritual mode", () => {
  it("passes when judgment and image are quoted verbatim", () => {
    const cast = makeCast({
      textsForClaude: {
        primaryJudgment: "THE CREATIVE works sublime success.",
        primaryImage: "The movement of heaven is full of power.",
      },
    });
    const text = `
## El juicio (卦辞)

> *THE CREATIVE works sublime success.*

Comentario...

## La imagen (象傳)

> *The movement of heaven is full of power.*

Comentario...
`;
    const { failures } = validateJudgmentImageVerbatim(text, cast, "ritual");
    expect(failures).toHaveLength(0);
  });

  it("passes when only the apostrophe style differs (typographic normalization)", () => {
    const cast = makeCast({
      textsForClaude: {
        primaryJudgment: "j",
        primaryImage: "The earth’s condition is receptive devotion.",
      },
    });
    const text = `
## El juicio (卦辞)

> *j*

## La imagen (象傳)

> *The earth's condition is receptive devotion.*
`;
    const { failures } = validateJudgmentImageVerbatim(text, cast, "ritual");
    expect(failures).toHaveLength(0);
  });

  it("fails when an editorial parenthetical clause is dropped (Legge-style content drop)", () => {
    const cast = makeCast({
      textsForClaude: {
        primaryJudgment: "(The trigram representing) the earth collects (from among them) the multitudes.",
        primaryImage: "i",
      },
    });
    const text = `
## El juicio (卦辞)

> *the earth collects the multitudes.*

## La imagen (象傳)

> *i*
`;
    const { failures } = validateJudgmentImageVerbatim(text, cast, "ritual");
    expect(failures).toHaveLength(1);
    expect(failures[0]!.gate).toBe("H7");
    expect(failures[0]!.severity).toBe("warn");
    expect((failures[0]!.detail as { field: string }).field).toBe("judgment");
  });

  it("fails with a distinguishable message when the blockquote is missing entirely", () => {
    const cast = makeCast({
      textsForClaude: { primaryJudgment: "THE CREATIVE works sublime success.", primaryImage: "i" },
    });
    const text = `
## El juicio (卦辞)

El oráculo no cita el texto clásico aquí.

## La imagen (象傳)

> *i*
`;
    const { failures } = validateJudgmentImageVerbatim(text, cast, "ritual");
    expect(failures).toHaveLength(1);
    expect(failures[0]!.message).toContain("not found");
  });

  it("never checks transformedImage in single-translator mode even with a transformed hexagram", () => {
    const cast = makeCast({
      transformedHexagram: makeHexagram({ number: 51 }),
      textsForClaude: {
        primaryJudgment: "j",
        primaryImage: "i",
        transformedJudgment: "transformed judgment text",
        transformedImage: null,
      },
    });
    const text = `
## El juicio (卦辞)

> *j*

## La imagen (象傳)

> *i*

## El trazado hacia el 之卦

(sin comillas del transformado aquí)
`;
    const { failures } = validateJudgmentImageVerbatim(text, cast, "ritual");
    expect(failures).toHaveLength(0);
  });

  it("labels the check entry as zhouyi (not wilhelm) when interpretationMode is zhouyi", () => {
    const cast = makeCast({
      interpretationMode: "zhouyi",
      textsForClaude: { primaryJudgment: "元亨利貞", primaryImage: "i" },
    });
    const text = `
## El juicio (卦辞)

> *元亨利贞*

## La imagen (象傳)

> *i*
`;
    const { failures } = validateJudgmentImageVerbatim(text, cast, "ritual");
    expect(failures).toHaveLength(1);
    expect((failures[0]!.detail as { translator: string }).translator).toBe("zhouyi");
  });

  it("labels the check entry as legge (not wilhelm) when interpretationMode is legge", () => {
    const cast = makeCast({
      interpretationMode: "legge",
      textsForClaude: { primaryJudgment: "Khien represents what is great and originating.", primaryImage: "i" },
    });
    const text = `
## El juicio (卦辞)

> *altered text, not the literal Legge judgment*

## La imagen (象傳)

> *i*
`;
    const { failures } = validateJudgmentImageVerbatim(text, cast, "ritual");
    expect(failures).toHaveLength(1);
    expect((failures[0]!.detail as { translator: string }).translator).toBe("legge");
  });

  it("returns no failures outside ritual mode (directo/profundizar have no Juicio/Imagen headings)", () => {
    const cast = makeCast({
      textsForClaude: { primaryJudgment: "THE CREATIVE works sublime success.", primaryImage: "i" },
    });
    const text = `## Lectura directa\nRespuesta corta sin headings de juicio/imagen.`;
    expect(validateJudgmentImageVerbatim(text, cast, "directo").failures).toHaveLength(0);
    expect(validateJudgmentImageVerbatim(text, cast, "profundizar").failures).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// validateJudgmentImageVerbatim — master_combined mode (3 labeled blockquotes)
// ---------------------------------------------------------------------------

describe("validateJudgmentImageVerbatim — master_combined mode", () => {
  const cast = makeCast({
    interpretationMode: "master_combined",
    textsForClaude: {
      primaryJudgment: "Wilhelm judgment text.",
      primaryImage: "Wilhelm image text.",
      leggeJudgment: "Legge judgment text.",
      leggeImage: "Legge image text.",
      zhouyiJudgment: "Zhou Yi judgment text.",
      zhouyiImage: "Zhou Yi image text.",
    },
  });

  const GOOD_TEXT = `
## El juicio (卦辞)

**Wilhelm:**
> *Wilhelm judgment text.*

**Legge:**
> *Legge judgment text.*

**Zhou Yi:**
> *Zhou Yi judgment text.*

Síntesis...

## La imagen (象傳)

**Wilhelm:**
> *Wilhelm image text.*

**Legge:**
> *Legge image text.*

**Zhou Yi:**
> *Zhou Yi image text.*
`;

  it("passes when all three traditions are quoted verbatim", () => {
    const { failures } = validateJudgmentImageVerbatim(GOOD_TEXT, cast, "ritual");
    expect(failures).toHaveLength(0);
  });

  it("flags only the altered translator when one of the three quotes is changed", () => {
    const altered = GOOD_TEXT.replace("Legge judgment text.", "Legge judgment text altered.");
    const { failures } = validateJudgmentImageVerbatim(altered, cast, "ritual");
    expect(failures).toHaveLength(1);
    const detail = failures[0]!.detail as { translator: string; field: string };
    expect(detail.translator).toBe("legge");
    expect(detail.field).toBe("judgment");
  });
});

// ---------------------------------------------------------------------------
// Sanity check against the real engine fixture (NO_CHANGING, real Wilhelm text)
// ---------------------------------------------------------------------------

/** Mirrors the MULTILINE BLOCKQUOTES rule (interpretation.ts): every verse
 * line gets its own "> *line*" row, never collapsed into one span. */
function asBlockquote(s: string): string {
  return s
    .split("\n")
    .map((line) => `> *${line}*`)
    .join("\n");
}

describe("validateJudgmentImageVerbatim — real engine fixture", () => {
  it("passes for a real NO_CHANGING cast when judgment/image are quoted as-is", () => {
    const cast = buildCastFixture("NO_CHANGING", "wilhelm");
    const text = `
## El juicio (卦辞)

${asBlockquote(cast.textsForClaude.primaryJudgment)}

## La imagen (象傳)

${asBlockquote(cast.textsForClaude.primaryImage)}
`;
    const { failures } = validateJudgmentImageVerbatim(text, cast, "ritual");
    expect(failures).toHaveLength(0);
  });
});
