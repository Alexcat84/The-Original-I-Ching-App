import {
  generateInterpretation,
  generateOracleBonesInterpretation,
} from "@iching-oracle/claude";
import {
  CONTEXT_LIMITS,
  resolveSessionContext,
  type OracleBonesHistorySnapshot,
  type OracleType,
  type PreviousConsultationRow,
} from "@iching-oracle/context-engine";
import {
  performCast,
  performCastFromLineValues,
  performYarrowCast,
} from "@iching-oracle/iching-engine";
import { SUPPORTED_LOCALES, getConsultApiUiMessages, parseAppLocale, type AppLocale } from "@iching-oracle/i18n";
import {
  buildImagePrompt,
  buildOracleBonesImagePrompt,
} from "@iching-oracle/image-engine";
import {
  defaultNegativeCharge,
  performOracleBonesCast,
} from "@iching-oracle/oracle-bones-engine";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Logger } from "next-axiom";
import {
  buildImageAsset,
  buildOracleBonesImageAsset,
  type ImageProvider,
} from "@/lib/image-provider";
import { getAdminConfig } from "@/lib/admin-config";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";
import {
  consumeToken,
  getSessionLimit,
  getUserBillingTier,
} from "@/lib/credits";
import { finalizeReadingImages } from "@/lib/finalize-reading-images";
import { resolveConsultPolicy } from "@/lib/policy-engine";
import { rateLimitByKey, getUpstashRedis } from "@/lib/rate-limit";
import { verifyIntegrityToken } from "@/lib/play-integrity";
import { assertCriticalConfig } from "@/lib/startup-checks";
import { isPersistableUuid } from "@/lib/session-ids";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  getUserSessionWithConsultations,
  isSharingPersistenceAvailable,
  type StoredConsultation,
  upsertSessionAndConsultation,
} from "@/lib/session-store";
import { parseIchingManualPayload } from "@/lib/manual-iching-consult";
import {
  canDeepenAfterNextConsult,
  normalizeSessionDepthLimit,
  shouldBlockDeepening,
} from "@/lib/thread-depth-policy";

export const runtime = "nodejs";
export const maxDuration = 300;
const MAX_CONSULT_QUESTION_CHARS = 4000;
const LOG_RITUAL_STREAM_DEBUG =
  process.env.LOG_RITUAL_STREAM_DEBUG === "1" ||
  process.env.LOG_RITUAL_STREAM_DEBUG === "true" ||
  process.env.NODE_ENV === "development";

function shortUserId(userId: string): string {
  return userId.slice(0, 8);
}

const CLAUDE_PREV_MSG_TTL = 600; // 10 min — within the 5-min cache TTL with margin

async function getPrevClaudeMessageId(userId: string, sessionId: string): Promise<string | null> {
  try {
    const r = getUpstashRedis();
    if (!r) return null;
    const val = await r.get<string>(`claude:prev_msg:${userId}:${sessionId}`);
    return val ?? null;
  } catch {
    return null;
  }
}

async function setPrevClaudeMessageId(userId: string, sessionId: string, messageId: string): Promise<void> {
  try {
    const r = getUpstashRedis();
    if (!r) return;
    await r.set(`claude:prev_msg:${userId}:${sessionId}`, messageId, { ex: CLAUDE_PREV_MSG_TTL });
  } catch {
    // non-fatal — diagnostics are best-effort
  }
}

type HistoryEntry = {
  oracleType?: OracleType;
  question: string;
  primaryHexagram: number;
  primaryHexagramName: string;
  primaryHexagramChinese: string;
  transformedHexagramName: string | null;
  changingLines: number[];
  mutationRule: string;
  interpretation: string;
  oracleBones?: {
    patternId: number;
    verdict: OracleBonesHistorySnapshot["verdict"];
    positiveCharge: string;
    negativeCharge: string;
    medium: OracleBonesHistorySnapshot["medium"];
  };
};

function mapHistoryToRows(
  history: HistoryEntry[] | undefined,
): PreviousConsultationRow[] {
  return (history ?? []).map((h, idx) => {
    const oracleType: OracleType = h.oracleType ?? "iching";
    const oracle_bones: OracleBonesHistorySnapshot | undefined =
      h.oracleBones && oracleType === "oracle_bones"
        ? {
            pattern_id: h.oracleBones.patternId,
            verdict: h.oracleBones.verdict,
            positive_charge: h.oracleBones.positiveCharge,
            negative_charge: h.oracleBones.negativeCharge,
            medium: h.oracleBones.medium,
          }
        : undefined;
    return {
      session_position: idx + 1,
      question: h.question,
      primary_hexagram_number: h.primaryHexagram,
      primary_hexagram_name: h.primaryHexagramName,
      primary_hexagram_chinese: h.primaryHexagramChinese,
      transformed_hexagram_name: h.transformedHexagramName,
      changing_lines: h.changingLines,
      mutation_rule: h.mutationRule,
      interpretation: h.interpretation,
      oracle_type: oracleType,
      oracle_bones: oracle_bones,
    };
  });
}

