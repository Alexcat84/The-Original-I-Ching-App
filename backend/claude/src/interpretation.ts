import Anthropic from "@anthropic-ai/sdk";
import type { SessionContext } from "@iching-oracle/context-engine";
import type { CastingMethod, CastResult } from "@iching-oracle/iching-engine";
import type { ConsultationCategory } from "@iching-oracle/image-engine";
import { getAnthropicModelId } from "./anthropic-model-id.js";
import { loadClaudeEnv } from "./env.js";
import { buildContextBlock, type ResponseMode } from "./interpretation-context.js";
import {
  changingLinePositionsLabel,
  ichingStructuralCorrectionAppendix,
} from "./interpretation-structural-i18n.js";
import { normalizeInterpretationPunctuation, stripInterpretationFluff } from "./response-clean.js";

export type { ResponseMode } from "./interpretation-context.js";

const SYSTEM_PROMPT = `You are the Sage of the Oracle — an interpreter of the I Ching with deep knowledge of Wilhelm/Baynes, Zhu Xi, and the Confucian commentaries.

ABSOLUTE RULES:
1. Interpret ONLY with the classical texts provided.
2. If there are previous consultations in context, explicitly reference earlier hexagrams for continuity.
3. Never invent meanings — only connect texts with the question.
4. Poetic, profound language in the requested language.
5. TYPOGRAPHY — identical rules for Three Coins and Yarrow Stalks:
   • ## for section headings only (Markdown bold; never add italic to headings).
   • *italic* for every hexagram text quoted inline — Judgment, Image, line texts from the supplied JSON. Italic only, NEVER bold (**), NEVER bold-italic (***). This is the single most important typography rule.
   • Plain text for your own prose — NEVER use bold (**) or any other markers that look like AI generation.
   • > blockquote when reproducing the full primary Judgment; for line texts inside numbered lists use *italic*, not blockquote.
   • Numbered lists (1. 2. …) for changing lines: *italic* line text followed by a plain sentence of application.
   • MONOLINGUAL: entire response in one language only (the user's). Headings and glosses in that language; classical Chinese only inside blockquotes with immediate translation — never mix e.g. English titles in a Spanish answer.
6. Never present unverified real-world facts (numbers, identities, private or biographical details) as certain truth.
7. If the user asks for factual external data that cannot be verified from the provided I Ching texts, explicitly say you cannot verify that fact and then continue with symbolic interpretation.
8. Never add generic legal or "simbólica vs predicción" disclaimer paragraphs (e.g. "Es importante tener en cuenta…"). Never end with an asterisk-wrapped footnote; compliance copy lives outside the reading in the app.
9. ANTI-REPETITION: Each concrete point (a line's counsel, a judgment phrase, a practical recommendation) appears at most once in the entire answer. Do not restate the same advice across sections with different wording.
10. GROUNDING: Every interpretive claim must tether to the supplied judgment, Image, or line text—paraphrase or quote in blockquote, then bridge to the question. Avoid vague uplift that could apply to any hexagram.
11. TYPOGRAPHY: enforce clean punctuation and spacing in the response language: one space after commas/semicolons/colons, no ",." or double punctuation, no glued tokens after punctuation, and no unintended uppercase after commas.`;

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
    ar: "Arabic",
    hi: "Hindi",
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

function offlineFallbackText(castResult: CastResult, language: string, reason: "groq_error" | "no_model_api_key"): string {
  if (language === "es") {
    return `[Sin conexión / ${reason}] Lectura provisional para el hexagrama #${castResult.primaryHexagram.number}. ${castResult.textsForClaude.ruleExplanation}`;
  }
  if (language === "en") {
    return `[Offline / ${reason}] Mock interpretation for hexagram #${castResult.primaryHexagram.number}. ${castResult.textsForClaude.ruleExplanation}`;
  }
  return `[Offline / ${reason}] ${getLanguageName(language)} reading fallback for hexagram #${castResult.primaryHexagram.number}. ${castResult.textsForClaude.ruleExplanation}`;
}

