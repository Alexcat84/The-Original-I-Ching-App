import Anthropic from "@anthropic-ai/sdk";
import type { SessionContext } from "@iching-oracle/context-engine";
import type { OracleBonesCastResult } from "@iching-oracle/oracle-bones-engine";
import type { ConsultationCategory } from "@iching-oracle/image-engine";
import { getAnthropicModelId } from "./anthropic-model-id.js";
import { buildContextBlock, type ResponseMode } from "./interpretation-context.js";
import { loadClaudeEnv } from "./env.js";
import {
  oracleBonesFallbackProse,
  oracleBonesSilentVerdictMessage,
  structuralVerdictLineLocalized,
  verdictNaturalLabelLocalized,
} from "./oracle-bones-structural-i18n.js";
import { normalizeInterpretationPunctuation, stripInterpretationFluff } from "./response-clean.js";

const ORACLE_BONES_SYSTEM = `You are the Royal Diviner (贞人 zhen ren) for a stylized Shang-era oracle bone session in a modern app.
The crack pattern, verdict code, and yes/no alignment are FIXED by the system — you must not contradict them.
Speak plainly about actions, timing, and risk; avoid I Ching hexagram poetry here.
One or two short flowing paragraphs, no bullet lists.
Write entirely in the user's requested language—no mixing Spanish and English (or other pairs) in the same response.
Do not append generic legal or symbolic-vs-prediction disclaimers; the app handles compliance elsewhere.
Typography must be clean: one space after commas/semicolons/colons, no ",." or doubled punctuation, and no glued words after punctuation.
CRITICAL LOGIC RULE:
- If alignment is NEGATIVE, you may ONLY conclude that the POSITIVE charge is not confirmed.
- Never assert the opposite scenario as true/probable from that alone.
- Never chain certainty from prior negatives into a reconstructed story.`;

/** Same token budget for all tiers. */
const MAX_TOKENS = 4096;

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
  };
  return map[language] ?? "English";
}

function isLikelyWrongLanguage(text: string, language: string): boolean {
  const lower = text.toLowerCase();
  const englishSignals = (lower.match(/\b(the|and|with|was|were|is|are|this|that|what|why|then)\b/g) ?? []).length;
  const spanishSignals = (lower.match(/\b(el|la|los|las|con|para|fue|son|esta|este|porque|entonces)\b/g) ?? []).length;
  if (language === "es") return englishSignals >= 6 && englishSignals > spanishSignals * 2;
  if (language === "en") return spanishSignals >= 6 && spanishSignals > englishSignals * 2;
  return false;
}

function enforceOracleBonesConsistency(text: string, cast: OracleBonesCastResult, language: string): string {
  const header = structuralVerdictLineLocalized(cast, language);
  const merged = `${header}\n\n${replaceVerdictCodesWithNaturalLanguage(text, language)}`.trim();
  return normalizeInterpretationPunctuation(merged);
}

