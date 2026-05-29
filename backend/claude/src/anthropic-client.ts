import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";

export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    defaultHeaders: {
      "anthropic-beta": "prompt-caching-2024-07-31,cache-diagnosis-2026-04-07",
    },
  });
}

function logCacheDiagnostics(response: Anthropic.Message): void {
  const diag = (response as unknown as Record<string, unknown>).diagnostics as
    | { cache_miss_reason?: { type: string; cache_missed_input_tokens?: number } | null }
    | null
    | undefined;
  if (!diag?.cache_miss_reason) return;
  const { type, cache_missed_input_tokens } = diag.cache_miss_reason;
  console.warn("[claude][cache_miss]", { type, cache_missed_input_tokens });
}

export async function callAnthropicWithRetry(
  client: Anthropic,
  params: Anthropic.MessageCreateParamsNonStreaming,
  context: { tier: string; language: string; method: string },
  previousMessageId: string | null = null,
  maxRetries = 2,
): Promise<Anthropic.Message & { claudeMessageId: string }> {
  const paramsWithDiag = {
    ...params,
    diagnostics: { previous_message_id: previousMessageId },
  } as Anthropic.MessageCreateParamsNonStreaming;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create(paramsWithDiag);
      logCacheDiagnostics(response);
      return Object.assign(response, { claudeMessageId: response.id });
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