function mapStoredConsultationsToRows(
  consultations: StoredConsultation[],
): PreviousConsultationRow[] {
  return (consultations ?? []).map((entry) => ({
    session_position: entry.sessionPosition,
    question: entry.question,
    primary_hexagram_number: entry.primaryHexagram,
    primary_hexagram_name: entry.primaryHexagramName,
    primary_hexagram_chinese: entry.primaryHexagramChinese,
    transformed_hexagram_name: entry.transformedHexagramName,
    changing_lines: entry.changingLines,
    mutation_rule: entry.mutationRule,
    interpretation: entry.interpretation,
    oracle_type: entry.oracleType ?? "iching",
    oracle_bones:
      entry.oracleType === "oracle_bones" ? (entry.oracleBones ?? undefined) : undefined,
  }));
}

function summarizeInterpretationForContext(raw: string): string {
  const clean = raw
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^\s*(?:##\s*)?/u, "")
    .trim();
  if (!clean) return "";
  if (clean.length <= 420) return clean;
  const clipped = clean.slice(0, 420);
  const lastPunctuation = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("? "),
  );
  return (lastPunctuation > 180 ? clipped.slice(0, lastPunctuation + 1) : clipped).trim();
}


function verdictLabelForPrompt(
  verdict: OracleBonesHistorySnapshot["verdict"],
): string {
  const labels: Record<OracleBonesHistorySnapshot["verdict"], string> = {
    auspicious_clear: "clearly auspicious ji 吉",
    auspicious_moderate: "moderately auspicious ji 吉",
    inauspicious_moderate: "moderately inauspicious xiong 凶",
    inauspicious_clear: "clearly inauspicious xiong 凶",
  };
  return labels[verdict];
}

function countWordHits(text: string, words: readonly string[]): number {
  let score = 0;
  for (const word of words) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    const matches = text.match(re);
    if (matches) score += matches.length;
  }
  return score;
}

function detectLanguageFromUserText(text: string): AppLocale | null {
  const sample = text.trim();
  if (!sample) return null;

  if (/[\uac00-\ud7af]/.test(sample)) return "ko";
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(sample)) return "ja";
  if (/[\u4e00-\u9fff]/.test(sample)) return "zh";

  const lower = sample.toLowerCase();
  const langWords: Array<{ lang: AppLocale; words: readonly string[] }> = [
    {
      lang: "es",
      words: [
        "el",
        "la",
        "los",
        "las",
        "que",
        "por",
        "para",
        "con",
        "fue",
        "entonces",
        "porque",
        "hija",
      ],
    },
    {
      lang: "en",
      words: [
        "the",
        "and",
        "with",
        "was",
        "were",
        "is",
        "are",
        "why",
        "what",
        "then",
        "because",
      ],
    },
    {
      lang: "pt",
      words: [
        "que",
        "com",
        "para",
        "não",
        "foi",
        "então",
        "porque",
        "uma",
        "você",
      ],
    },
    {
      lang: "fr",
      words: [
        "le",
        "la",
        "les",
        "avec",
        "pour",
        "pas",
        "est",
        "sont",
        "pourquoi",
        "alors",
      ],
    },
    {
      lang: "de",
      words: [
        "der",
        "die",
        "das",
        "und",
        "mit",
        "nicht",
        "ist",
        "sind",
        "warum",
        "dann",
      ],
    },
    {
      lang: "it",
      words: [
        "il",
        "lo",
        "la",
        "gli",
        "con",
        "per",
        "non",
        "che",
        "perché",
        "allora",
      ],
    },
  ];

  const scores = langWords
    .map(({ lang, words }) => ({ lang, score: countWordHits(lower, words) }))
    .sort((a, b) => b.score - a.score);

  const best = scores[0];
  const second = scores[1];
  if (!best || best.score < 2) return null;
  if (second && best.score - second.score < 1) return null;
  return best.lang;
}

