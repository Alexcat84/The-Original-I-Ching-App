import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";
import type { CastResult } from "@iching-oracle/iching-engine";
import { createAnthropicClient, callAnthropicWithRetry } from "./anthropic-client.js";
import {
  buildLineCitationRetryParams,
  type SelectedLineText,
} from "./interpretation-line-gate.js";
import {
  hasBlockingFailures,
  validateInterpretationOutput,
  type InterpretationValidationResult,
} from "./interpretation-output-validator.js";
import { InterpretationQualityError } from "./interpretation-quality-error.js";
import type { ResponseMode } from "./interpretation-context.js";
import {
  enforceIChingStructuralConsistency,
} from "./interpretation-gates-helpers.js";

export type GateApplyResult = {
  text: string;
  validation: InterpretationValidationResult;
};

function omittedPositions(cast: CastResult): number[] {
  const selected = new Set(
    cast.textsForClaude.selectedLineTexts.map((l) => l.position),
  );
  return cast.changingLines.filter((p) => !selected.has(p));
}

export function buildExtendedLineCitationRetryParams(
  originalParams: Anthropic.MessageCreateParamsNonStreaming,
  selectedLineTexts: SelectedLineText[],
  cast: CastResult,
  specialYaoReminder?: string,
): Anthropic.MessageCreateParamsNonStreaming {
  const base = buildLineCitationRetryParams(originalParams, selectedLineTexts);
  const omitted = omittedPositions(cast);

  let suffix = "";
  if (specialYaoReminder) {
    suffix += `\n⚠️ MANDATORY SPECIAL YAO — your «Líneas en movimiento» section MUST include a verbatim blockquote (> *exact text*) of the special yao: "${specialYaoReminder}"\n`;
  }
  if (omitted.length > 0) {
    suffix += `\n⚠️ ANTI-FABRICATION — do NOT quote or interpret these changing positions individually (mutation rule excluded them): [${omitted.join(", ")}]. Only interpret INTERPRETED_LINES entries.\n\n`;
  }

  if (!suffix) return base;

  const messages = base.messages as Anthropic.MessageParam[];
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== "user" || !Array.isArray(lastMsg.content)) {
    return base;
  }

  const blocks = lastMsg.content as Anthropic.ContentBlockParam[];
  const first = blocks[0];
  if (first?.type === "text") {
    blocks[0] = {
      type: "text",
      text: (first as { type: "text"; text: string }).text + suffix,
    };
  }

  return { ...base, messages: [...messages.slice(0, -1), { ...lastMsg, content: blocks }] };
}

function logValidationWarnings(
  validation: InterpretationValidationResult,
  context: { provider: string; hexagram: number; streaming: boolean },
): void {
  for (const failure of validation.warnFailures) {
    const event =
      failure.gate === "H1b"
        ? "[iching] line_blockquote_missing"
        : failure.gate === "H4"
          ? "[iching] internal_rule_code_leak"
          : "[iching] interpretation_format_warn";
    Sentry.captureMessage(event, {
      level: "warning",
      tags: { provider: context.provider, hexagram: String(context.hexagram) },
      extra: { gate: failure.gate, streaming: context.streaming, detail: failure.detail },
    });
  }
}

function logBlockingFailures(
  validation: InterpretationValidationResult,
  context: { provider: string; hexagram: number; streaming: boolean },
): void {
  for (const failure of validation.blockingFailures) {
    const event =
      failure.gate === "H1"
        ? "[iching] line_citation_missing"
        : failure.gate === "H3"
          ? "[iching] line_fabrication_detected"
          : "[iching] special_yao_gate_failed";
    Sentry.captureMessage(event, {
      level: "warning",
      tags: { provider: context.provider, hexagram: String(context.hexagram) },
      extra: { gate: failure.gate, streaming: context.streaming, detail: failure.detail },
    });
  }
}

export type ApplyGatesOptions = {
  castResult: CastResult;
  language: string;
  mode: ResponseMode;
  provider: string;
  streaming: boolean;
  /** If set, retry up to twice when blocking gates fail. */
  anthropicRetry?: {
    client: ReturnType<typeof createAnthropicClient>;
    callParams: Anthropic.MessageCreateParamsNonStreaming;
    tier: string;
    method: string;
  };
};

export async function applyInterpretationGates(
  rawCleanText: string,
  options: ApplyGatesOptions,
): Promise<GateApplyResult> {
  const { castResult, language, mode, provider, streaming, anthropicRetry } = options;

  let text = enforceIChingStructuralConsistency(rawCleanText, castResult, language);
  let validation = validateInterpretationOutput(text, castResult, { mode });

  if (hasBlockingFailures(validation) && anthropicRetry) {
    logBlockingFailures(validation, {
      provider,
      hexagram: castResult.primaryHexagram.number,
      streaming,
    });

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const specialYaoReminder = validation.blockingFailures.some(
          (f) => f.gate === "H5" && f.message === "special yao text not cited",
        )
          ? (castResult.textsForClaude.specialYaoText?.trim() || undefined)
          : undefined;
        const retryParams = buildExtendedLineCitationRetryParams(
          anthropicRetry.callParams,
          castResult.textsForClaude.selectedLineTexts,
          castResult,
          specialYaoReminder,
        );
        const retryResp = await callAnthropicWithRetry(
          anthropicRetry.client,
          retryParams,
          {
            tier: anthropicRetry.tier,
            language,
            method: anthropicRetry.method,
          },
          null,
          0,
        );
        const retryFull = retryResp.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { text: string }).text)
          .join("");
        const retryBody = retryFull
          .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
          .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
          .trim();
        if (retryBody.length === 0) continue;

        text = enforceIChingStructuralConsistency(retryBody, castResult, language);
        validation = validateInterpretationOutput(text, castResult, { mode });
        if (!hasBlockingFailures(validation)) break;
      } catch (retryErr) {
        console.warn("[applyInterpretationGates] retry failed", retryErr);
      }
    }
  }

  logValidationWarnings(validation, {
    provider,
    hexagram: castResult.primaryHexagram.number,
    streaming,
  });

  if (hasBlockingFailures(validation)) {
    logBlockingFailures(validation, {
      provider,
      hexagram: castResult.primaryHexagram.number,
      streaming,
    });
    throw new InterpretationQualityError(validation.blockingFailures);
  }

  return { text, validation };
}
