/**
 * QA code: TS-CLAUDE-001 line-gate · v1.0.0
 * Area: backend/claude/src/interpretation-line-gate
 * Family: CLAUDE
 */

import { describe, it, expect } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import {
  validateLineCitation,
  buildLineCitationRetryParams,
  type SelectedLineText,
} from "./interpretation-line-gate.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Simulates a well-formed Claude response that includes the blockquote. */
const GOOD_RESPONSE_FIVE_STABLE = `
## Encuadre de la pregunta
…

## Líneas en movimiento
Con cinco líneas en movimiento, solo la línea 4 permanece estable. Su texto,
tomado del hexagrama transformado (#51 — La Conmoción), es el que rige la lectura:

> *Shock is mired.*

Quedar atascado en el impacto es la imagen central: no huir del golpe sino…
`;

/** Claude omits the blockquote and replaces it with meta-commentary. */
const BAD_RESPONSE_META_COMMENTARY = `
## Líneas en movimiento
Hay cinco líneas mutantes en esta tirada. Dada la complejidad estructural,
el oráculo no desarrolla aquí por sobrecarga estructural. La energía de la
transformación completa se lee en el hexagrama resultante.
`;

/** Response where the citation text is paraphrased, not verbatim. */
const BAD_RESPONSE_PARAPHRASE = `
## Líneas en movimiento
La única línea estable es la 4. Su mensaje habla de quedar atascado en la conmoción.
`;

/** Good response for a ZhouYi Classical Chinese line text. */
const GOOD_RESPONSE_ZHOUYI = `
## 爻动
震遂泥。此爻静守，示以不动为稳…
`;

/** Good response for ONE_CHANGING (no mutation rule explanation needed). */
const GOOD_RESPONSE_ONE_CHANGING = `
## Lines in motion
> *Perseverance brings good fortune.*

When the bottom line alone changes, this central counsel…
`;

// ---------------------------------------------------------------------------
// validateLineCitation
// ---------------------------------------------------------------------------

