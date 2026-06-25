/**
 * QA code: TS-CLAUDE-002 output-validator · v1.0.0
 * Area: backend/claude/src/interpretation-output-validator
 * Family: CLAUDE
 */

import { describe, it, expect } from "vitest";
import type { CastResult } from "@iching-oracle/iching-engine";
import { buildCastFixture } from "@iching-oracle/iching-engine";
import {
  extractLinesSectionBody,
  validateNoFabricatedLines,
  validateInterpretationOutput,
} from "./interpretation-output-validator.js";

const THREE_MIDDLE_OPENER_OK = `
## Líneas en movimiento
Con tres líneas en movimiento, el oráculo lee la segunda, central de las tres.

> *The second NINE, undivided, shows the pleasure arising from inward sincerity. There will be good fortune. Occasion for repentance will disappear.*

Esta alegría interior sincera…
`;

const THREE_MIDDLE_FABRICATED = `
## Líneas en movimiento
Con tres líneas en movimiento, el oráculo lee la central.

1. **Línea 1** (primera, mutante)
> *Wrong line text for position one.*

> *The second NINE, undivided, shows the pleasure arising from inward sincerity.*
`;

function castFor(rule: "THREE_MIDDLE" | "FIVE_ONLY_STABLE"): CastResult {
  return buildCastFixture(rule, "wilhelm");
}

describe("validateNoFabricatedLines — H3 spec", () => {
  it("passes legitimate opener mentioning línea 2 (THREE_MIDDLE)", () => {
    const cast = castFor("THREE_MIDDLE");
    const { passed } = validateNoFabricatedLines(THREE_MIDDLE_OPENER_OK, cast);
    expect(passed).toBe(true);
  });

  it("fails structured entry for omitted position 1", () => {
    const cast = castFor("THREE_MIDDLE");
    const { passed, fabricated } = validateNoFabricatedLines(
      THREE_MIDDLE_FABRICATED,
      cast,
    );
    expect(passed).toBe(false);
    expect(fabricated).toContain(1);
  });

  it("FIVE_ONLY_STABLE passes when only stable transformed line cited", () => {
    const cast = castFor("FIVE_ONLY_STABLE");
    const text = `
## Líneas en movimiento
Con cinco líneas en movimiento, solo la línea 4 permanece estable del transformado.

> *Shock is mired.*

Quedar atascado en el impacto…
`;
    const { passed } = validateNoFabricatedLines(text, cast);
    expect(passed).toBe(true);
  });
});

describe("extractLinesSectionBody", () => {
  it("strips opener before checking body", () => {
    const body = extractLinesSectionBody(THREE_MIDDLE_OPENER_OK);
    expect(body).toBeTruthy();
    expect(body).toContain("> *The second NINE");
  });
});

describe("validateInterpretationOutput — blocking vs warn", () => {
  it("H1b blockquote missing is warn-only", () => {
    const cast = castFor("FIVE_ONLY_STABLE");
    const inlineOnly = `
## Líneas en movimiento
La línea estable dice Shock is mired. en el transformado.
`;
    const result = validateInterpretationOutput(inlineOnly, cast, { mode: "ritual" });
    expect(result.blockingFailures.some((f) => f.gate === "H1b")).toBe(false);
    expect(result.warnFailures.some((f) => f.gate === "H1b")).toBe(true);
  });
});