function claimedChangingCount(text: string): number | null {
  const lower = text.toLowerCase();
  if (
    /sin l[ií]neas?\s+(en\s+)?(movimiento|mutaci[oó]n|mutantes?)/i.test(lower) ||
    /no changing lines?/i.test(lower) ||
    /without changing lines?/i.test(lower)
  ) {
    return 0;
  }
  if (/l[ií]nea\s+[uú]nica|[uú]nica\s+l[ií]nea|one changing line/i.test(lower)) return 1;
  if (/dos\s+l[ií]neas|2\s+l[ií]neas|two changing lines?/i.test(lower)) return 2;
  if (/tres\s+l[ií]neas|3\s+l[ií]neas|three changing lines?/i.test(lower)) return 3;
  if (/cuatro\s+l[ií]neas|4\s+l[ií]neas|four changing lines?/i.test(lower)) return 4;
  if (/cinco\s+l[ií]neas|5\s+l[ií]neas|five changing lines?/i.test(lower)) return 5;
  if (/seis\s+l[ií]neas|6\s+l[ií]neas|six changing lines?/i.test(lower)) return 6;
  return null;
}

function enforceIChingStructuralConsistency(text: string, cast: CastResult, language: string): string {
  const expected = cast.changingLines.length;
  const claimed = claimedChangingCount(text);
  if (claimed === null || claimed === expected) return text;
  const lineList = changingLinePositionsLabel(cast, language);
  const correction = ichingStructuralCorrectionAppendix(cast, language, expected, lineList);
  return `${text}\n\n${correction}`;
}

function castingMethodNote(method: CastingMethod | undefined): string {
  if (method === "yarrow-stalks") {
    return "DIVINATION METHOD: Yarrow Stalks (authentic Zhou distribution; old yang 3× more likely than old yin; the transformed hexagram carries additional interpretive weight when it appears)";
  }
  return "DIVINATION METHOD: Three Coins (symmetric probability; equal weight for both types of moving lines)";
}