function replaceVerdictCodesWithNaturalLanguage(text: string, language: string): string {
  const replacements: Array<[OracleBonesCastResult["verdict"], string]> = [
    ["auspicious_clear", verdictNaturalLabelLocalized("auspicious_clear", language)],
    ["auspicious_moderate", verdictNaturalLabelLocalized("auspicious_moderate", language)],
    ["inauspicious_moderate", verdictNaturalLabelLocalized("inauspicious_moderate", language)],
    ["inauspicious_clear", verdictNaturalLabelLocalized("inauspicious_clear", language)],
    ["silent", verdictNaturalLabelLocalized("silent", language)],
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
  const targetWordCount = "380-500";
  const aff =
    cast.affirmsPositive === null
      ? "ANCESTORS SILENT — no clear yes/no after repeated indeterminate cracks."
      : cast.affirmsPositive
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

  return `
NEW ORACLE BONES CONSULTATION${hasContext ? " (same thread as prior readings)" : ""}:
Positive charge (affirmation tested): "${cast.positiveCharge}"
Negative charge: "${cast.negativeCharge}"
Medium: ${cast.medium} (turtle plastron vs ox scapula — aesthetic only; verdict is fixed)
Crack pattern id: ${cast.patternId}
System verdict code: ${cast.verdict}
Ambiguous rounds before result: ${cast.ambiguousPasses}
Alignment: ${aff}
Public verdict label for user-facing prose: ${verdictNaturalLabelLocalized(cast.verdict, language)}

${modeNote}

INSTRUCTIONS:
- On the FIRST line write exactly: CATEGORY: [category]
  Categories: love_relationship, career_work, health_wellbeing,
  spiritual_inner, family_home, decision_path, conflict_challenge,
  travel_change, general
- Do not invent a different crack shape or verdict.
- Never show raw internal code tokens to users (e.g. "auspicious_clear", "inauspicious_clear"). Use only natural-language labels.
- Keep the verdict tone decisive and explicit. Do not dilute an auspicious_clear / inauspicious_clear outcome with hedging language.
- Anchor certainty to this cast ("in this cast", "en esta tirada"), not to universal proof claims.
- If affirmsPositive is false, do NOT assert opposite scenarios as true/probable; only state non-confirmation of the positive charge.
- If affirmsPositive is null, do NOT force yes/no.
- Length: ${targetWordCount} words
- Respond in ${getLanguageName(language)}
`.trim();
}

export async function generateOracleBonesInterpretation(
  cast: OracleBonesCastResult,
  tier: string,
  context: SessionContext | null,
  mode: ResponseMode,
  language: string,
  env: NodeJS.ProcessEnv = process.env,
  displayName?: string,
): Promise<{ text: string; category: ConsultationCategory }> {
  if (cast.verdict === "silent") {
    return { text: oracleBonesSilentVerdictMessage(language), category: "general" };
  }

  const { ANTHROPIC_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY, GROQ_MODEL } = loadClaudeEnv(env);
  const maxTokens = MAX_TOKENS;
  const model = getAnthropicModelId(env);
  const hasContext = Boolean(context && context.previousConsultations.length > 0);
  const userContent = hasContext && context
    ? `${buildContextBlock(context, language, mode)}\n\n${buildOracleBonesUserContent(cast, tier, language, true, mode)}`
    : buildOracleBonesUserContent(cast, tier, language, false, mode);

  const nameNote =
    displayName?.trim()
      ? `\n\nThe user's name is ${displayName.trim()}. Address them by name naturally and warmly, but don't overdo it — use their name occasionally, not in every message.`
      : "";
  const systemPrompt = `${ORACLE_BONES_SYSTEM}${nameNote}\n\nLANGUAGE: Respond only in ${getLanguageName(language)}.`;

  if (ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userContent }],
      });
      const fullText = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
      const category = (catMatch?.[1] as ConsultationCategory) ?? "decision_path";
      const cleanText = stripInterpretationFluff(
        fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim(),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateOracleBonesInterpretation] Anthropic returned likely wrong language; falling through", {
            language,
            verdict: cast.verdict,
          });
        } else {
          return { text: enforceOracleBonesConsistency(cleanText, cast, language), category };
        }
      }
    } catch (err) {
      console.warn("[generateOracleBonesInterpretation] Anthropic failed, trying fallback chain", err);
    }
  }

  if (OPENROUTER_API_KEY) {
    try {
      const openRouterClient = new Anthropic({
        apiKey: OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://theoriginaliching.com",
          "X-Title": "The Original I Ching App",
        },
      });
      const response = await openRouterClient.messages.create({
        model,
        max_tokens: maxTokens,
        system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: userContent }],
      });
      const fullText = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
      const category = (catMatch?.[1] as ConsultationCategory) ?? "decision_path";
      const cleanText = stripInterpretationFluff(
        fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim(),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateOracleBonesInterpretation] OpenRouter returned likely wrong language; falling through", { language });
        } else {
          return { text: enforceOracleBonesConsistency(cleanText, cast, language), category };
        }
      }
    } catch (err) {
      console.warn("[generateOracleBonesInterpretation] OpenRouter failed, trying Groq fallback", err);
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
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
      const cleanText = stripInterpretationFluff(fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim());
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateOracleBonesInterpretation] Groq returned likely wrong language; using fallback", {
            language,
            verdict: cast.verdict,
          });
        } else {
          return { text: enforceOracleBonesConsistency(cleanText, cast, language), category };
        }
      }
    }
  }

  const fallback = oracleBonesFallbackProse(cast, language);
  return { text: enforceOracleBonesConsistency(fallback, cast, language), category: "decision_path" };
}
