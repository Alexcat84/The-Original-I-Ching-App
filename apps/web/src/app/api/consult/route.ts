import { generateInterpretation, generateOracleBonesInterpretation } from "@iching-oracle/claude";
import {
  CONTEXT_LIMITS,
  resolveSessionContext,
  type OracleBonesHistorySnapshot,
  type OracleType,
  type PreviousConsultationRow,
} from "@iching-oracle/context-engine";
import { performCast } from "@iching-oracle/iching-engine";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";
import { buildImagePrompt, buildOracleBonesImagePrompt } from "@iching-oracle/image-engine";
import { defaultNegativeCharge, performOracleBonesCast } from "@iching-oracle/oracle-bones-engine";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buildImageAsset, buildOracleBonesImageAsset, type ImageProvider } from "@/lib/image-provider";
import { getAdminConfig } from "@/lib/admin-config";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { consumeTierCredit, getUserBillingTier } from "@/lib/credits";
import { finalizeReadingImages } from "@/lib/finalize-reading-images";
import { resolveConsultPolicy } from "@/lib/policy-engine";
import { rateLimitByKey } from "@/lib/rate-limit";
import { isPersistableUuid } from "@/lib/session-ids";
import { isSharingPersistenceAvailable, upsertSessionAndConsultation } from "@/lib/session-store";

export const runtime = "nodejs";

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
    ambiguousPasses: number;
  };
};

