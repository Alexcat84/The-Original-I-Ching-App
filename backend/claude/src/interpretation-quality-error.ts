import type { ValidationFailure } from "./interpretation-output-validator.js";

export class InterpretationQualityError extends Error {
  readonly code = "INTERPRETATION_QUALITY_GATE" as const;
  readonly failures: ValidationFailure[];

  constructor(failures: ValidationFailure[]) {
    super(
      `Interpretation failed quality gates: ${failures.map((f) => f.gate).join(", ")}`,
    );
    this.name = "InterpretationQualityError";
    this.failures = failures;
  }
}
