/**
 * Together FLUX `prompt` / `negative_prompt` character budgets for iching generation.
 * Keep in sync with `generateWithTogether` in apps/web (same compaction rules).
 */
export const TOGETHER_FLUX_PROMPT_MAX_CHARS = 2000;
/** FLUX corner seals need keyword budget — stay within Together practical limits. */
export const TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS = 1400;

/** Matches apps/web `compactPrompt`: whitespace normalized, safe unicode subset, head truncation. */
export function compactTogetherFluxPromptSegment(prompt: string, maxLen: number): string {
  return prompt
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, "")
    .slice(0, maxLen);
}
