import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";

export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    defaultHeaders: { "anthropic-beta": "prompt-caching-2024-07-31" },
  });
}

export async function callAnthropicWithRetry(
  client: Anthropic,
  params: Anthropic.MessageCreateParamsNonStreaming,
  context: { tier: string; language: string; method: string },
  maxRetries = 2,
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.messages.create(params);
    } catch (error: unknown) {
      const err = error as { status?: number; headers?: Record<string, string> };
      if (err.status === 429 && attempt < maxRetries) {
        const retryAfter = parseInt(err.headers?.["retry-after"] ?? "5");
        const delay = Math.min(retryAfter * 1000, (attempt + 1) * 3000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      Sentry.captureException(error, {
        tags: {
          provider: "anthropic",
          tier: context.tier,
          language: context.language,
          method: context.method,
        },
      });
      throw error;
    }
  }
  throw new Error("callAnthropicWithRetry: unreachable");
}
