/**
 * One Claude model for all product tiers (I Ching + oracle bones).
 * Set ANTHROPIC_MODEL in env to match the exact ID shown in the Anthropic Console / docs.
 */
export function getAnthropicModelId(env: NodeJS.ProcessEnv = process.env): string {
  const id = env.ANTHROPIC_MODEL?.trim();
  if (id) return id;
  return "claude-sonnet-4-5";
}
