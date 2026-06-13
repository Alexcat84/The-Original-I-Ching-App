import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";

export function createAnthropicClient(apiKey: string, extendedTtl = false): Anthropic {
  const betas = [
    "prompt-caching-2024-07-31",
    "cache-diagnosis-2026-04-07",
    ...(extendedTtl ? ["extended-cache-ttl-2025-04-11"] : []),
  ].join(",");
  return new Anthropic({
    apiKey,
    defaultHeaders: { "anthropic-beta": betas },
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

/**
 * Streaming variant of callAnthropicWithRetry.
 * Calls onDelta for each text token as it arrives.
 * Retry policy: retry ONLY when no delta has been emitted yet (pre-content errors).
 * Post-content errors propagate immediately — recovery-polling handles those paths.
 */
export async function callAnthropicStreamingWithRetry(
  client: Anthropic,
  params: Anthropic.MessageCreateParamsNonStreaming,
  context: { tier: string; language: string; method: string },
  previousMessageId: string | null = null,
  onDelta: (text: string) => void,
  maxRetries = 2,
): Promise<Anthropic.Message & { claudeMessageId: string }> {
  const paramsWithDiag = {
    ...params,
    diagnostics: { previous_message_id: previousMessageId },
  } as Anthropic.MessageCreateParamsNonStreaming;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let firstDeltaEmitted = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stream = client.messages.stream(paramsWithDiag as any);
      stream.on("text", (text: string) => {
        onDelta(text);
        firstDeltaEmitted = true;
      });
      const finalMessage = await stream.finalMessage();
      logCacheDiagnostics(finalMessage);
      return Object.assign(finalMessage, { claudeMessageId: finalMessage.id });
    } catch (error: unknown) {
      if (!firstDeltaEmitted) {
        const err = error as { status?: number; headers?: Record<string, string> };
        if (err.status === 429 && attempt < maxRetries) {
          const retryAfter = parseInt(err.headers?.["retry-after"] ?? "5");
          const delay = Math.min(retryAfter * 1000, (attempt + 1) * 3000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
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
  throw new Error("callAnthropicStreamingWithRetry: unreachable");
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