function mapHistoryToRows(history: HistoryEntry[] | undefined): PreviousConsultationRow[] {
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
            ambiguous_passes: h.oracleBones.ambiguousPasses,
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

function verdictLabelForPrompt(verdict: OracleBonesHistorySnapshot["verdict"]): string {
  const labels: Record<OracleBonesHistorySnapshot["verdict"], string> = {
    auspicious_clear: "clearly auspicious ji 吉",
    auspicious_moderate: "moderately auspicious ji 吉",
    inauspicious_moderate: "moderately inauspicious xiong 凶",
    inauspicious_clear: "clearly inauspicious xiong 凶",
    silent: "silent indeterminate",
  };
  return labels[verdict];
}

export async function POST(req: Request) {
  let body: {
    question?: string;
    language?: string;
    tier?: string;
    sessionId?: string | null;
    isDeepening?: boolean;
    responseMode?: "ritual";
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
  const rawLanguage = typeof body.language === "string" ? body.language : "es";
  const language: AppLocale =
    (SUPPORTED_LOCALES as readonly string[]).includes(rawLanguage) ? (rawLanguage as AppLocale) : "es";
  const oracleMode: OracleType = body.oracleMode === "oracle_bones" ? "oracle_bones" : "iching";

  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return NextResponse.json(
      {
        error: "auth_required",
        code: "AUTH_REQUIRED",
        action: "login",
        message:
          "Inicia sesión con un correo verificado o con Google. Crea cuenta en /login si aún no tienes una.",
      },
      { status: 401 },
    );
  }
  const authedUserId = authUser.userId;
  const tierResolved = await getUserBillingTier(authedUserId);
  const policy = await resolveConsultPolicy({ authUser, tierResolved });
  const { adminBypassAllowed, adminUnlimitedCredits, tierEffective, tierKey } = policy;
  const maxDepth = Math.max(1, CONTEXT_LIMITS[tierKey].sessionDepth);

  const forwardedFor = req.headers.get("x-forwarded-for") ?? "unknown-ip";
  const ip = forwardedFor.split(",")[0]?.trim() ?? "unknown-ip";
  const rl = await rateLimitByKey({
    key: `consult:${ip}`,
    limit: 30,
    windowSeconds: 60,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", code: "RATE_LIMITED", action: "wait_and_retry" },
      { status: 429 },
    );
  }
  if (policy.twoFactorRequired) {
    return NextResponse.json(
      { error: "two_factor_required", code: "TWO_FACTOR_REQUIRED", action: "setup_2fa" },
      { status: 403 },
    );
  }
  if (oracleMode === "iching" && !trimmedQuestion) {
    return NextResponse.json(
      { error: "question_required", code: "CONSULT_QUESTION_REQUIRED", action: "fix_input" },
      { status: 400 },
    );
  }
  const sessionId =
    typeof body.sessionId === "string" && isPersistableUuid(body.sessionId)
      ? body.sessionId
      : randomUUID();

  const isDeepening = Boolean(body.isDeepening);
  const previousRows = mapHistoryToRows(body.history);
  if (isDeepening && previousRows.length >= maxDepth) {
    return NextResponse.json(
      { error: "thread_limit_reached", code: "CONSULT_THREAD_LIMIT_REACHED", action: "new_session" },
      { status: 409 },
    );
  }

  const credit = adminUnlimitedCredits
    ? { allowed: true, remaining: 999_999, limit: 999_999, cycleEndIso: null as string | null }
    : await consumeTierCredit(authedUserId, tierResolved);
  if (!credit.allowed) {
    return NextResponse.json(
      {
        error: "credits_exhausted",
        code: "BILLING_CREDITS_EXHAUSTED",
        action: "upgrade_plan",
        tier: tierResolved,
        creditsLimit: credit.limit,
        cycleEndsAt: credit.cycleEndIso ?? null,
      },
      { status: 402 },
    );
  }
  const adminConfig = getAdminConfig();
  const adminAllowed = adminBypassAllowed;
  const responseMode: "ritual" = "ritual";
  const imageProviderOverride =
    adminAllowed && body.imageProviderOverride ? body.imageProviderOverride : adminConfig.imageProviderDefault;
  if (oracleMode === "oracle_bones") {
    const positive =
      typeof body.oracleBones?.positiveCharge === "string" && body.oracleBones.positiveCharge.trim()
        ? body.oracleBones.positiveCharge.trim()
        : trimmedQuestion;
    if (!positive) {
      return NextResponse.json(
        { error: "oracle_bones_charge_required", code: "ORACLE_BONES_CHARGE_REQUIRED", action: "fix_input" },
        { status: 400 },
      );
    }
    const medium = body.oracleBones?.medium === "ox" ? "ox" : "turtle";
    const negativeRaw = typeof body.oracleBones?.negativeCharge === "string" ? body.oracleBones.negativeCharge.trim() : "";
    const negative = negativeRaw || defaultNegativeCharge(positive, language);

    const bonesCast = performOracleBonesCast(positive, negative, medium);
    const context = resolveSessionContext({
      tier: tierKey,
      sessionId,
      isDeepening,
      sessionTitle: body.sessionTitle ?? null,
      previousRows,
      patternHints: null,
    });

    const { text: interpretation, category } = await generateOracleBonesInterpretation(
      bonesCast,
      tierEffective,
      context,
      responseMode,
      language,
    );

    const imagePrompt = buildOracleBonesImagePrompt({
      category,
      medium: bonesCast.medium,
      patternId: bonesCast.patternId,
      verdictLabel: verdictLabelForPrompt(bonesCast.verdict),
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
      ambiguous_passes: bonesCast.ambiguousPasses,
    };

    const nextPosition = previousRows.length + 1;
    const canDeepen = nextPosition < maxDepth;
    const sharing = await upsertSessionAndConsultation({
      userId: authedUserId,
      sessionId,
      sessionTitle: body.sessionTitle ?? "Consulta sin titulo",
      language,
      category,
      maxConsultations: maxDepth,
      consultation: {
        consultationId: bonesCast.id,
        sessionId,
        sessionPosition: nextPosition,
        question: bonesCast.positiveCharge,
        language,
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
        imageProvider: image.provider,
        imageUrl: image.imageUrl,
        imageFallbackUrl: image.fallbackImageUrl,
        oracleType: "oracle_bones",
        oracleBones: oracleBonesSnapshot,
      },
    });

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
      remainingCredits: credit.remaining,
      creditLimit: credit.limit,
      publicReadingId: sharing.publicReadingId,
      publicSessionId: sharing.publicSessionId,
      oracleBones: {
        patternId: bonesCast.patternId,
        verdict: bonesCast.verdict,
        affirmsPositive: bonesCast.affirmsPositive,
        ambiguousPasses: bonesCast.ambiguousPasses,
        positiveCharge: bonesCast.positiveCharge,
        negativeCharge: bonesCast.negativeCharge,
        medium: bonesCast.medium,
      },
    });
  }

  const castResult = performCast(trimmedQuestion, language);
  const context = resolveSessionContext({
    tier: tierKey,
    sessionId,
    isDeepening,
    sessionTitle: body.sessionTitle ?? null,
    previousRows,
    patternHints: null,
  });

  const { text: interpretation, category } = await generateInterpretation(
    castResult,
    tierEffective,
    context,
    responseMode,
  );

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
  const canDeepen = nextPosition < maxDepth;
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
      lines: castResult.lines,
      changingLines: castResult.changingLines,
      interpretation,
      category,
      imageProvider: image.provider,
      imageUrl: image.imageUrl,
      imageFallbackUrl: image.fallbackImageUrl,
      oracleType: "iching",
      oracleBones: null,
    },
  });

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
    remainingCredits: credit.remaining,
    creditLimit: credit.limit,
    publicReadingId: sharing.publicReadingId,
    publicSessionId: sharing.publicSessionId,
  });
  } catch (e) {
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