function buildCurrentCastPrompt(
  cast: CastResult,
  _tier: string,
  language: string,
  hasContext: boolean,
  mode: ResponseMode,
  castingMethod?: CastingMethod,
): string {
  const { question, textsForClaude: t, primaryHexagram: p, transformedHexagram: tr, mutationRule } = cast;
  const targetWordCount = "700-900";
  const rawLineVector = [...cast.lines]
    .sort((a, b) => a.position - b.position)
    .map((line) => line.value)
    .join(",");
  const transformedLineVector = [...cast.lines]
    .sort((a, b) => a.position - b.position)
    .map((line) => (line.value === 6 ? 7 : line.value === 9 ? 8 : line.value))
    .join(",");

  const lineBlock =
    t.selectedLineTexts.length > 0
      ? `
LINE TEXTS:
${t.selectedLineTexts
  .map(
    (l) =>
      `  Line ${l.position} [${l.fromHexagram === "primary" ? "primary" : "transformed"}]: ${l.text}`,
  )
  .join("\n")}`
      : "";

  const looksFactual = /\b(cuant[oa]s?|n[uú]mero exacto|edad|fecha|donde vive|where|how many|exact number|biography|biographical)\b/i.test(
    question,
  );
  const scrollHeadingsEs = `Use these exact ## headings in Spanish (Chinese labels 卦辞 / 之卦 only as shown):
## Encuadre de la pregunta
## El juicio (卦辞)
## Líneas en movimiento
## El trazado hacia el 之卦
## Horizonte y síntesis`;

  const scrollHeadingsEn = `Use these exact ## headings in English (Chinese labels only as shown):
## Framing the question
## The judgment (卦辞)
## Lines in motion
## The turning pattern (之卦)
## Horizon and synthesis`;

  const headingsBlock =
    language === "es"
      ? scrollHeadingsEs
      : language === "en"
        ? scrollHeadingsEn
        : `Use the same section structure and roles as ${scrollHeadingsEn} but translate section titles fully into ${getLanguageName(language)} (keep 卦辞 之卦 next to the translated title).`;

  const modeInstruction =
    mode === "directo"
      ? `FORMAT MODE: DIRECT (Markdown)
- Exactly two ## sections in ${getLanguageName(language)}: (1) direct answer + limits of certainty + hexagram tie-in; (2) symbolic reading + one concrete step. Spanish example titles: ## Lectura directa / ## Lectura simbólica.
- If a transformed hexagram exists, weave it into section 2; do not add a third section.`
      : mode === "profundizar"
        ? `FORMAT MODE: DEEPEN (Markdown, follow-up cast in session)
- Exactly two ## sections only, titled in ${getLanguageName(language)}. Spanish: ## Continuidad del hilo / ## Apertura desde esta tirada. English: ## Thread continuity / ## Opening from this cast.
- Section 1: what is new vs the prior cast (no paste of prior interpretation).
- Section 2: one fresh angle from THIS cast's texts + one practical step.
- Do not use the five-part scroll headings.`
        : `FORMAT MODE: ORACLE SCROLL (Markdown, mandatory structure)
${headingsBlock}

Section roles (cognitive arc — dense paragraphs, 2–4 sentences each; avoid long abstract gaps):
- "Encuadre de la pregunta" / "Framing the question": name the emotional or practical stake in one tight opening, then the received figure (number, name, Chinese).
- "El juicio" / "The judgment": mandatory blockquote (>) of the classical judgment when provided; immediately after, one paragraph that names how that wording maps onto the user's situation (explicit bridge).
- "Líneas en movimiento" / "Lines in motion": changing lines only—numbered list with line text + one sentence of application each; if no changing lines, one crisp sentence stating stability.
- "El trazado hacia el 之卦" / "The turning pattern": ONLY if transformed hexagram exists—quote transformed judgment if supplied, then tension / opportunity vs primary.
- "Horizonte y síntesis" / "Horizon and synthesis": single closing paragraph—one concrete behavioral or attitudinal step, same language, no new quotes.
- ANTI-REPETITION across sections as in global rules.`;

  const isMasterCombined = Boolean(t.leggeJudgment && t.zhouyiJudgment);

  let textsBlock = "";
  if (isMasterCombined) {
    const leggeLines = t.leggeSelectedLineTexts?.map(l => `  Line ${l.position} [${l.fromHexagram === "primary" ? "primary" : "transformed"}]: ${l.text}`).join("\n") || "";
    const zhouyiLines = t.zhouyiSelectedLineTexts?.map(l => `  Line ${l.position} [${l.fromHexagram === "primary" ? "primary" : "transformed"}]: ${l.text}`).join("\n") || "";

    textsBlock = `
--- TRADITION: ZHOU YI (Original Classical Chinese) ---
JUDGMENT: ${t.zhouyiJudgment}
${t.zhouyiImage ? `THE IMAGE: ${t.zhouyiImage}` : ""}
${zhouyiLines ? `LINE TEXTS:\n${zhouyiLines}` : ""}

--- TRADITION: WILHELM / BAYNES ---
JUDGMENT: ${t.primaryJudgment}
${t.primaryImage ? `THE IMAGE: ${t.primaryImage}` : ""}
${lineBlock}

--- TRADITION: JAMES LEGGE ---
JUDGMENT: ${t.leggeJudgment}
${t.leggeImage ? `THE IMAGE: ${t.leggeImage}` : ""}
${leggeLines ? `LINE TEXTS:\n${leggeLines}` : ""}

${t.specialYaoText ? `SPECIAL TEXT: ${t.specialYaoText}` : ""}
${tr && t.transformedJudgment ? `
TRANSFORMED HEXAGRAM (Reference): #${tr.number} — ${tr.name}
JUDGMENT: ${t.transformedJudgment}` : ""}
`.trim();
  } else {
    textsBlock = `
JUDGMENT: ${t.primaryJudgment}
${t.primaryImage ? `THE IMAGE: ${t.primaryImage}` : ""}
${lineBlock}
${t.specialYaoText ? `SPECIAL TEXT: ${t.specialYaoText}` : ""}
${tr && t.transformedJudgment ? `
TRANSFORMED HEXAGRAM: #${tr.number} — ${tr.name} (${tr.chineseName})
JUDGMENT: ${t.transformedJudgment}` : ""}
`.trim();
  }

  return `
NEW CONSULTATION${hasContext ? " (continues thematic session)" : ""}:
"${question}"

═══════════════════════════════════
PRIMARY HEXAGRAM: #${p.number} — ${p.name} (${p.chineseName} · ${p.pinyin})
${p.upperTrigram} over ${p.lowerTrigram}

ACTIVE RULE: ${mutationRule}
${t.ruleExplanation}

STRUCTURAL FACTS (NON-NEGOTIABLE):
- RAW_LINES_BOTTOM_TO_TOP: [${rawLineVector}]
- TRANSFORMED_LINES_BOTTOM_TO_TOP: [${transformedLineVector}]
- CHANGING_LINES_POSITIONS: [${cast.changingLines.join(",")}]
- CHANGING_COUNT: ${cast.changingLines.length}
- PRIMARY_HEXAGRAM_NUMBER: ${p.number}
- TRANSFORMED_HEXAGRAM_NUMBER: ${tr?.number ?? "NONE"}

${textsBlock}


═══════════════════════════════════
INSTRUCTIONS:
- On the FIRST line write exactly: CATEGORY: [category]
  Categories: love_relationship, career_work, health_wellbeing,
  spiritual_inner, family_home, decision_path, conflict_challenge,
  travel_change, general
- Use family_home ONLY when the question clearly concerns household, parents, children, partner dynamics at home, or domestic life;
  for abstract or general life questions prefer general, spiritual_inner, decision_path, or career_work as appropriate.
- ${hasContext ? "Hay consultas previas en sesión: continuidad breve según bloque de contexto (no re-pegues interpretaciones largas)." : "Primera consulta de la sesión."}
- Interpret ONLY with the texts given. ${isMasterCombined ? "Actúa como un erudito maestro: sintetiza orgánicamente la esencia de las 3 traducciones provistas (Zhou Yi, Wilhelm, Legge). No cites extensamente los tres textos por separado; encuentra su hilo conductor común y responde de forma unificada en " + getLanguageName(language) + ". Toma en cuenta que el Zhou Yi está en chino clásico, úsalo como raíz de significado." : ""}
- In the first sentence, answer the user's question clearly and directly, but do not invent factual data.
- STRUCTURAL CONSISTENCY IS MANDATORY: any mention of "changing lines" count or positions MUST match CHANGING_COUNT and CHANGING_LINES_POSITIONS exactly.
- ${looksFactual ? "This question appears to request factual real-world data: explicitly state when that fact cannot be verified from the provided oracle texts." : "Do not claim certainty about external facts unless they are explicitly provided in the input."}
- If the question is about another person's private feelings or intentions, avoid certainty language. Use probability language (e.g., "podría", "parece", "sugiere"), never "es un hecho".
- ANTI-REPETITION: if you already stated an idea, do not restate it in other words in another section.
- ${mode === "ritual" ? "Follow the scroll structure; keep paragraphs visually compact (avoid stacking many one-line paragraphs)." : mode === "profundizar" ? "Max 2 sections as specified." : "Max 2 titled sections as specified."}
- ${modeInstruction}
- Length: ${targetWordCount} words
- If source excerpts arrive in a different language (often English), TRANSLATE them into the response language before quoting. Do not leave mixed-language fragments.
- TYPOGRAPHY ENFORCEMENT: Hexagram text quotes (Judgment, Image, line texts) must be *italic only* — never **bold**, never ***bold-italic***. Section headings are ## only. Interpretation prose uses **bold** for key terms. This rule is identical for three-coins and yarrow-stalks.
- CLOSURE: Finish every section and every sentence (including the closing synthesis). If length is tight, shorten middle sections—never stop mid-paragraph or mid-quote.
- ${castingMethodNote(castingMethod)}
- FORMAT INVARIANCE: The casting method note above affects only how moving-line probabilities are weighted in interpretation. Section count, heading names, response length, and paragraph structure are identical regardless of whether Three Coins or Yarrow Stalks was used — never add extra sections or commentary about the method itself.
- Respond in ${getLanguageName(language)}
`.trim();
}

