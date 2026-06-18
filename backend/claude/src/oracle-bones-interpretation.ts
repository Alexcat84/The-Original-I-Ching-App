import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";
import type { SessionContext } from "@iching-oracle/context-engine";
import type { OracleBonesCastResult } from "@iching-oracle/oracle-bones-engine";
import type { ConsultationCategory } from "@iching-oracle/image-engine";
import { getAnthropicModelId } from "./anthropic-model-id.js";
import { createAnthropicClient, callAnthropicWithRetry } from "./anthropic-client.js";
import { buildHistoricalContext, buildCurrentContext, buildV2HistoricalUserBlock, type ResponseMode } from "./interpretation-context.js";
import type { ClaudeUsage } from "./interpretation.js";
import { loadClaudeEnv } from "./env.js";
import {
  oracleBonesFallbackProse,
  structuralVerdictLineLocalized,
  verdictNaturalLabelLocalized,
} from "./oracle-bones-structural-i18n.js";
import { normalizeInterpretationPunctuation, stripInterpretationFluff, stripSnapshotLeaks } from "./response-clean.js";

const ORACLE_BONES_SYSTEM = `You are the Royal Diviner (贞人 zhen ren) for a stylized Shang-era oracle bone session in a modern app.
The crack pattern, verdict code, and yes/no alignment are FIXED by the system — you must not contradict them.
Speak plainly about actions, timing, and risk; avoid I Ching hexagram poetry here.
One or two short flowing paragraphs, no bullet lists.
Write entirely in the user's requested language—no mixing Spanish and English (or other pairs) in the same response.
Do not append generic legal or symbolic-vs-prediction disclaimers; the app handles compliance elsewhere.
Typography must be clean: one space after commas/semicolons/colons, no ",." or doubled punctuation, and no glued words after punctuation. NEVER use em-dashes (—) or hyphens (-) as clause separators in prose; replace them with commas, semicolons, or periods.
CRITICAL LOGIC RULE:
- If alignment is NEGATIVE, you may ONLY conclude that the POSITIVE charge is not confirmed.
- Never assert the opposite scenario as true/probable from that alone.
- Never chain certainty from prior negatives into a reconstructed story.`;

/** Same token budget for all tiers. */
const MAX_TOKENS = 4096;
const LOG_CLAUDE_CACHE_METRICS =
  process.env.LOG_CLAUDE_CACHE_METRICS === "1" ||
  process.env.LOG_CLAUDE_CACHE_METRICS === "true" ||
  process.env.NODE_ENV === "development";

function toUsageRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function numberField(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

type CacheUsageMeta = {
  tier: string;
  method: string;
  language: string;
  sessionPosition: number;
  generationMs: number;
};

function logCacheUsage(
  source: "anthropic" | "openrouter",
  usageRaw: unknown,
  meta: CacheUsageMeta,
): void {
  if (!LOG_CLAUDE_CACHE_METRICS) return;
  const usage = toUsageRecord(usageRaw);
  const inputTokens = numberField(usage, "input_tokens");
  const outputTokens = numberField(usage, "output_tokens");
  const cacheReadTokens = numberField(usage, "cache_read_input_tokens");
  const cacheCreationTokens = numberField(usage, "cache_creation_input_tokens");
  const cacheReadRatio =
    inputTokens && inputTokens > 0 && cacheReadTokens !== null
      ? `${((cacheReadTokens / inputTokens) * 100).toFixed(2)}%`
      : "n/a";
  console.log("[generateOracleBonesInterpretation][cache_usage]", {
    source,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheCreationTokens,
    cacheReadRatio,
    ...meta,
  });
}

function getLanguageName(language: string): string {
  const map: Record<string, string> = {
    es: "Spanish",
    en: "English",
    pt: "Portuguese",
    fr: "French",
    de: "German",
    it: "Italian",
    ja: "Japanese",
    zh: "Chinese",
    ko: "Korean",
    ar: "Arabic",
    hi: "Hindi",
  };
  return map[language] ?? "English";
}

function isLikelyWrongLanguage(text: string, language: string): boolean {
  const lower = text.toLowerCase();
  const englishSignals = (
    lower.match(
      /\b(the|and|with|was|were|is|are|this|that|what|why|then)\b/g,
    ) ?? []
  ).length;
  const spanishSignals = (
    lower.match(
      /\b(el|la|los|las|con|para|fue|son|esta|este|porque|entonces)\b/g,
    ) ?? []
  ).length;
  const italianSignals = (
    lower.match(
      /\b(che|del|della|delle|degli|per|sono|questo|questa|dal|nella|degli)\b/g,
    ) ?? []
  ).length;
  const portugueseSignals = (
    lower.match(
      /\b(que|com|para|uma|não|mas|pelo|pela|isso|este|essa|também)\b/g,
    ) ?? []
  ).length;
  if (language === "es")
    return (
      (englishSignals >= 6 && englishSignals > spanishSignals * 2) ||
      (italianSignals >= 6 && italianSignals > spanishSignals * 2) ||
      (portugueseSignals >= 8 && portugueseSignals > spanishSignals * 3)
    );
  if (language === "en")
    return (
      (spanishSignals >= 6 && spanishSignals > englishSignals * 2) ||
      (italianSignals >= 6 && italianSignals > englishSignals * 2)
    );
  if (language === "it")
    return spanishSignals >= 6 && spanishSignals > italianSignals * 2;
  if (language === "pt")
    return englishSignals >= 6 && englishSignals > portugueseSignals * 2;
  return false;
}

function enforceOracleBonesConsistency(text: string, cast: OracleBonesCastResult, language: string): string {
  const header = structuralVerdictLineLocalized(cast, language);
  const normalizedBody = sanitizeOracleBonesBody(
    replaceVerdictCodesWithNaturalLanguage(text, language),
    header,
    language,
  );
  const merged = `${header}\n\n---\n\n${normalizedBody}`.trim();
  return normalizeInterpretationPunctuation(merged);
}

const STRUCTURAL_DUPLICATE_MARKERS = [
  "structural verdict",
  "veredicto estructural",
  "veredito estrutural",
  "verdict structurel",
  "strukturelles urteil",
  "verdetto strutturale",
  "構造上の裁定",
  "结构裁定",
  "구조적 판정",
  "الحكم البنيوي",
  "संरचनात्मक निर्णय",
];

function lineHasStructuralMarker(line: string): boolean {
  const normalized = line.toLowerCase();
  return STRUCTURAL_DUPLICATE_MARKERS.some((marker) => normalized.includes(marker));
}

function stripLeadingEmojiFromTitles(line: string): string {
  // Remove decorative leading emoji from Markdown headings and bold title lines.
  let out = line.replace(
    /^(\s{0,3}#{1,6}\s+)(?:[\p{Extended_Pictographic}\uFE0F\u200D]+\s*)+/u,
    "$1",
  );
  out = out.replace(
    /^(\s{0,3}\*\*\s*)(?:[\p{Extended_Pictographic}\uFE0F\u200D]+\s*)+/u,
    "$1",
  );
  return out;
}

function interpretationHeadingLocalized(language: string): string {
  const map: Record<string, string> = {
    es: "Lo que esto significa para ti",
    en: "What this means for you",
    pt: "O que isso significa para ti",
    fr: "Ce que cela signifie pour vous",
    de: "Was das fuer dich bedeutet",
    it: "Cosa significa questo per te",
    ja: "これがあなたにとって意味すること",
    zh: "这对你意味着什么",
    ko: "이것이 당신에게 의미하는 바",
    ar: "ما يعنيه هذا بالنسبة لك",
    hi: "यह आपके लिए क्या मायने रखता है",
  };
  const base = language.trim().toLowerCase().split("-")[0];
  return map[base] ?? map.en;
}

function finalGuidanceHeadingLocalized(language: string): string {
  const map: Record<string, string> = {
    es: "Claridad para tus pasos",
    en: "Clarity for your next steps",
    pt: "Clareza para seus próximos passos",
    fr: "Clarte pour vos prochains pas",
    de: "Klarheit fuer deine naechsten Schritte",
    it: "Chiarezza per i tuoi prossimi passi",
    ja: "次の一歩への明晰さ",
    zh: "给你下一步的清晰方向",
    ko: "다음 걸음을 위한 명확함",
    ar: "وضوح لخطواتك القادمة",
    hi: "आपके अगले कदमों के लिए स्पष्टता",
  };
  const base = language.trim().toLowerCase().split("-")[0];
  return map[base] ?? map.en;
}

function sanitizeOracleBonesBody(text: string, header: string, language: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((line) => stripLeadingEmojiFromTitles(line));

  const headerLower = header.toLowerCase();
  let seenStructuralLine = false;
  const filtered = lines.filter((line) => {
    if (!line.trim()) return true;
    const lower = line.toLowerCase();
    if (lower === headerLower) return false;
    if (!lineHasStructuralMarker(line)) return true;
    if (!seenStructuralLine) {
      seenStructuralLine = true;
      return false;
    }
    return false;
  });

  // Normalize Markdown headings: last → guidance heading; first (if ≥2) → interpretation heading + --- divider.
  const headingIndexes: number[] = [];
  for (let i = 0; i < filtered.length; i += 1) {
    if (/^\s{0,3}#{1,6}\s+\S/.test(filtered[i] ?? "")) headingIndexes.push(i);
  }
  if (headingIndexes.length > 0) {
    // Process from back to front so splices don't invalidate earlier indexes.

    // Last heading: normalize + ensure --- precedes it.
    const lastIdx = headingIndexes[headingIndexes.length - 1]!;
    const lastLine = filtered[lastIdx] ?? "";
    const lastM = lastLine.match(/^(\s{0,3}#{1,6}\s+).+$/);
    if (lastM) {
      filtered[lastIdx] = `${lastM[1]}${finalGuidanceHeadingLocalized(language)}`;
      const lastPrev = [...filtered.slice(0, lastIdx)].reverse().find((l) => l.trim().length > 0);
      if (lastPrev?.trim() !== "---") {
        filtered.splice(lastIdx, 0, "---");
      }
    }

    // First heading (when there are ≥2): normalize + ensure --- precedes it.
    if (headingIndexes.length >= 2) {
      const firstIdx = headingIndexes[0]!;
      const firstLine = filtered[firstIdx] ?? "";
      const firstM = firstLine.match(/^(\s{0,3}#{1,6}\s+).+$/);
      if (firstM) {
        filtered[firstIdx] = `${firstM[1]}${interpretationHeadingLocalized(language)}`;
        const firstPrev = [...filtered.slice(0, firstIdx)].reverse().find((l) => l.trim().length > 0);
        if (firstPrev?.trim() !== "---") {
          filtered.splice(firstIdx, 0, "---");
        }
      }
    }
  }

  return filtered.join("\n").trim();
}

function fallbackInterpretationSummary(text: string): string {
  const clean = text
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  const clipped = clean.slice(0, 420);
  const lastPunctuation = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("? "),
  );
  return (lastPunctuation > 180 ? clipped.slice(0, lastPunctuation + 1) : clipped).trim();
}

function replaceVerdictCodesWithNaturalLanguage(text: string, language: string): string {
  const replacements: Array<[OracleBonesCastResult["verdict"], string]> = [
    ["auspicious_clear", verdictNaturalLabelLocalized("auspicious_clear", language)],
    ["auspicious_moderate", verdictNaturalLabelLocalized("auspicious_moderate", language)],
    ["inauspicious_moderate", verdictNaturalLabelLocalized("inauspicious_moderate", language)],
    ["inauspicious_clear", verdictNaturalLabelLocalized("inauspicious_clear", language)],
  ];
  let out = text;
  for (const [code, label] of replacements) {
    out = out.replace(new RegExp(`\\b${code}\\b`, "gi"), label);
  }
  return out;
}

function buildOracleBonesUserContent(
  cast: OracleBonesCastResult,
  _tier: string,
  language: string,
  hasContext: boolean,
  mode: ResponseMode,
): string {
  const targetWordCount = hasContext ? "420-550" : "380-500";
  const aff = cast.affirmsPositive
    ? "Verdict aligns with the POSITIVE charge (favorable to proceeding as stated)."
    : "Verdict aligns with the NEGATIVE charge (not favorable as the positive charge claims).";

  const modeNote =
    mode === "profundizar"
      ? language === "es"
        ? "Modo profundizar: conecta brevemente con la consulta previa (una frase) y aporta matices nuevos a ESTE resultado de grietas."
        : "Deepen mode: at most one sentence links to the prior message; add new nuance to THIS crack outcome only."
      : language === "es"
        ? "Explica en lenguaje directo qué implica el veredicto para la decisión del consultante."
        : "Explain plainly what the verdict implies for the querent’s decision.";
  const threadMemoryNote =
    hasContext
      ? language === "es"
        ? "OBLIGATORIO: el primer párrafo debe incluir de forma natural una referencia COMPLETA a todas las consultas del hilo en orden cronológico. ORDEN OBLIGATORIO: empieza SIEMPRE por la tirada más antigua (posición 1) y avanza linealmente hasta la más reciente; NUNCA empieces por la más reciente para ir hacia atrás. Para cada tirada I Ching menciona el hexagrama con su transformación completa si la hay (ej: \"#16 El Entusiasmo mutando en #40 La Liberación, segunda línea\"); para otras tiradas de huesos menciona el veredicto y la temática que confirmó. Dirígete al usuario por nombre si lo conoces. No abras con una cadena de flechas sola: integra los datos dentro de la prosa. No uses guiones (— ni -) como separadores; usa comas, punto y coma o puntos. Sin encabezado separado; fluye directamente en el párrafo."
        : "MANDATORY: the opening paragraph must naturally reference ALL prior consultations in chronological order. ORDER IS MANDATORY: always start from the oldest consultation (position 1) and advance linearly to the most recent; NEVER start from the most recent and go backwards. For each I Ching cast name the hexagram with its full transformation if any (e.g., \"#16 Enthusiasm transforming into #40 Deliverance, second line\"); for other oracle bones casts name the verdict and the topic it confirmed. Address the user by name if known. Do not open with a bare arrow chain; integrate the data into prose. Do not use dashes (— or -) as separators; use commas, semicolons, or periods. No separate heading; flow directly."
      : language === "es"
        ? "Sin historial previo: no inventes continuidad."
        : "No prior thread context: do not invent continuity.";

  return `
NEW ORACLE BONES CONSULTATION${hasContext ? " (same thread as prior readings)" : ""}:
Positive charge (affirmation tested): "${cast.positiveCharge}"
Negative charge: "${cast.negativeCharge}"
Medium: ${cast.medium} (turtle plastron vs ox scapula — aesthetic only; verdict is fixed)
Crack pattern id: ${cast.patternId}
System verdict code: ${cast.verdict}
Alignment: ${aff}
Public verdict label for user-facing prose: ${verdictNaturalLabelLocalized(cast.verdict, language)}

${modeNote}
${threadMemoryNote}

INSTRUCTIONS:
- On the FIRST line write exactly: CATEGORY: [category]
  Categories: love_relationship, career_work, health_wellbeing,
  spiritual_inner, family_home, decision_path, conflict_challenge,
  travel_change, general
- Do not invent a different crack shape or verdict.
- Never show raw internal code tokens to users (e.g. "auspicious_clear", "inauspicious_clear"). Use only natural-language labels.
- Keep the verdict tone decisive and explicit. Do not dilute an auspicious_clear / inauspicious_clear outcome with hedging language.
- Use exactly two ## section headings: first "## ${interpretationHeadingLocalized(language)}" (place a --- horizontal rule on its own line immediately before it), then "## ${finalGuidanceHeadingLocalized(language)}" as the closing section.
- Anchor certainty to this cast ("in this cast", "en esta tirada"), not to universal proof claims.
- If affirmsPositive is false, do NOT assert opposite scenarios as true/probable; only state non-confirmation of the positive charge.
- If affirmsPositive is null, do NOT force yes/no.
- MEMORY SNAPSHOT (MANDATORY, end of response):
  Append exactly this block at the end:
  [SNAPSHOT_START]
  THREAD_LINK: 2-3 sentences tracing the FULL session arc — name every hexagram or oracle verdict that appeared in this session (in order), the direction they traced together, and the user's concrete next step. Never reference only the immediately prior consultation; always span from session start to now.
  ACTION_CORE: one concrete next-step action for the user in second person, directly tied to that continuity.
  SYMBOLS_MIN: optional one short line only if strictly needed (max one oracle symbol/verdict mention); prioritize personal thread over technical labels.
  [SNAPSHOT_END]
- Snapshot must be concise (80-130 words total), high-signal, specific, and personal-first (no vague generic phrasing).
- Length: ${targetWordCount} words
- Respond in ${getLanguageName(language)}
`.trim();
}

function isPromptV2Enabled(env: NodeJS.ProcessEnv): boolean {
  return env.ANTHROPIC_PROMPT_V2 === "1" || env.ANTHROPIC_PROMPT_V2 === "true";
}

export async function generateOracleBonesInterpretation(
  cast: OracleBonesCastResult,
  tier: string,
  context: SessionContext | null,
  mode: ResponseMode,
  language: string,
  env: NodeJS.ProcessEnv = process.env,
  displayName?: string,
  previousMessageId?: string | null,
): Promise<{
  text: string;
  category: ConsultationCategory;
  interpretationSummary: string;
  claudeMessageId?: string;
  usage?: ClaudeUsage | null;
}> {
  const { ANTHROPIC_API_KEY, OPENROUTER_API_KEY, OPENROUTER_MODEL, GROQ_API_KEY, GROQ_MODEL } = loadClaudeEnv(env);
  const maxTokens = MAX_TOKENS;
  const model = getAnthropicModelId(env);
  const hasContext = Boolean(context && context.previousConsultations.length > 0);
  const historicalBlock =
    hasContext && context && context.previousConsultations.length > 1
      ? buildHistoricalContext(context.previousConsultations.slice(0, -1), language, mode)
      : "";
  const currentBlock =
    hasContext && context
      ? buildCurrentContext(context, context.previousConsultations.at(-1), language, mode)
      : "";
  const contextBlock = [historicalBlock, currentBlock].filter(Boolean).join("\n\n");
  const consultBlock = buildOracleBonesUserContent(
    cast,
    tier,
    language,
    hasContext,
    mode,
  );
  const nameNote = displayName?.trim()
    ? `The user's name is ${displayName.trim()}. Always address them DIRECTLY in second person ("you" / "tú" / "vous" etc.). You may use their name warmly when it fits naturally (e.g., "Ronald, esto sugiere...") but NEVER narrate them in third person (e.g., "Ronald podría..." is WRONG — write "podrías..." or "Ronald, podrías..." instead).\n\n`
    : "";
  const consultBlockWithName = `${nameNote}${consultBlock}`;
  const userContent = contextBlock
    ? `${contextBlock}\n\n${consultBlockWithName}`
    : consultBlockWithName;

  if (ANTHROPIC_API_KEY) {
    try {
      const useV2 = isPromptV2Enabled(env);
      const client = createAnthropicClient(ANTHROPIC_API_KEY, useV2);

      // V2: historical consultations become real user/assistant pairs with cache breakpoint.
      // Current user message contains only the current consultation block + optional theme.
      let anthropicMessages: Anthropic.MessageParam[];
      if (useV2 && context && context.previousConsultations.length > 0) {
        const priorConsultations = context.previousConsultations;
        anthropicMessages = [];
        for (let i = 0; i < priorConsultations.length; i++) {
          const c = priorConsultations[i];
          const isBreakpoint = i === priorConsultations.length - 1;
          anthropicMessages.push({
            role: "user",
            content: [{ type: "text", text: buildV2HistoricalUserBlock(c, language) }],
          });
          const assistantBlock = isBreakpoint
            ? { type: "text" as const, text: c.interpretationSummary, cache_control: { type: "ephemeral" as const } }
            : { type: "text" as const, text: c.interpretationSummary };
          anthropicMessages.push({ role: "assistant", content: [assistantBlock] });
        }
        // Current turn: theme + continuity block (without historical listing) + consultation
        const themeOnlyBlock = buildCurrentContext(context, undefined, language, mode);
        anthropicMessages.push({
          role: "user",
          content: themeOnlyBlock.trim()
            ? [{ type: "text", text: themeOnlyBlock }, { type: "text", text: consultBlockWithName }]
            : [{ type: "text", text: consultBlockWithName }],
        });
      } else {
        // V1 path (or V2 with no prior history — same structure)
        anthropicMessages = [
          {
            role: "user",
            content: [
              ...(contextBlock
                ? [{ type: "text" as const, text: contextBlock, cache_control: { type: "ephemeral" as const } }]
                : []),
              { type: "text" as const, text: consultBlockWithName },
            ],
          },
        ];
      }

      const anthropicCallStart = Date.now();
      const response = await callAnthropicWithRetry(
        client,
        {
          model,
          max_tokens: maxTokens,
          system: [
            {
              type: "text",
              text: ORACLE_BONES_SYSTEM,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: anthropicMessages,
        },
        { tier, language, method: "oracle-bones" },
        previousMessageId ?? null,
      );
      const fullText = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      logCacheUsage("anthropic", response.usage, {
        tier,
        method: "oracle-bones",
        language,
        sessionPosition: (context?.previousConsultations?.length ?? 0) + 1,
        generationMs: Date.now() - anthropicCallStart,
      });
      const usageRecord = toUsageRecord(response.usage);
      const claudeUsage: ClaudeUsage = {
        inputTokens: numberField(usageRecord, "input_tokens"),
        outputTokens: numberField(usageRecord, "output_tokens"),
        cacheReadTokens: numberField(usageRecord, "cache_read_input_tokens"),
        cacheCreationTokens: numberField(usageRecord, "cache_creation_input_tokens"),
        cacheReadRatio: (() => {
          const inp = numberField(usageRecord, "input_tokens");
          const hit = numberField(usageRecord, "cache_read_input_tokens");
          return inp && inp > 0 && hit !== null ? Math.round((hit / inp) * 100) / 100 : null;
        })(),
        model: getAnthropicModelId(env),
      };
      const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
      const category = (catMatch?.[1] as ConsultationCategory) ?? "decision_path";
      const snapshotMatch = fullText.match(
        /\[SNAPSHOT_START\]([\s\S]*?)\[SNAPSHOT_END\]/,
      );
      const interpretationSummary = snapshotMatch
        ? snapshotMatch[1].trim()
        : fallbackInterpretationSummary(fullText);
      const cleanText = stripInterpretationFluff(
        stripSnapshotLeaks(
          fullText
            .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
            .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
            .trim(),
        ),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateOracleBonesInterpretation] Anthropic returned likely wrong language; falling through", {
            language,
            verdict: cast.verdict,
          });
        } else {
          return {
            text: enforceOracleBonesConsistency(cleanText, cast, language),
            category,
            interpretationSummary,
            claudeMessageId: response.claudeMessageId,
            usage: claudeUsage,
          };
        }
      }
    } catch (err) {
      console.warn("[generateOracleBonesInterpretation] Anthropic failed, trying fallback chain", err);
      Sentry.captureException(err, {
        tags: { provider: "anthropic", tier, language, method: "oracle-bones" },
        extra: { verdict: cast.verdict, medium: cast.medium },
      });
    }
  }

  if (OPENROUTER_API_KEY) {
    try {
      const orModel = OPENROUTER_MODEL ?? "openai/gpt-4o";
      const openRouterCallStart = Date.now();
      const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://theoriginaliching.com",
          "X-Title": "The Original I Ching App",
        },
        body: JSON.stringify({
          model: orModel,
          temperature: 0.7,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: ORACLE_BONES_SYSTEM },
            { role: "user", content: userContent },
          ],
        }),
      });
      if (!orResponse.ok) throw new Error(`OpenRouter HTTP ${orResponse.status}`);
      const orData = (await orResponse.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: unknown;
      };
      const fullText = orData.choices?.[0]?.message?.content ?? "";
      logCacheUsage("openrouter", orData.usage, {
        tier,
        method: "oracle-bones",
        language,
        sessionPosition: (context?.previousConsultations?.length ?? 0) + 1,
        generationMs: Date.now() - openRouterCallStart,
      });
      const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
      const category = (catMatch?.[1] as ConsultationCategory) ?? "decision_path";
      const snapshotMatch = fullText.match(
        /\[SNAPSHOT_START\]([\s\S]*?)\[SNAPSHOT_END\]/,
      );
      const interpretationSummary = snapshotMatch
        ? snapshotMatch[1].trim()
        : fallbackInterpretationSummary(fullText);
      const cleanText = stripInterpretationFluff(
        stripSnapshotLeaks(
          fullText
            .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
            .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
            .trim(),
        ),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateOracleBonesInterpretation] OpenRouter returned likely wrong language; falling through", { language });
        } else {
          return {
            text: enforceOracleBonesConsistency(cleanText, cast, language),
            category,
            interpretationSummary,
          };
        }
      }
    } catch (err) {
      console.warn("[generateOracleBonesInterpretation] OpenRouter failed, trying Groq fallback", err);
      Sentry.captureException(err, {
        tags: { provider: "openrouter", tier, language, method: "oracle-bones" },
        extra: { verdict: cast.verdict, medium: cast.medium },
      });
    }
  }

  if (GROQ_API_KEY) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.45,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: ORACLE_BONES_SYSTEM },
          // Groq has strict token limits — strip context history to avoid 413
          { role: "user", content: consultBlockWithName },
        ],
      }),
    });
    if (response.ok) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const fullText = data.choices?.[0]?.message?.content ?? "";
      const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
      const category = (catMatch?.[1] as ConsultationCategory) ?? "decision_path";
      const snapshotMatch = fullText.match(
        /\[SNAPSHOT_START\]([\s\S]*?)\[SNAPSHOT_END\]/,
      );
      const interpretationSummary = snapshotMatch
        ? snapshotMatch[1].trim()
        : fallbackInterpretationSummary(fullText);
      const cleanText = stripInterpretationFluff(
        stripSnapshotLeaks(
          fullText
            .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
            .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
            .trim(),
        ),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateOracleBonesInterpretation] Groq returned likely wrong language; using fallback", {
            language,
            verdict: cast.verdict,
          });
        } else {
          return {
            text: enforceOracleBonesConsistency(cleanText, cast, language),
            category,
            interpretationSummary,
          };
        }
      }
    }
  }

  const fallback = oracleBonesFallbackProse(cast, language);
  const text = enforceOracleBonesConsistency(fallback, cast, language);
  return {
    text,
    category: "decision_path",
    interpretationSummary: fallbackInterpretationSummary(text),
  };
}