describe("validateLineCitation — passes when no line texts (NO_CHANGING / 0-line rules)", () => {
  it("returns passed=true for empty selectedLineTexts", () => {
    const result = validateLineCitation("any response text", []);
    expect(result.passed).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("returns passed=true for SIX_ALL_CHANGING (no line texts, empty rule)", () => {
    const result = validateLineCitation(
      "Solo se lee el juicio del hexagrama transformado.",
      [],
    );
    expect(result.passed).toBe(true);
  });
});

describe("validateLineCitation — H6 regression: FIVE_ONLY_STABLE #44→#51", () => {
  const shockMiredLine: SelectedLineText = {
    position: 4,
    text: "Shock is mired.",
    fromHexagram: "transformed",
  };

  it("passes when blockquote verbatim is present", () => {
    const { passed, missing } = validateLineCitation(GOOD_RESPONSE_FIVE_STABLE, [shockMiredLine]);
    expect(passed).toBe(true);
    expect(missing).toHaveLength(0);
  });

  it("fails when Claude substitutes meta-commentary (the reported P0 bug)", () => {
    const { passed, missing } = validateLineCitation(BAD_RESPONSE_META_COMMENTARY, [shockMiredLine]);
    expect(passed).toBe(false);
    expect(missing).toHaveLength(1);
    expect(missing[0]!.position).toBe(4);
    expect(missing[0]!.preview).toBe("Shock is mired.");
  });

  it("fails when Claude paraphrases instead of quoting verbatim", () => {
    const { passed } = validateLineCitation(BAD_RESPONSE_PARAPHRASE, [shockMiredLine]);
    expect(passed).toBe(false);
  });

  it("passes when citation appears inline (not in blockquote) — fingerprint only checks presence", () => {
    const responseWithInline = `La línea 4 del transformado dice "Shock is mired." — quedarse atascado.`;
    const { passed } = validateLineCitation(responseWithInline, [shockMiredLine]);
    // Gate verifies presence of text, not blockquote syntax — that's enforced by the prompt
    expect(passed).toBe(true);
  });
});

describe("validateLineCitation — ZhouYi Classical Chinese line text", () => {
  const zhouyiLine: SelectedLineText = {
    position: 4,
    text: "震遂泥。",
    fromHexagram: "transformed",
  };

  it("passes when Classical Chinese fingerprint is present", () => {
    const { passed } = validateLineCitation(GOOD_RESPONSE_ZHOUYI, [zhouyiLine]);
    expect(passed).toBe(true);
  });

  it("fails when Classical Chinese text is absent", () => {
    const { passed } = validateLineCitation("No hay texto clásico aquí.", [zhouyiLine]);
    expect(passed).toBe(false);
  });
});

describe("validateLineCitation — ONE_CHANGING (no rule filter, direct quote expected)", () => {
  const oneLine: SelectedLineText = {
    position: 1,
    text: "Perseverance brings good fortune.",
    fromHexagram: "primary",
  };

  it("passes when line text is cited verbatim", () => {
    const { passed } = validateLineCitation(GOOD_RESPONSE_ONE_CHANGING, [oneLine]);
    expect(passed).toBe(true);
  });
});

describe("validateLineCitation — fingerprint edge cases", () => {
  it("skips validation for single-char / empty lines", () => {
    const emptyLine: SelectedLineText = { position: 3, text: " ", fromHexagram: "primary" };
    const { passed } = validateLineCitation("No citation here.", [emptyLine]);
    // fingerprint after trim = "" (length 0 < 2) → skipped → passed
    expect(passed).toBe(true);
  });

  it("validates short 3-char ASCII text — not skipped", () => {
    const shortLine: SelectedLineText = { position: 3, text: "Ok.", fromHexagram: "primary" };
    const { passed } = validateLineCitation("No citation here.", [shortLine]);
    // "Ok." length=3 ≥ 2 → validated → not found → failed
    expect(passed).toBe(false);
  });

  it("uses only first 28 chars as fingerprint — long multi-line Wilhelm text", () => {
    const longText =
      "It must be checked with a brake of bronze.\nPerseverance brings good fortune.\nIf one lets it take its course, one experiences misfortune.";
    const line: SelectedLineText = { position: 1, text: longText, fromHexagram: "primary" };
    const responseContaining28 = "The text reads: It must be checked with a brake";
    const { passed } = validateLineCitation(responseContaining28, [line]);
    expect(passed).toBe(true);
  });

  it("fingerprint truncated at 28 chars matches partial occurrence in response", () => {
    // fingerprint = "Shock is mired." (15 chars < 28, uses full text)
    const line: SelectedLineText = { position: 4, text: "Shock is mired.", fromHexagram: "transformed" };
    const fp = "Shock is mired.";
    expect(fp.length).toBeLessThanOrEqual(28);
    const { passed } = validateLineCitation(`> *${fp}*`, [line]);
    expect(passed).toBe(true);
  });

  it("reports all missing lines when multiple are absent", () => {
    const lines: SelectedLineText[] = [
      { position: 2, text: "ALPHA_LINE_TEXT_UNIQUE", fromHexagram: "primary" },
      { position: 5, text: "BETA_LINE_TEXT_UNIQUE", fromHexagram: "transformed" },
    ];
    const { passed, missing } = validateLineCitation("No citations here.", lines);
    expect(passed).toBe(false);
    expect(missing).toHaveLength(2);
    expect(missing.map((m) => m.position).sort()).toEqual([2, 5]);
  });
});

// ---------------------------------------------------------------------------
// buildLineCitationRetryParams
// ---------------------------------------------------------------------------

function makeBaseParams(
  content: string | Anthropic.ContentBlockParam[],
): Anthropic.MessageCreateParamsNonStreaming {
  return {
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  };
}

describe("buildLineCitationRetryParams — reminder injection", () => {
  const shockMired: SelectedLineText = {
    position: 4,
    text: "Shock is mired.",
    fromHexagram: "transformed",
  };

  it("returns original params unchanged when no line texts", () => {
    const original = makeBaseParams("original question");
    const result = buildLineCitationRetryParams(original, []);
    expect(result).toBe(original); // same reference
  });

  it("injects reminder as the first content block (string content)", () => {
    const original = makeBaseParams("original question");
    const retry = buildLineCitationRetryParams(original, [shockMired]);
    const lastMsg = retry.messages[retry.messages.length - 1]!;
    expect(Array.isArray(lastMsg.content)).toBe(true);
    const blocks = lastMsg.content as Anthropic.ContentBlockParam[];
    expect(blocks[0]!.type).toBe("text");
    expect((blocks[0] as { type: "text"; text: string }).text).toContain("⚠️ MANDATORY LINE CITATION");
    expect((blocks[0] as { type: "text"; text: string }).text).toContain("Shock is mired.");
  });

  it("preserves original content blocks after the reminder", () => {
    const originalBlocks: Anthropic.ContentBlockParam[] = [
      { type: "text", text: "library block" },
      { type: "text", text: "question block" },
    ];
    const original = makeBaseParams(originalBlocks);
    const retry = buildLineCitationRetryParams(original, [shockMired]);
    const blocks = retry.messages[0]!.content as Anthropic.ContentBlockParam[];
    // [reminder, library block, question block]
    expect(blocks).toHaveLength(3);
    expect((blocks[1] as { text: string }).text).toBe("library block");
    expect((blocks[2] as { text: string }).text).toBe("question block");
  });

  it("keeps model and max_tokens from original params", () => {
    const original = makeBaseParams("q");
    const retry = buildLineCitationRetryParams(original, [shockMired]);
    expect(retry.model).toBe(original.model);
    expect(retry.max_tokens).toBe(original.max_tokens);
  });

  it("includes line position and fromHexagram in reminder", () => {
    const line: SelectedLineText = { position: 4, text: "Shock is mired.", fromHexagram: "transformed" };
    const retry = buildLineCitationRetryParams(makeBaseParams("q"), [line]);
    const reminderBlock = (retry.messages[0]!.content as Anthropic.ContentBlockParam[])[0] as { text: string };
    expect(reminderBlock.text).toContain("Line 4 [transformed]");
    expect(reminderBlock.text).toContain('"Shock is mired."');
  });

  it("includes multiple lines in reminder when multiple selectedLineTexts", () => {
    const lines: SelectedLineText[] = [
      { position: 2, text: "ALPHA TEXT", fromHexagram: "primary" },
      { position: 5, text: "BETA TEXT", fromHexagram: "transformed" },
    ];
    const retry = buildLineCitationRetryParams(makeBaseParams("q"), lines);
    const reminderText = ((retry.messages[0]!.content as Anthropic.ContentBlockParam[])[0] as { text: string }).text;
    expect(reminderText).toContain("Line 2 [primary]");
    expect(reminderText).toContain("Line 5 [transformed]");
  });

  it("returns original if last message is not role=user", () => {
    const params: Anthropic.MessageCreateParamsNonStreaming = {
      model: "claude-sonnet-4-6",
      max_tokens: 100,
      messages: [
        { role: "user", content: "q" },
        { role: "assistant", content: "answer" },
      ],
    };
    const result = buildLineCitationRetryParams(params, [shockMired]);
    expect(result).toBe(params);
  });
});

// ---------------------------------------------------------------------------
// Round-trip: gate fails → retry params include reminder → gate passes
// ---------------------------------------------------------------------------

describe("round-trip: gate failure → retry with reminder → expected citation", () => {
  it("produces retry params that would satisfy validateLineCitation if Claude complies", () => {
    const line: SelectedLineText = {
      position: 4,
      text: "Shock is mired.",
      fromHexagram: "transformed",
    };

    // 1. Gate fails on the bad response
    const { passed: firstPassed } = validateLineCitation(BAD_RESPONSE_META_COMMENTARY, [line]);
    expect(firstPassed).toBe(false);

    // 2. Retry params include the reminder with the exact line text
    const retryParams = buildLineCitationRetryParams(makeBaseParams("original"), [line]);
    const reminderText = ((retryParams.messages[0]!.content as Anthropic.ContentBlockParam[])[0] as { text: string }).text;
    expect(reminderText).toContain("Shock is mired.");

    // 3. Simulate Claude obeying the reminder
    const retryResponse = `## Líneas en movimiento\nCinco mutantes; línea 4 estable del transformado.\n\n> *Shock is mired.*\n\nQuedar atascado…`;
    const { passed: retryPassed } = validateLineCitation(retryResponse, [line]);
    expect(retryPassed).toBe(true);
  });
});