export async function generateInterpretation(
  castResult: CastResult,
  tier: string,
  context: SessionContext | null,
  mode: ResponseMode = "ritual",
  env: NodeJS.ProcessEnv = process.env,
  displayName?: string,
  castingMethod?: CastingMethod,
): Promise<{ text: string; category: ConsultationCategory }> {
  const { ANTHROPIC_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY, GROQ_MODEL } = loadClaudeEnv(env);
  const language = castResult.language;
  const maxTokens = MAX_TOKENS;
  const model = getAnthropicModelId(env);

  const hasContext = Boolean(context && context.previousConsultations.length > 0);
  const resolvedCastingMethod = castingMethod ?? castResult.castingMethod;
  const userContent = hasContext && context
    ? `${buildContextBlock(context, language, mode)}\n\n${buildCurrentCastPrompt(castResult, tier, language, true, mode, resolvedCastingMethod)}`
    : buildCurrentCastPrompt(castResult, tier, language, false, mode, resolvedCastingMethod);

  const nameNote =
    displayName?.trim()
      ? `\n\nThe user's name is ${displayName.trim()}. Address them by name naturally and warmly, but don't overdo it — use their name occasionally, not in every message.`
      : "";
  const systemPrompt = `${SYSTEM_PROMPT}${nameNote}\n\nLANGUAGE: Respond only in ${getLanguageName(language)}.`;

  if (ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
        defaultHeaders: {
          "anthropic-beta": "prompt-caching-2024-07-31",
        },
      });
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
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userContent,
                cache_control: { type: "ephemeral" },
              },
            ],
          },
        ],
      });

      const fullText = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      if (response.stop_reason === "max_tokens") {
        console.warn("[generateInterpretation] hit max_tokens (output may be truncated)", {
          tier,
          maxTokens,
        });
      }
      const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
      const category = (catMatch?.[1] as ConsultationCategory) ?? "general";
      const cleanText = stripInterpretationFluff(
        fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim(),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateInterpretation] Anthropic returned likely wrong language; falling through", {
            language,
            primaryHexagram: castResult.primaryHexagram.number,
          });
        } else {
          const hardened = enforceIChingStructuralConsistency(cleanText, castResult, language);
          return { text: normalizeInterpretationPunctuation(hardened), category };
        }
      }
    } catch (err) {
      console.warn("[generateInterpretation] Anthropic failed, trying fallback chain", err);
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
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userContent,
                cache_control: { type: "ephemeral" },
              },
            ],
          },
        ],
      });
      const fullText = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      if (response.stop_reason === "max_tokens") {
        console.warn("[generateInterpretation] OpenRouter hit max_tokens", { tier, maxTokens });
      }
      const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
      const category = (catMatch?.[1] as ConsultationCategory) ?? "general";
      const cleanText = stripInterpretationFluff(
        fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim(),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateInterpretation] OpenRouter returned likely wrong language; falling through", { language });
        } else {
          const hardened = enforceIChingStructuralConsistency(cleanText, castResult, language);
          return { text: normalizeInterpretationPunctuation(hardened), category };
        }
      }
    } catch (err) {
      console.warn("[generateInterpretation] OpenRouter failed, trying Groq fallback", err);
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
        temperature: 0.5,
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
      const category = (catMatch?.[1] as ConsultationCategory) ?? "general";
      const cleanText = stripInterpretationFluff(fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim());
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn("[generateInterpretation] Groq returned likely wrong language; using fallback", {
            language,
            primaryHexagram: castResult.primaryHexagram.number,
          });
        } else {
          const hardened = enforceIChingStructuralConsistency(cleanText, castResult, language);
          return { text: normalizeInterpretationPunctuation(hardened), category };
        }
      }
    }

    const cat: ConsultationCategory = "general";
    const body = offlineFallbackText(castResult, language, "groq_error");
    const hardened = enforceIChingStructuralConsistency(body, castResult, language);
    return { text: normalizeInterpretationPunctuation(hardened), category: cat };
  }

  const cat: ConsultationCategory = "general";
  const body = offlineFallbackText(castResult, language, "no_model_api_key");
  const hardened = enforceIChingStructuralConsistency(body, castResult, language);
  return { text: normalizeInterpretationPunctuation(hardened), category: cat };
}
