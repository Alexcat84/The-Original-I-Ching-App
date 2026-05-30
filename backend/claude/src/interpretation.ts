import * as Sentry from "@sentry/node";
import Anthropic from "@anthropic-ai/sdk";
import { createAnthropicClient, callAnthropicWithRetry } from "./anthropic-client.js";
import type { SessionContext } from "@iching-oracle/context-engine";
import type { CastingMethod, CastResult } from "@iching-oracle/iching-engine";
import type { ConsultationCategory } from "@iching-oracle/image-engine";
import { getAnthropicModelId } from "./anthropic-model-id.js";
import { loadClaudeEnv } from "./env.js";
import {
  buildHistoricalContext,
  buildCurrentContext,
  type ResponseMode,
} from "./interpretation-context.js";
import {
  changingLinePositionsLabel,
  ichingStructuralCorrectionAppendix,
} from "./interpretation-structural-i18n.js";
import {
  normalizeInterpretationPunctuation,
  stripInterpretationFluff,
  stripSnapshotLeaks,
} from "./response-clean.js";

export type { ResponseMode } from "./interpretation-context.js";

const SYSTEM_PROMPT = `You are the Sage of the Oracle — an interpreter of the I Ching with deep knowledge of Wilhelm/Baynes, Zhu Xi, and the Confucian commentaries.

ABSOLUTE RULES:
1. Interpret ONLY with the classical texts provided.
2. If there are previous consultations in context, explicitly reference earlier hexagrams for continuity.
3. Never invent meanings — only connect texts with the question.
4. Poetic, profound language in the requested language.
5. TYPOGRAPHY — identical rules for all translators (Three Coins, Yarrow Stalks, all traditions):
   • ## for section headings only. Never add italic or bold to headings.
   • Plain text for all interpretive prose — NEVER use bold (**) or bold-italic (***).
   • CONTAINERS: every literal translator text — without exception — must appear as > *italic blockquote*:
     – Primary Judgment → > *judgment text*
     – Image text (象傳) → > *image text*
     – Each changing line oracle text → > *verbatim line text from the translator only*
     – Transformed hexagram Judgment (之卦) → > *judgment text*
   • CHANGING LINES — MANDATORY STRUCTURE for each item in the numbered list:
       1. **Line name** (mutante)
       > *verbatim library text — ONLY the classical quote in its original language, nothing else*

       Plain-text commentary connecting the line to the question. No bold. No italic. Entirely outside the blockquote.
     The blockquote CLOSES immediately after the last word of the classical quote. There must be a blank line after the blockquote before any prose. Never add your own words, translation, or commentary inside the blockquote — not even a single sentence.
     WRONG (translation or commentary inside blockquote):
       > *The second NINE shows good fortune. La alegría interior sincera disuelve el arrepentimiento...*
     CORRECT — Wilhelm (English original, Spanish response):
       > *The second NINE, undivided, shows the pleasure arising from inward sincerity. There will be good fortune. Occasion for repentance will disappear.*

       La alegría interior sincera disuelve el arrepentimiento...
     CORRECT — Zhou Yi (Classical Chinese original, Spanish response):
       > *眇能視，利幽人之貞。*

       Ver con un solo ojo sugiere visión parcial pero suficiente cuando se mantiene firmeza...
   • CLASSICAL FIDELITY: Blockquotes always contain the verbatim source text in its original library language — English for Wilhelm/Baynes and Legge, Classical Chinese 文言文 for Zhou Yi — never translated, never paraphrased inside the blockquote. All headings, labels, and interpretive prose are in the user's response language.
6. Never present unverified real-world facts (numbers, identities, private or biographical details) as certain truth.
7. If the user asks for factual external data that cannot be verified from the provided I Ching texts, explicitly say you cannot verify that fact and then continue with symbolic interpretation.
8. Never add generic legal or "simbólica vs predicción" disclaimer paragraphs (e.g. "Es importante tener en cuenta…"). Never end with an asterisk-wrapped footnote; compliance copy lives outside the reading in the app.
9. ANTI-REPETITION: Each concrete point (a line's counsel, a judgment phrase, a practical recommendation) appears at most once in the entire answer. Do not restate the same advice across sections with different wording.
10. GROUNDING: Every interpretive claim must tether to the supplied judgment, Image, or line text—paraphrase or quote in blockquote, then bridge to the question. Avoid vague uplift that could apply to any hexagram.
11. TYPOGRAPHY: enforce clean punctuation and spacing in the response language: one space after commas/semicolons/colons, no ",." or double punctuation, no glued tokens after punctuation, and no unintended uppercase after commas.
12. TEMPORAL RESTRAINT: Never use temporal expressions (days, weeks, months, years, "recently", "lately", "these past X", or any span of time) when referencing previous consultations, unless the user's current question explicitly contains those terms. Reference prior consultations only by number, sequence, or thematic content — never by how long ago they occurred.`;

