import { getAnthropicModelId } from "./anthropic-model-id.js";

/** Production I Ching path — no temperature (Anthropic API default). */
export const MAX_TOKENS_DEFAULT = 4096;
export const MAX_TOKENS_MASTER_WITH_CONTEXT = 7000;
export const MAX_TOKENS_MASTER_NO_CONTEXT = 5000;

export function resolveInterpretationMaxTokens(
  isMasterCombined: boolean,
  hasContext: boolean,
): number {
  if (isMasterCombined) {
    return hasContext ? MAX_TOKENS_MASTER_WITH_CONTEXT : MAX_TOKENS_MASTER_NO_CONTEXT;
  }
  return MAX_TOKENS_DEFAULT;
}

export function buildAnthropicInterpretationParams(
  env: NodeJS.ProcessEnv,
  options: {
    isMasterCombined: boolean;
    hasContext: boolean;
    modelOverride?: string;
  },
): { model: string; max_tokens: number } {
  return {
    model: options.modelOverride?.trim() || getAnthropicModelId(env),
    max_tokens: resolveInterpretationMaxTokens(
      options.isMasterCombined,
      options.hasContext,
    ),
  };
}
