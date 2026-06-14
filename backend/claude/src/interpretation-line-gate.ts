import Anthropic from "@anthropic-ai/sdk";

export type SelectedLineText = {
  position: number;
  text: string;
  fromHexagram: "primary" | "transformed";
};

/**
 * H1 gate — verify Claude quoted every selected line text in its response.
 *
 * Uses the first 28 characters of each line as a fingerprint. This is long
 * enough to be distinctive across all 64×6 = 384 Wilhelm/Legge/ZhouYi line
 * entries, and short enough to survive minor whitespace normalization that
 * Claude sometimes applies around blockquotes.
 *
 * Returns { passed: true } when there are no line texts to validate (e.g.
 * NO_CHANGING, SIX_ALL_CHANGING) so the caller does not need to branch.
 */
export function validateLineCitation(
  text: string,
  selectedLineTexts: SelectedLineText[],
): { passed: boolean; missing: Array<{ position: number; preview: string }> } {
  if (selectedLineTexts.length === 0) return { passed: true, missing: [] };
  const missing: Array<{ position: number; preview: string }> = [];
  for (const lt of selectedLineTexts) {
    const fingerprint = lt.text.slice(0, 28).trim();
    if (fingerprint.length < 2) continue; // skip empty / single-char (classical Chinese still validates at 4+ chars)
    if (!text.includes(fingerprint)) {
      missing.push({ position: lt.position, preview: fingerprint });
    }
  }
  return { passed: missing.length === 0, missing };
}

/**
 * H2 retry — inject a MANDATORY LINE CITATION reminder at the front of the
 * last user message so the retry call forces Claude to include the verbatim
 * blockquote.
 *
 * Works with both V1 (single-turn, array of content blocks) and V2 (multi-turn)
 * message structures because it only touches the last user message.
 */
export function buildLineCitationRetryParams(
  originalParams: Anthropic.MessageCreateParamsNonStreaming,
  selectedLineTexts: SelectedLineText[],
): Anthropic.MessageCreateParamsNonStreaming {
  if (selectedLineTexts.length === 0) return originalParams;

  const reminder =
    '⚠️ MANDATORY LINE CITATION — your "Líneas en movimiento" / "Lines in motion" section MUST include a verbatim blockquote (> *exact text*) for each line below. Do not describe or paraphrase — quote verbatim:\n' +
    selectedLineTexts
      .map((lt) => `  Line ${lt.position} [${lt.fromHexagram}]: "${lt.text}"`)
      .join("\n") +
    "\n\n";

  const messages = originalParams.messages as Anthropic.MessageParam[];
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== "user") return originalParams;

  const existingBlocks: Anthropic.ContentBlockParam[] = Array.isArray(lastMsg.content)
    ? (lastMsg.content as Anthropic.ContentBlockParam[])
    : [{ type: "text" as const, text: lastMsg.content as string }];

  const injected: Anthropic.MessageParam = {
    role: "user",
    content: [{ type: "text", text: reminder }, ...existingBlocks],
  };

  return {
    ...originalParams,
    messages: [...messages.slice(0, -1), injected],
  };
}