/** Token output budget by tier. Master combined needs room for full dialectical essays. */
const MAX_TOKENS_DEFAULT = 4096;
const MAX_TOKENS_MASTER_WITH_CONTEXT = 7000;
const MAX_TOKENS_MASTER_NO_CONTEXT = 5000;
const LOG_CLAUDE_CACHE_METRICS =
  process.env.LOG_CLAUDE_CACHE_METRICS === "1" ||
  process.env.LOG_CLAUDE_CACHE_METRICS === "true" ||
  process.env.NODE_ENV === "development";

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

function toUsageRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function numberField(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function logCacheUsage(source: "anthropic" | "openrouter", usageRaw: unknown): void {
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
  console.log("[generateInterpretation][cache_usage]", {
    source,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheCreationTokens,
    cacheReadRatio,
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

function offlineFallbackText(
  castResult: CastResult,
  language: string,
  reason: "groq_error" | "no_model_api_key",
): string {
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
    /sin l[ií]neas?\s+(en\s+)?(movimiento|mutaci[oó]n|mutantes?)/i.test(
      lower,
    ) ||
    /no changing lines?/i.test(lower) ||
    /without changing lines?/i.test(lower)
  ) {
    return 0;
  }
  if (/l[ií]nea\s+[uú]nica|[uú]nica\s+l[ií]nea|one changing line/i.test(lower))
    return 1;
  if (/dos\s+l[ií]neas|2\s+l[ií]neas|two changing lines?/i.test(lower))
    return 2;
  if (/tres\s+l[ií]neas|3\s+l[ií]neas|three changing lines?/i.test(lower))
    return 3;
  if (/cuatro\s+l[ií]neas|4\s+l[ií]neas|four changing lines?/i.test(lower))
    return 4;
  if (/cinco\s+l[ií]neas|5\s+l[ií]neas|five changing lines?/i.test(lower))
    return 5;
  if (/seis\s+l[ií]neas|6\s+l[ií]neas|six changing lines?/i.test(lower))
    return 6;
  return null;
}

function enforceIChingStructuralConsistency(
  text: string,
  cast: CastResult,
  language: string,
): string {
  const expected = cast.changingLines.length;
  const claimed = claimedChangingCount(text);
  if (claimed === null || claimed === expected) return text;
  const lineList = changingLinePositionsLabel(cast, language);
  // Log for observability; never expose structural notes in the user-facing response.
  console.warn("[enforceIChingStructuralConsistency] count mismatch", {
    expected,
    claimed,
    lineList,
    correction: ichingStructuralCorrectionAppendix(cast, language, expected, lineList),
    hexagram: cast.primaryHexagram?.number,
    language,
  });
  return text;
}

function castingMethodNote(method: CastingMethod | undefined): string {
  if (method === "yarrow-stalks") {
    return "DIVINATION METHOD: Yarrow Stalks (authentic Zhou distribution; old yang 3× more likely than old yin; the transformed hexagram carries additional interpretive weight when it appears)";
  }
  return "DIVINATION METHOD: Three Coins (symmetric probability; equal weight for both types of moving lines)";
}

export interface PromptData {
  textsBlock: string;
  questionBlock: string;
  isMasterCombined: boolean;
  question: string;
}
function buildPromptData(
  cast: CastResult,
  _tier: string,
  language: string,
  hasContext: boolean,
  mode: ResponseMode,
  castingMethod?: CastingMethod,
): PromptData {
  const {
    question,
    textsForClaude: t,
    primaryHexagram: p,
    transformedHexagram: tr,
    mutationRule,
  } = cast;
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

  const looksFactual =
    /\b(cuant[oa]s?|n[uú]mero exacto|edad|fecha|donde vive|where|how many|exact number|biography|biographical)\b/i.test(
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

  const isMasterCombined =
    cast.interpretationMode === "master_combined" ||
    Boolean(t.leggeJudgment && t.zhouyiJudgment);
  const targetWordCount = isMasterCombined ? "1200-1600" : hasContext ? "800-1000" : "700-900";

  let textsBlock = "";
  if (isMasterCombined) {
    const leggeLines =
      t.leggeSelectedLineTexts
        ?.map(
          (l) =>
            `  Line ${l.position} [${l.fromHexagram === "primary" ? "primary" : "transformed"}]: ${l.text}`,
        )
        .join("\n") || "";
    const zhouyiLines =
      t.zhouyiSelectedLineTexts
        ?.map(
          (l) =>
            `  Line ${l.position} [${l.fromHexagram === "primary" ? "primary" : "transformed"}]: ${l.text}`,
        )
        .join("\n") || "";

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
${
  tr && t.transformedJudgment
    ? `
TRANSFORMED HEXAGRAM (Reference): #${tr.number} — ${tr.name} (${tr.chineseName} · ${tr.pinyin})
WILHELM JUDGMENT: ${t.transformedJudgment}
${t.transformedImage ? `WILHELM IMAGE: ${t.transformedImage}` : ""}
${t.leggeTransformedJudgment ? `LEGGE JUDGMENT: ${t.leggeTransformedJudgment}` : ""}
${t.leggeTransformedImage ? `LEGGE IMAGE: ${t.leggeTransformedImage}` : ""}
${t.zhouyiTransformedJudgment ? `ZHOU YI JUDGMENT: ${t.zhouyiTransformedJudgment}` : ""}
${t.zhouyiTransformedImage ? `ZHOU YI IMAGE: ${t.zhouyiTransformedImage}` : ""}`
    : ""
}
`.trim();
  } else {
    const zhouyiHeader = cast.interpretationMode === "zhouyi"
      ? "[FUENTE: ZHOU YI — CHINO CLÁSICO 文言文 — PRESERVAR VERBATIM EN BLOCKQUOTES, NO TRADUCIR]\n"
      : "";
    textsBlock = `
${zhouyiHeader}JUDGMENT: ${t.primaryJudgment}
${t.primaryImage ? `THE IMAGE: ${t.primaryImage}` : ""}
${lineBlock}
${t.specialYaoText ? `SPECIAL TEXT: ${t.specialYaoText}` : ""}
${
  tr && t.transformedJudgment
    ? `
TRANSFORMED HEXAGRAM: #${tr.number} — ${tr.name} (${tr.chineseName})
JUDGMENT: ${t.transformedJudgment}`
    : ""
}
`.trim();
  }

  const masterSynthesisInstruction = isMasterCombined
    ? `MASTER TRIANGULATION MODE (MANDATORY IN EVERY SECTION):
- Keep the exact same section structure and elegant tone as base oracle mode.
- For each section where classical text is used, triangulate explicitly with attributions:
  - Wilhelm says ... (psychological/archetypal lens)
  - Legge says ... (literal/structural-historical lens)
  - Zhou Yi says ... (root-classical lens)
- SOURCE QUOTATION REQUIREMENT (NON-NEGOTIABLE):
  - In "The judgment", "Lines in motion" (when there are changing lines), and "The turning pattern" (when transformed hexagram exists), include three labeled literal quote blocks in this exact order:
    1) Wilhelm (literal)
    2) Legge (literal)
    3) Zhou Yi (literal)
  - Quotes must be complete literal excerpts from the provided texts for that section (do NOT reduce to micro-quotes, fragments, or single clauses).
  - Each literal source quote MUST be rendered as Markdown blockquote lines (prefix every line with "> "), and the quote text itself must be italic inside that blockquote.
  - For "Lines in motion": for each changing line, show the full literal line text from each available source as a labeled Markdown blockquote in this exact format: a bold label line (e.g. **Wilhelm:**) immediately followed by a "> *italic blockquote*" block — in order Wilhelm → Legge → Zhou Yi — before the synthesis for that line. Never render source quotes as inline text or **bold** prose.
  - If any source text is unavailable for a specific subsection, state it explicitly and continue with the other two sources.
- In every section, bridge the three lenses into ONE integrated guidance for the querent.
- After literal source blocks, provide synthesis in your own words for that section.
- Address the user directly in second person in the response language. Do not narrate the user in third person.
- In "Horizon and synthesis", provide one concrete cross-source action that emerges from the triangulation.`
    : (() => {
        const translatorDisplayName =
          cast.interpretationMode === "legge"
            ? "James Legge"
            : cast.interpretationMode === "zhouyi"
              ? "Zhou Yi"
              : "Wilhelm/Baynes";
        const otherTranslators = ["Wilhelm/Baynes", "James Legge", "Zhou Yi"]
          .filter((n) => n !== translatorDisplayName)
          .join(" and ");
        return `SELECTED TRANSLATOR: ${translatorDisplayName}.

TRANSLATOR RULE — applies ONLY to the sections that interpret the CURRENT reading texts (El Juicio, La Imagen, Líneas en movimiento, El Trazado hacia el 之卦, and all interpretive prose for this hexagram):
- Use ONLY ${translatorDisplayName} as the authoritative source for the current reading.
- Never write "${otherTranslators.split(" and ")[0]} says", "como señala ${otherTranslators.split(" and ")[0]}", or any cross-translator attribution when interpreting the CURRENT hexagram texts.
- The texts provided in the BIBLIOTECA belong exclusively to ${translatorDisplayName} for this consultation.

HISTORICAL EXCEPTION (explicitly permitted):
- In «Encuadre de la pregunta» and in «Horizonte y Síntesis» / SNAPSHOT, you MAY name prior translators when tracing the arc of previous consultations already in the thread context (e.g., "the prior Wilhelm reading on #17 showed..."). Historical translator attribution is permitted ONLY when referencing consultations that already occurred in this session — never for the current reading texts.`;
      })();

  const selectedTranslatorLabel = isMasterCombined
    ? "Master Combined (Wilhelm/Baynes + James Legge + Zhou Yi — triangulate all three)"
    : cast.interpretationMode === "legge"
      ? "James Legge"
      : cast.interpretationMode === "zhouyi"
        ? "Zhou Yi (Original Classical Chinese)"
        : "Wilhelm/Baynes";

  const questionBlock = `
NEW CONSULTATION${hasContext ? " (continues thematic session)" : ""}:
"${question}"

SELECTED_TRANSLATOR: ${selectedTranslatorLabel}

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
- ${hasContext
    ? "OBLIGATORIO — En el «Encuadre de la pregunta», el PRIMER PÁRRAFO debe abrir con una referencia natural al arco COMPLETO de la sesión: nombra TODOS los hexagramas que aparecieron desde el inicio (en orden cronológico), qué dirección trazaron juntos y cómo enlaza esta nueva tirada con ese recorrido. No te limites a la consulta inmediatamente anterior; teje el hilo desde la primera pregunta. Sin encabezado separado; fluye en la prosa. 2–3 oraciones máximo."
    : "Primera consulta de la sesión: no inventes continuidad."
  }
- Interpret ONLY with the texts given.
- ${masterSynthesisInstruction}
- In the first sentence, answer the user's question clearly and directly, but do not invent factual data.
- STRUCTURAL CONSISTENCY IS MANDATORY: any mention of "changing lines" count or positions MUST match CHANGING_COUNT and CHANGING_LINES_POSITIONS exactly.
- ${looksFactual ? "This question appears to request factual real-world data: explicitly state when that fact cannot be verified from the provided oracle texts." : "Do not claim certainty about external facts unless they are explicitly provided in the input."}
- If the question is about another person's private feelings or intentions, avoid certainty language. Use probability language (e.g., "podría", "parece", "sugiere"), never "es un hecho".
- Never invent or infer elapsed time markers (days, weeks, months, "after X days", "for months", etc.) unless the user explicitly stated that time span in the current consultation.
- SECOND PERSON (NON-NEGOTIABLE): Always address the user directly. Never narrate them in third person, even when their name is known. Write "podrías" / "you could" / "tu pourrais" — never "[Name] podría" / "[Name] could" / "[Name] pourrait".
- ANTI-REPETITION: if you already stated an idea, do not restate it in other words in another section.
- ${mode === "ritual" ? "Follow the scroll structure; keep paragraphs visually compact (avoid stacking many one-line paragraphs)." : mode === "profundizar" ? "Max 2 sections as specified." : "Max 2 titled sections as specified."}
- ${modeInstruction}
- Length: ${targetWordCount} words
- SOURCE FIDELITY (ALL TRANSLATORS, NON-NEGOTIABLE): Every text from the BIBLIOTECA must appear VERBATIM in its original library language inside the blockquote — Wilhelm/Baynes and Legge texts in English, Zhou Yi texts in Classical Chinese 文言文. Never translate, paraphrase, or alter the source text inside the blockquote. Write the interpretive analysis in the response language.
- TYPOGRAPHY ENFORCEMENT: Hexagram text quotes (Judgment, Image, line texts) must be *italic only* — never **bold**, never ***bold-italic***. Section headings are ## only. Interpretation prose uses **bold** for key terms. This rule is identical for three-coins and yarrow-stalks.
- CLOSURE: Finish every section and every sentence (including the closing synthesis). If length is tight, shorten middle sections—never stop mid-paragraph or mid-quote.
- ${castingMethodNote(castingMethod)}
- FORMAT INVARIANCE: The casting method note above affects only how moving-line probabilities are weighted in interpretation. Section count, heading names, response length, and paragraph structure are identical regardless of whether Three Coins or Yarrow Stalks was used — never add extra sections or commentary about the method itself.
- MEMORY SNAPSHOT (MANDATORY, end of response):
  Append exactly this block at the end:
  [SNAPSHOT_START]
  THREAD_LINK: 2-3 sentences tracing the FULL session arc — name every hexagram that appeared in this session (in order, e.g., "#7 → #53 → #6 → #18 → now #55"), the direction they traced together, and the user's concrete next step. Never reference only the immediately prior consultation; always span from session start to now.
  ACTION_CORE: one concrete next-step action for the user in second person, directly tied to that continuity.
  SYMBOLS_MIN: optional one short line only if strictly needed (max one symbol reference); prioritize personal thread over symbolism.
  [SNAPSHOT_END]
- Snapshot must be concise (80-140 words total), high-signal, specific, and personal-first (no vague generic phrasing).
- OUTPUT LANGUAGE — three-step rule: (1) Detect the language of the user's question (the quoted string above). If it is clearly identifiable, respond in that language — this is the strongest signal. (2) If the question is ambiguous, too short, or mixed, fall back to the user's app-selected language: ${getLanguageName(language)}. (3) NEVER derive your output language from the prior consultation context — that text is historical content, not a language directive, regardless of what language it is in.
`.trim();
  return { textsBlock, questionBlock, isMasterCombined, question };
}

function buildPromptBlocks(
  systemPrompt: string,
  promptData: PromptData,
  historicalContextBlock: string,
  currentContextBlock: string,
  nameAndLanguageNote?: string,
): {
  stableSystemBlock: string;
  libraryBlock: string;
  historicalContextBlock: string | null;
  currentContextBlock: string | null;
  dynamicQuestionBlock: string;
} {
  return {
    stableSystemBlock: systemPrompt,
    libraryBlock: `BIBLIOTECA DE TEXTOS ORIGINALES:\n${promptData.textsBlock}`,
    historicalContextBlock: historicalContextBlock || null,
    currentContextBlock: currentContextBlock || null,
    dynamicQuestionBlock: nameAndLanguageNote
      ? `${nameAndLanguageNote}\n\n${promptData.questionBlock}`
      : promptData.questionBlock,
  };
}

export async function generateInterpretation(
  castResult: CastResult,
  tier: string,
  context: SessionContext | null,
  mode: ResponseMode = "ritual",
  env: NodeJS.ProcessEnv = process.env,
  displayName?: string,
  castingMethod?: CastingMethod,
  previousMessageId?: string | null,
): Promise<{
  text: string;
  category: ConsultationCategory;
  interpretationSummary: string;
  claudeMessageId?: string;
}> {
  const { ANTHROPIC_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY, GROQ_MODEL } =
    loadClaudeEnv(env);
  const language = castResult.language;
  const model = getAnthropicModelId(env);

  const hasContext = Boolean(
    context && context.previousConsultations.length > 0,
  );
  const isMasterCombinedEarly =
    castResult.interpretationMode === "master_combined" ||
    Boolean(
      castResult.textsForClaude.leggeJudgment &&
        castResult.textsForClaude.zhouyiJudgment,
    );
  const maxTokens = isMasterCombinedEarly
    ? hasContext
      ? MAX_TOKENS_MASTER_WITH_CONTEXT
      : MAX_TOKENS_MASTER_NO_CONTEXT
    : MAX_TOKENS_DEFAULT;
  const resolvedCastingMethod = castingMethod ?? castResult.castingMethod;

  const promptData = buildPromptData(
    castResult,
    tier,
    language,
    hasContext,
    mode,
    resolvedCastingMethod,
  );
  const historicalContextBlock =
    hasContext && context ? buildHistoricalContext(context.previousConsultations.slice(0, -1), language, mode) : "";
  const currentContextBlock =
    hasContext && context ? buildCurrentContext(context, context.previousConsultations.at(-1), language, mode) : "";

  const nameAndLanguageNote = [
    displayName?.trim()
      ? `The user's name is ${displayName.trim()}. Always address them DIRECTLY in second person ("you" / "tú" / "vous" etc.). You may use their name warmly when it fits naturally (e.g., "Ronald, esto sugiere..." or "podrías, Ronald,...") but NEVER narrate them in third person (e.g., "Ronald podría..." or "Ronald debería..." are WRONG — always write "podrías..." or "Ronald, podrías..." instead).`
      : "",
    `LANGUAGE: Respond only in ${getLanguageName(language)}.`,
  ].filter(Boolean).join("\n\n");
  const promptBlocks = buildPromptBlocks(
    SYSTEM_PROMPT,
    promptData,
    historicalContextBlock,
    currentContextBlock,
    nameAndLanguageNote,
  );

  const fallbackUserContent = `${promptBlocks.libraryBlock}\n\n${
    promptBlocks.historicalContextBlock
      ? `${promptBlocks.historicalContextBlock}\n\n`
      : ""
  }${
    promptBlocks.currentContextBlock
      ? `${promptBlocks.currentContextBlock}\n\n`
      : ""
  }${promptBlocks.dynamicQuestionBlock}`;

  if (ANTHROPIC_API_KEY) {
    try {
      const client = createAnthropicClient(ANTHROPIC_API_KEY);

      const response = await callAnthropicWithRetry(
        client,
        {
          model,
          max_tokens: maxTokens,
          system: [
            {
              type: "text",
              text: promptBlocks.stableSystemBlock,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: promptBlocks.libraryBlock,
                },
                ...(promptBlocks.historicalContextBlock
                  ? [
                      {
                        type: "text" as const,
                        text: promptBlocks.historicalContextBlock,
                        cache_control: { type: "ephemeral" as const },
                      },
                    ]
                  : []),
                ...(promptBlocks.currentContextBlock
                  ? [
                      {
                        type: "text" as const,
                        text: promptBlocks.currentContextBlock,
                      },
                    ]
                  : []),
                {
                  type: "text" as const,
                  text: promptBlocks.dynamicQuestionBlock,
                },
              ],
            },
          ],
        },
        { tier, language, method: resolvedCastingMethod ?? "iching" },
        previousMessageId ?? null,
      );

      const fullText = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      logCacheUsage("anthropic", response.usage);
      if (response.stop_reason === "max_tokens") {
        console.warn(
          "[generateInterpretation] hit max_tokens (output may be truncated)",
          {
            tier,
            maxTokens,
          },
        );
      }
      const catMatch = fullText.match(
        /^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im,
      );
      const category = (catMatch?.[1] as ConsultationCategory) ?? "general";
      const snapshotMatch = fullText.match(
        /\[SNAPSHOT_START\]([\s\S]*?)\[SNAPSHOT_END\]/,
      );
      const interpretationSummary = snapshotMatch
        ? snapshotMatch[1].trim()
        : fallbackInterpretationSummary(fullText);
      const rawInterpretation = stripSnapshotLeaks(
        fullText
          .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
          .trim(),
      );

      const cleanText = stripInterpretationFluff(
        rawInterpretation
          .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
          .trim(),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn(
            "[generateInterpretation] Anthropic returned likely wrong language; falling through",
            {
              language,
              primaryHexagram: castResult.primaryHexagram.number,
            },
          );
        } else {
          const hardened = enforceIChingStructuralConsistency(
            cleanText,
            castResult,
            language,
          );
          return {
            text: normalizeInterpretationPunctuation(hardened),
            category,
            interpretationSummary,
            claudeMessageId: response.claudeMessageId,
          };
        }
      }
    } catch (err) {
      console.warn(
        "[generateInterpretation] Anthropic failed, trying fallback chain",
        err,
      );
      Sentry.captureException(err, {
        tags: { 
          provider: "anthropic", 
          tier, 
          language,
          model
        },
        extra: { hexagramNumber: castResult.primaryHexagram.number, method: resolvedCastingMethod }
      });
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
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: fallbackUserContent,
              },
            ],
          },
        ],
      });
      const fullText = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      logCacheUsage("openrouter", response.usage);
      if (response.stop_reason === "max_tokens") {
        console.warn("[generateInterpretation] OpenRouter hit max_tokens", {
          tier,
          maxTokens,
        });
      }
      const catMatch = fullText.match(
        /^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im,
      );
      const category = (catMatch?.[1] as ConsultationCategory) ?? "general";
      const snapshotMatch = fullText.match(
        /\[SNAPSHOT_START\]([\s\S]*?)\[SNAPSHOT_END\]/,
      );
      const interpretationSummary = snapshotMatch
        ? snapshotMatch[1].trim()
        : fallbackInterpretationSummary(fullText);
      const rawInterpretation = stripSnapshotLeaks(
        fullText
          .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
          .trim(),
      );

      const cleanText = stripInterpretationFluff(
        rawInterpretation
          .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
          .trim(),
      );
      if (cleanText.trim().length > 0) {
        if (isLikelyWrongLanguage(cleanText, language)) {
          console.warn(
            "[generateInterpretation] OpenRouter returned likely wrong language; falling through",
            { language },
          );
        } else {
          const hardened = enforceIChingStructuralConsistency(
            cleanText,
            castResult,
            language,
          );
          return {
            text: normalizeInterpretationPunctuation(hardened),
            category,
            interpretationSummary,
          };
        }
      }
    } catch (err) {
      console.warn(
        "[generateInterpretation] OpenRouter failed, trying Groq fallback",
        err,
      );
      Sentry.captureException(err, {
        tags: { 
          provider: "openrouter", 
          tier, 
          language,
          model
        },
        extra: { hexagramNumber: castResult.primaryHexagram.number, method: resolvedCastingMethod }
      });
    }
  }

  if (GROQ_API_KEY) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
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
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: fallbackUserContent },
            ],
          }),
        },
      );

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const fullText = data.choices?.[0]?.message?.content ?? "";
        const catMatch = fullText.match(
          /^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im,
        );
        const category = (catMatch?.[1] as ConsultationCategory) ?? "general";
        const snapshotMatch = fullText.match(
          /\[SNAPSHOT_START\]([\s\S]*?)\[SNAPSHOT_END\]/,
        );
        const interpretationSummary = snapshotMatch
          ? snapshotMatch[1].trim()
          : fallbackInterpretationSummary(fullText);
        const rawInterpretation = stripSnapshotLeaks(
          fullText
            .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
            .trim(),
        );

        const cleanText = stripInterpretationFluff(
          rawInterpretation
            .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
            .trim(),
        );
        if (cleanText.trim().length > 0) {
          if (isLikelyWrongLanguage(cleanText, language)) {
            console.warn(
              "[generateInterpretation] Groq returned likely wrong language; using fallback",
              {
                language,
                primaryHexagram: castResult.primaryHexagram.number,
              },
            );
          } else {
            const hardened = enforceIChingStructuralConsistency(
              cleanText,
              castResult,
              language,
            );
            return {
              text: normalizeInterpretationPunctuation(hardened),
              category,
              interpretationSummary,
            };
          }
        }
      }
    } catch (err) {
      console.warn("[generateInterpretation] Groq fallback failed", err);
      Sentry.captureException(err, {
        tags: { 
          provider: "groq", 
          tier, 
          language,
          model: GROQ_MODEL || "llama-3.3-70b-versatile"
        },
        extra: { hexagramNumber: castResult.primaryHexagram.number, method: resolvedCastingMethod }
      });
    }

    const cat: ConsultationCategory = "general";
    const body = offlineFallbackText(castResult, language, "groq_error");
    const hardened = enforceIChingStructuralConsistency(
      body,
      castResult,
      language,
    );
    return {
      text: normalizeInterpretationPunctuation(hardened),
      category: cat,
      interpretationSummary: fallbackInterpretationSummary(body),
    };
  }

  const cat: ConsultationCategory = "general";
  const body = offlineFallbackText(castResult, language, "no_model_api_key");
  const hardened = enforceIChingStructuralConsistency(
    body,
    castResult,
    language,
  );
  return {
    text: normalizeInterpretationPunctuation(hardened),
    category: cat,
    interpretationSummary: fallbackInterpretationSummary(body),
  };
}