export async function POST(req: Request) {
  assertCriticalConfig();
  const log = new Logger({ source: "api/consult" });

  // Health check de Upstash — rechazar si no está operativo
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('[CRITICAL] Upstash not configured — rate limiting disabled');
    // En producción: retornar 503 para forzar detección inmediata
    if (process.env.VERCEL_ENV === 'production') {
      return new Response('Service configuration error', { status: 503 });
    }
  }

  let body: {
    question?: string;
    language?: string;
    tier?: string;
    sessionId?: string | null;
    isDeepening?: boolean;
    responseMode?: "ritual" | "stream_ritual";
    adminKey?: string;
    imageProviderOverride?: ImageProvider;
    sessionTitle?: string | null;
    oracleMode?: OracleType;
    oracleBones?: {
      positiveCharge?: string;
      negativeCharge?: string;
      medium?: "turtle" | "ox";
    };
    history?: HistoryEntry[];
    displayName?: string;
    ichingCastMode?: "auto" | "manual";
    ichingCastingMethod?: "three-coins" | "yarrow-stalks";
    ichingManualLineValues?: unknown;
    translatorId?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "retry" },
      { status: 400 },
    );
  }

  try {
    const question = typeof body.question === "string" ? body.question : "";
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length > MAX_CONSULT_QUESTION_CHARS) {
      return NextResponse.json(
        {
          error: "question_too_long",
          code: "CONSULT_QUESTION_TOO_LONG",
          action: "fix_input",
          max_chars: MAX_CONSULT_QUESTION_CHARS,
        },
        { status: 400 },
      );
    }
    const displayName =
      typeof body.displayName === "string" && body.displayName.trim()
        ? body.displayName.trim()
        : undefined;
    const rawLanguage =
      typeof body.language === "string" ? body.language : "es";
    const selectedLanguage: AppLocale = (
      SUPPORTED_LOCALES as readonly string[]
    ).includes(rawLanguage)
      ? (rawLanguage as AppLocale)
      : "es";
    const cookieStore = await cookies();
    const uiLocale = parseAppLocale(
      typeof body.language === "string"
        ? body.language
        : cookieStore.get(UI_LOCALE_COOKIE)?.value,
    );
    const consultApiUi = getConsultApiUiMessages(uiLocale);
    const oracleMode: OracleType =
      body.oracleMode === "oracle_bones" ? "oracle_bones" : "iching";
    const languageHint = detectLanguageFromUserText(trimmedQuestion);
    const language: AppLocale = languageHint ?? selectedLanguage;

    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        {
          error: "auth_required",
          code: "AUTH_REQUIRED",
          action: "login",
          message: consultApiUi.authRequired,
        },
        { status: 401 },
      );
    }
    const authedUserId = authUser.userId;

    // Play Integrity check — for Android app requests only (header injected by native shell).
    // Web browser requests don't carry this header and are protected by Turnstile at registration.
    // Verification runs BEFORE token consumption so a failed verdict costs the user nothing.
    //
    // Known limitation (security review finding #4): this is opt-in — a modified APK could
    // strip the header and the check would be skipped. The complete fix requires binding the
    // device class to the Supabase session at login (HMAC claim in user_metadata) so the backend
    // can demand the token unconditionally for any session flagged as Android. Tracked as
    // technical debt; current implementation prevents passive scraping and unmodified emulators.
    const integrityToken = req.headers.get("x-integrity-token");
    if (integrityToken) {
      const verdict = await verifyIntegrityToken(integrityToken, authedUserId);
      if (!verdict.passed) {
        log.warn("integrity_check_failed", {
          reason: verdict.reason,
          userId: authedUserId.slice(0, 8),
          playProtect: verdict.environment?.playProtect ?? null,
          appsDetected: verdict.environment?.appsDetected ?? [],
        });
        await log.flush();
        return NextResponse.json(
          { error: "integrity_check_failed", code: "INTEGRITY_FAILED", action: "none" },
          { status: 403 },
        );
      }
      // Log environment data on every passing request for monitoring/analytics.
      // Allows detecting patterns (e.g. rising app_access_risk installs) before
      // deciding to tighten blocking thresholds.
      if (verdict.environment) {
        log.info("integrity_check_passed", {
          userId: authedUserId.slice(0, 8),
          playProtect: verdict.environment.playProtect,
          appsDetected: verdict.environment.appsDetected,
        });
      }
    }

    const lastPack = await getUserBillingTier(authedUserId);
    const policy = await resolveConsultPolicy({
      authUser,
      tierResolved: lastPack,
    });
    const {
      adminBypassAllowed,
      adminUnlimitedCredits,
      tierEffective,
      tierKey,
    } = policy;

    let resolvedTranslator: "wilhelm" | "legge" | "zhouyi" | "master_combined" =
      "wilhelm";
    if (body.translatorId === "legge") {
      if (
        tierKey === "seeker" ||
        tierKey === "practitioner" ||
        tierKey === "master" ||
        tierKey === "oracle" ||
        adminBypassAllowed
      ) {
        resolvedTranslator = "legge";
      } else {
        resolvedTranslator = "wilhelm";
      }
    }
    if (body.translatorId === "zhouyi") {
      if (
        tierKey === "practitioner" ||
        tierKey === "master" ||
        tierKey === "oracle" ||
        adminBypassAllowed
      ) {
        resolvedTranslator = "zhouyi";
      } else {
        resolvedTranslator = "wilhelm";
      }
    }
    if (body.translatorId === "master_combined") {
      if (tierKey === "master" || tierKey === "oracle" || adminBypassAllowed) {
        resolvedTranslator = "master_combined";
      } else {
        resolvedTranslator = "wilhelm"; // fallback si no tiene permiso
      }
    }

    const packSessionLimit = await getSessionLimit(authedUserId);
    const maxDepth = adminBypassAllowed
      ? 999_999
      : normalizeSessionDepthLimit(
          packSessionLimit || CONTEXT_LIMITS[tierKey].sessionDepth,
        );

    const forwardedFor = req.headers.get("x-forwarded-for") ?? "unknown-ip";
    const ip = forwardedFor.split(",")[0]?.trim() ?? "unknown-ip";
    const rl = await rateLimitByKey({
      key: `consult:${ip}`,
      limit: 30,
      windowSeconds: 60,
    });
    if (!rl.ok) {
      log.warn("rate_limited", { source: "ip", userId: shortUserId(authedUserId) });
      await log.flush();
      return NextResponse.json(
        {
          error: "rate_limited",
          code: "RATE_LIMITED",
          action: "wait_and_retry",
        },
        { status: 429 },
      );
    }
    const rlUser = await rateLimitByKey({
      key: `consult:user:${authedUserId}`,
      limit: 15,
      windowSeconds: 60,
    });
    if (!rlUser.ok) {
      log.warn("rate_limited", { source: "user", userId: shortUserId(authedUserId) });
      await log.flush();
      return NextResponse.json(
        {
          error: "rate_limited",
          code: "RATE_LIMITED",
          action: "wait_and_retry",
        },
        { status: 429 },
      );
    }
    if (policy.twoFactorRequired) {
      return NextResponse.json(
        {
          error: "two_factor_required",
          code: "TWO_FACTOR_REQUIRED",
          action: "setup_2fa",
        },
        { status: 403 },
      );
    }
    if (oracleMode === "iching" && !trimmedQuestion) {
      return NextResponse.json(
        {
          error: "question_required",
          code: "CONSULT_QUESTION_REQUIRED",
          action: "fix_input",
        },
        { status: 400 },
      );
    }

    const ichingManualPayload = parseIchingManualPayload(
      {
        ichingCastMode: body.ichingCastMode,
        ichingCastingMethod: body.ichingCastingMethod,
        ichingManualLineValues: body.ichingManualLineValues,
      },
      oracleMode,
    );
    if (!ichingManualPayload.ok) {
      return NextResponse.json(ichingManualPayload.body, {
        status: ichingManualPayload.status,
      });
    }

    const sessionId =
      typeof body.sessionId === "string" && isPersistableUuid(body.sessionId)
        ? body.sessionId
        : randomUUID();

    const isDeepening = Boolean(body.isDeepening);
    let previousRows = mapHistoryToRows(body.history);

    // Always look up the session in DB when a valid UUID is present — never
    // trust the client's isDeepening flag alone. A stale or recycled sessionId
    // sent with isDeepening=false would otherwise bypass all depth checks and
    // let a new consultation slip into an already-full session (silent overflow).
    let authorizedDepth = previousRows.length;
    if (isPersistableUuid(sessionId) && getSupabaseAdmin()) {
      const sessionWithConsultations = await getUserSessionWithConsultations(
        authedUserId,
        sessionId,
      );
      if (sessionWithConsultations) {
        previousRows = mapStoredConsultationsToRows(
          sessionWithConsultations.consultations,
        );
        authorizedDepth = previousRows.length;
      } else if (isDeepening) {
        // Client claims deepening but session not found in DB — treat as fresh.
        previousRows = [];
        authorizedDepth = 0;
      }
    }

    // Use DB-derived depth as the authoritative signal; if the DB shows existing
    // consultations, enforce the depth limit regardless of what isDeepening says.
    const effectiveIsDeepening = isDeepening || authorizedDepth > 0;
    if (
      shouldBlockDeepening({
        isDeepening: effectiveIsDeepening,
        historyLength: authorizedDepth,
        sessionLimit: maxDepth,
      })
    ) {
      return NextResponse.json(
        {
          error: "session_limit",
          message: consultApiUi.sessionLimit,
          session_limit: maxDepth,
        },
        { status: 429 },
      );
    }

    const isMasterCombined = resolvedTranslator === "master_combined";
    const tokensToConsume = isMasterCombined ? 2 : 1;

    let remainingAfterConsume = adminUnlimitedCredits ? 999_999 : -1;
    if (!adminUnlimitedCredits) {
      remainingAfterConsume = await consumeToken(authedUserId, tokensToConsume);
      if (remainingAfterConsume === -1) {
        log.info("insufficient_credits", { userId: shortUserId(authedUserId), tier: tierKey, oracleMode });
        await log.flush();
        return NextResponse.json(
          {
            error: "insufficient_credits",
            message: isMasterCombined
              ? consultApiUi.insufficientCreditsMaster
              : consultApiUi.insufficientCredits,
            tokens_available: 0,
          },
          { status: 402 },
        );
      }
      log.info("token_consumed", {
        userId: shortUserId(authedUserId),
        tier: tierKey,
        tokensConsumed: tokensToConsume,
        remaining: remainingAfterConsume,
        oracleMode,
      });
    }
    const adminConfig = await getAdminConfig();
    const adminAllowed = adminBypassAllowed;
    let responseMode: "ritual" | "stream_ritual" =
      body.responseMode === "stream_ritual" ? "stream_ritual" : "ritual";
    if (oracleMode === "iching" && ichingManualPayload.mode === "manual") {
      responseMode = "ritual";
    }
    const imageProviderOverride =
      adminAllowed && body.imageProviderOverride
        ? body.imageProviderOverride
        : adminConfig.imageProviderDefault;
    if (oracleMode === "oracle_bones") {
      const positive =
        typeof body.oracleBones?.positiveCharge === "string" &&
        body.oracleBones.positiveCharge.trim()
          ? body.oracleBones.positiveCharge.trim()
          : trimmedQuestion;
      if (!positive) {
        return NextResponse.json(
          {
            error: "oracle_bones_charge_required",
            code: "ORACLE_BONES_CHARGE_REQUIRED",
            action: "fix_input",
          },
          { status: 400 },
        );
      }
      const medium = body.oracleBones?.medium === "ox" ? "ox" : "turtle";
      const negativeRaw =
        typeof body.oracleBones?.negativeCharge === "string"
          ? body.oracleBones.negativeCharge.trim()
          : "";
      const positiveLanguageHint = detectLanguageFromUserText(positive);
      const oracleLanguage = positiveLanguageHint ?? language;
      const negative =
        negativeRaw || defaultNegativeCharge(positive, oracleLanguage);

      const bonesCast = performOracleBonesCast(positive, negative, medium);
      const context = resolveSessionContext({
        tier: tierKey,
        sessionId,
        isDeepening,
        sessionTitle: body.sessionTitle ?? null,
        previousRows: previousRows,
        patternHints: null,
        locale: oracleLanguage,
      });

      const prevBonesMessageId = await getPrevClaudeMessageId(authedUserId, sessionId);
      const {
        text: interpretation,
        category,
        interpretationSummary: rawInterpretationSummary,
        claudeMessageId: bonesClaudeMessageId,
      } = await generateOracleBonesInterpretation(
        bonesCast,
        tierEffective,
        context,
        "ritual",
        oracleLanguage,
        process.env,
        displayName,
        prevBonesMessageId,
      );
      if (bonesClaudeMessageId) void setPrevClaudeMessageId(authedUserId, sessionId, bonesClaudeMessageId);
      const interpretationSummary =
        rawInterpretationSummary?.trim() ||
        summarizeInterpretationForContext(interpretation);

      const imagePrompt = buildOracleBonesImagePrompt({
        category,
        medium: bonesCast.medium,
        patternId: bonesCast.patternId,
        verdictLabel: verdictLabelForPrompt(bonesCast.verdict),
        consultationId: bonesCast.id,
      });
      let image = await buildOracleBonesImageAsset({
        prompt: imagePrompt,
        patternId: bonesCast.patternId,
        verdict: bonesCast.verdict,
        medium: bonesCast.medium,
        tier: tierEffective,
        providerOverride: imageProviderOverride,
        consultationId: bonesCast.id,
      });
      image = await finalizeReadingImages(image, tierEffective);

      const oracleBonesSnapshot: OracleBonesHistorySnapshot = {
        pattern_id: bonesCast.patternId,
        verdict: bonesCast.verdict,
        positive_charge: bonesCast.positiveCharge,
        negative_charge: bonesCast.negativeCharge,
        medium: bonesCast.medium,
      };

      const nextPosition = previousRows.length + 1;
      const canDeepen = canDeepenAfterNextConsult({
        historyLength: previousRows.length,
        sessionLimit: maxDepth,
      });
      const sharing = await upsertSessionAndConsultation({
        userId: authedUserId,
        sessionId,
        sessionTitle: body.sessionTitle ?? "Consulta sin titulo",
        language: oracleLanguage,
        category,
        maxConsultations: maxDepth,
        consultation: {
          consultationId: bonesCast.id,
          sessionId,
          sessionPosition: nextPosition,
          question: bonesCast.positiveCharge,
          language: oracleLanguage,
          primaryHexagram: 0,
          primaryHexagramName: "Oracle Bones",
          primaryHexagramChinese: "甲骨",
          transformedHexagram: null,
          transformedHexagramName: null,
          mutationRule: "ORACLE_BONES",
          lines: [],
          changingLines: [],
          interpretation,
          interpretationSummary,
          category,
          imageProvider: image.provider,
          imageUrl: image.imageUrl,
          imageFallbackUrl: image.fallbackImageUrl,
          oracleType: "oracle_bones",
          oracleBones: oracleBonesSnapshot,
        },
      });

      log.info("oracle_bones_complete", {
        userId: shortUserId(authedUserId),
        verdict: bonesCast.verdict,
        medium: bonesCast.medium,
        imageProvider: image.provider,
        sessionPosition: nextPosition,
        canDeepen,
      });
      await log.flush();
      return NextResponse.json({
        sharingPersisted: isSharingPersistenceAvailable(),
        oracleType: "oracle_bones" as const,
        consultationId: bonesCast.id,
        primaryHexagram: 0,
        primaryHexagramName: "Oracle Bones",
        primaryHexagramChinese: "甲骨",
        transformedHexagram: null,
        transformedHexagramName: null,
        mutationRule: "ORACLE_BONES",
        lines: [],
        changingLines: [],
        interpretation,
        category,
        imagePrompt,
        imageProvider: image.provider,
        imageUrl: image.imageUrl,
        imageFallbackUrl: image.fallbackImageUrl,
        sessionId,
        sessionPosition: nextPosition,
        canDeepen,
        sessionMaxDepth: maxDepth,
        remainingCredits: remainingAfterConsume,
        creditLimit: null,
        publicReadingId: sharing.publicReadingId,
        publicSessionId: sharing.publicSessionId,
        oracleBones: {
          patternId: bonesCast.patternId,
          verdict: bonesCast.verdict,
          affirmsPositive: bonesCast.affirmsPositive,
          positiveCharge: bonesCast.positiveCharge,
          negativeCharge: bonesCast.negativeCharge,
          medium: bonesCast.medium,
        },
      });
    }

    const castResult =
      ichingManualPayload.mode === "manual"
        ? performCastFromLineValues(
            trimmedQuestion,
            language,
            ichingManualPayload.lineValues,
            {
              castingMethod: ichingManualPayload.castingMethod,
              translator: resolvedTranslator,
            },
          )
        : ichingManualPayload.castingMethod === "yarrow-stalks"
          ? performYarrowCast(trimmedQuestion, language, {
              translator: resolvedTranslator,
            })
          : performCast(trimmedQuestion, language, {
              translator: resolvedTranslator,
            });
    const context = resolveSessionContext({
      tier: tierKey,
      sessionId,
      isDeepening,
      sessionTitle: body.sessionTitle ?? null,
      previousRows: previousRows,
      patternHints: null,
      locale: language,
    });

    if (responseMode === "stream_ritual") {
      const ritualTraceId = randomUUID().slice(0, 8);
      const ritualStartedAt = Date.now();
      const ritualLog = (label: string, extra?: Record<string, unknown>) => {
        if (!LOG_RITUAL_STREAM_DEBUG) return;
        const elapsedMs = Date.now() - ritualStartedAt;
        const msg = `[stream_ritual][${ritualTraceId}][+${elapsedMs}ms] ${label}`;
        // In development, also write to stdout so the local terminal shows trace timing.
        // In production this branch is skipped — Axiom is the only sink.
        if (process.env.NODE_ENV === "development") {
          extra ? console.log(msg, extra) : console.log(msg);
        }
        log.debug(msg, { traceId: ritualTraceId, elapsedMs, ...(extra ?? {}) });
      };
      ritualLog("start", {
        user: shortUserId(authedUserId),
        sessionId,
        questionLength: trimmedQuestion.length,
        oracleMode,
      });
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const writeEvent = (
            event: "cast_ready" | "oracle_ready" | "final_ready" | "error",
            payload: unknown,
          ) => {
            controller.enqueue(
              encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`,
              ),
            );
          };

          void (async () => {
            try {
              writeEvent("cast_ready", {
                oracleType: "iching" as const,
                consultationId: castResult.id,
                primaryHexagram: castResult.primaryHexagram.number,
                transformedHexagram:
                  castResult.transformedHexagram?.number ?? null,
                mutationRule: castResult.mutationRule,
                lines: castResult.lines,
                changingLines: castResult.changingLines,
              });
              ritualLog("event:cast_ready", {
                primaryHexagram: castResult.primaryHexagram.number,
                changedLines: castResult.changingLines.length,
              });

              const prevIchingMessageId = await getPrevClaudeMessageId(authedUserId, sessionId);
              const {
                text: interpretation,
                category,
                interpretationSummary: rawInterpretationSummary,
                claudeMessageId: ichingClaudeMessageId,
              } = await generateInterpretation(
                castResult,
                tierEffective,
                context,
                "ritual",
                process.env,
                displayName,
                castResult.castingMethod,
                prevIchingMessageId,
              );
              if (ichingClaudeMessageId) void setPrevClaudeMessageId(authedUserId, sessionId, ichingClaudeMessageId);
              const interpretationSummary =
                rawInterpretationSummary?.trim() ||
                summarizeInterpretationForContext(interpretation);

              writeEvent("oracle_ready", {
                interpretation,
                category,
              });
              ritualLog("event:oracle_ready", { category });

              const imagePrompt = buildImagePrompt(
                castResult.primaryHexagram,
                castResult.transformedHexagram,
                category,
                castResult.changingLines,
                castResult.lines,
                castResult.id,
              );
              let image = await buildImageAsset({
                prompt: imagePrompt,
                primaryHexagram: castResult.primaryHexagram.number,
                primaryHexagramName: castResult.primaryHexagram.name,
                primaryChinese: castResult.primaryHexagram.chineseName,
                pinyin: castResult.primaryHexagram.pinyin,
                transformedHexagram: castResult.transformedHexagram
                  ? {
                      number: castResult.transformedHexagram.number,
                      name: castResult.transformedHexagram.name,
                      chineseName: castResult.transformedHexagram.chineseName,
                    }
                  : null,
                category,
                mutationRule: castResult.mutationRule,
                changingLines: castResult.changingLines,
                lines: castResult.lines.map((l) => ({
                  position: l.position,
                  value: l.value,
                  isChanging: l.isChanging,
                })),
                tier: tierEffective,
                providerOverride: imageProviderOverride,
                consultationId: castResult.id,
              });
              image = await finalizeReadingImages(image, tierEffective);
              ritualLog("assets_ready", {
                category,
                imageProvider: image.provider,
              });

              const nextPosition = previousRows.length + 1;
              const canDeepen = canDeepenAfterNextConsult({
                historyLength: previousRows.length,
                sessionLimit: maxDepth,
              });
              const sharing = await upsertSessionAndConsultation({
                userId: authedUserId,
                sessionId,
                sessionTitle: body.sessionTitle ?? "Consulta sin titulo",
                language,
                category,
                maxConsultations: maxDepth,
                consultation: {
                  consultationId: castResult.id,
                  sessionId,
                  sessionPosition: nextPosition,
                  question: trimmedQuestion,
                  language,
                  primaryHexagram: castResult.primaryHexagram.number,
                  primaryHexagramName: castResult.primaryHexagram.name,
                  primaryHexagramChinese:
                    castResult.primaryHexagram.chineseName,
                  transformedHexagram:
                    castResult.transformedHexagram?.number ?? null,
                  transformedHexagramName:
                    castResult.transformedHexagram?.name ?? null,
                  mutationRule: castResult.mutationRule,
                  translator: resolvedTranslator,
                  lines: castResult.lines,
                  changingLines: castResult.changingLines,
                  interpretation,
                  interpretationSummary,
                  category,
                  imageProvider: image.provider,
                  imageUrl: image.imageUrl,
                  imageFallbackUrl: image.fallbackImageUrl,
                  oracleType: "iching",
                  oracleBones: null,
                },
              });

              log.info("stream_consult_complete", {
                userId: shortUserId(authedUserId),
                hexagram: castResult.primaryHexagram.number,
                transformedHexagram: castResult.transformedHexagram?.number ?? null,
                category,
                imageProvider: image.provider,
                sessionPosition: nextPosition,
                canDeepen,
                translator: resolvedTranslator,
              });
              writeEvent("final_ready", {
                sharingPersisted: isSharingPersistenceAvailable(),
                oracleType: "iching" as const,
                consultationId: castResult.id,
                primaryHexagram: castResult.primaryHexagram.number,
                primaryHexagramName: castResult.primaryHexagram.name,
                primaryHexagramChinese: castResult.primaryHexagram.chineseName,
                transformedHexagram:
                  castResult.transformedHexagram?.number ?? null,
                transformedHexagramName:
                  castResult.transformedHexagram?.name ?? null,
                mutationRule: castResult.mutationRule,
                translator: resolvedTranslator,
                lines: castResult.lines,
                changingLines: castResult.changingLines,
                interpretation,
                category,
                imagePrompt,
                imageProvider: image.provider,
                imageUrl: image.imageUrl,
                imageFallbackUrl: image.fallbackImageUrl,
                imageProviderDebug: image.debug ?? undefined,
                sessionId,
                sessionPosition: nextPosition,
                canDeepen,
                sessionMaxDepth: maxDepth,
                remainingCredits: remainingAfterConsume,
                creditLimit: null,
                publicReadingId: sharing.publicReadingId,
                publicSessionId: sharing.publicSessionId,
              });
              ritualLog("event:final_ready", {
                transformedHexagram:
                  castResult.transformedHexagram?.number ?? null,
              });
            } catch (streamError) {
              log.error("stream_consult_error", {
                userId: shortUserId(authedUserId),
                message: streamError instanceof Error ? streamError.message : String(streamError),
              });
              console.error("[api/consult][stream_ritual]", streamError);
              ritualLog("event:error", {
                message:
                  streamError instanceof Error
                    ? streamError.message
                    : "unknown",
              });
              writeEvent("error", {
                error: "consult_failed",
                code: "CONSULT_FAILED",
                action: "retry",
                message:
                  process.env.NODE_ENV === "development" &&
                  streamError instanceof Error
                    ? streamError.message
                    : undefined,
              });
            } finally {
              ritualLog("close");
              await log.flush();
              controller.close();
            }
          })();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const prevMsgId = await getPrevClaudeMessageId(authedUserId, sessionId);
    const {
      text: interpretation,
      category,
      interpretationSummary: rawInterpretationSummary,
      claudeMessageId: newMsgId,
    } = await generateInterpretation(
      castResult,
      tierEffective,
      context,
      "ritual",
      process.env,
      displayName,
      castResult.castingMethod,
      prevMsgId,
    );
    if (newMsgId) void setPrevClaudeMessageId(authedUserId, sessionId, newMsgId);
    const interpretationSummary =
      rawInterpretationSummary?.trim() ||
      summarizeInterpretationForContext(interpretation);

    const imagePrompt = buildImagePrompt(
      castResult.primaryHexagram,
      castResult.transformedHexagram,
      category,
      castResult.changingLines,
      castResult.lines,
      castResult.id,
    );
    let image = await buildImageAsset({
      prompt: imagePrompt,
      primaryHexagram: castResult.primaryHexagram.number,
      primaryHexagramName: castResult.primaryHexagram.name,
      primaryChinese: castResult.primaryHexagram.chineseName,
      pinyin: castResult.primaryHexagram.pinyin,
      transformedHexagram: castResult.transformedHexagram
        ? {
            number: castResult.transformedHexagram.number,
            name: castResult.transformedHexagram.name,
            chineseName: castResult.transformedHexagram.chineseName,
          }
        : null,
      category,
      mutationRule: castResult.mutationRule,
      changingLines: castResult.changingLines,
      lines: castResult.lines.map((l) => ({
        position: l.position,
        value: l.value,
        isChanging: l.isChanging,
      })),
      tier: tierEffective,
      providerOverride: imageProviderOverride,
      consultationId: castResult.id,
    });
    image = await finalizeReadingImages(image, tierEffective);

    const nextPosition = previousRows.length + 1;
    const canDeepen = canDeepenAfterNextConsult({
      historyLength: previousRows.length,
      sessionLimit: maxDepth,
    });
    const sharing = await upsertSessionAndConsultation({
      userId: authedUserId,
      sessionId,
      sessionTitle: body.sessionTitle ?? "Consulta sin titulo",
      language,
      category,
      maxConsultations: maxDepth,
      consultation: {
        consultationId: castResult.id,
        sessionId,
        sessionPosition: nextPosition,
        question: trimmedQuestion,
        language,
        primaryHexagram: castResult.primaryHexagram.number,
        primaryHexagramName: castResult.primaryHexagram.name,
        primaryHexagramChinese: castResult.primaryHexagram.chineseName,
        transformedHexagram: castResult.transformedHexagram?.number ?? null,
        transformedHexagramName: castResult.transformedHexagram?.name ?? null,
        mutationRule: castResult.mutationRule,
        translator: resolvedTranslator,
        lines: castResult.lines,
        changingLines: castResult.changingLines,
        interpretation,
        interpretationSummary,
        category,
        imageProvider: image.provider,
        imageUrl: image.imageUrl,
        imageFallbackUrl: image.fallbackImageUrl,
        oracleType: "iching",
        oracleBones: null,
      },
    });

    log.info("consult_complete", {
      userId: shortUserId(authedUserId),
      hexagram: castResult.primaryHexagram.number,
      transformedHexagram: castResult.transformedHexagram?.number ?? null,
      category,
      imageProvider: image.provider,
      sessionPosition: nextPosition,
      canDeepen,
      translator: resolvedTranslator,
    });
    await log.flush();
    return NextResponse.json({
      sharingPersisted: isSharingPersistenceAvailable(),
      oracleType: "iching" as const,
      consultationId: castResult.id,
      primaryHexagram: castResult.primaryHexagram.number,
      primaryHexagramName: castResult.primaryHexagram.name,
      primaryHexagramChinese: castResult.primaryHexagram.chineseName,
      transformedHexagram: castResult.transformedHexagram?.number ?? null,
      transformedHexagramName: castResult.transformedHexagram?.name ?? null,
      mutationRule: castResult.mutationRule,
      translator: resolvedTranslator,
      lines: castResult.lines,
      changingLines: castResult.changingLines,
      interpretation,
      category,
      imagePrompt,
      imageProvider: image.provider,
      imageUrl: image.imageUrl,
      imageFallbackUrl: image.fallbackImageUrl,
      imageProviderDebug: image.debug ?? undefined,
      sessionId,
      sessionPosition: nextPosition,
      canDeepen,
      sessionMaxDepth: maxDepth,
      remainingCredits: remainingAfterConsume,
      creditLimit: null,
      publicReadingId: sharing.publicReadingId,
      publicSessionId: sharing.publicSessionId,
    });
  } catch (e) {
    log.error("consult_unhandled_error", { message: e instanceof Error ? e.message : String(e) });
    await log.flush();
    console.error("[api/consult]", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: "consult_failed",
        code: "CONSULT_FAILED",
        action: "retry",
        message: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
