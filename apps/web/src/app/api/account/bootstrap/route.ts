import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { getAccountBillingSnapshot } from "@/lib/credits";
import { getUserSessionSummaries, isChatPersistenceConfigured } from "@/lib/session-store";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "@/lib/legal-consent";
import { getSessionLimit as getSessionLimitFromPack } from "@/lib/token-packs";
import { withSupabaseSemaphore } from "@/lib/supabase-admin";
import { getUpstashRedis } from "@/lib/rate-limit";
import {
  buildSupabaseOpTelemetry,
  createApiLogger,
  isSupabaseTelemetryEnabled,
} from "@/lib/supabase-telemetry";

// Short-lived cache to absorb the login burst when multiple Vercel instances call
// this endpoint within milliseconds (React strict remounts, APK + WebView). 8 seconds
// is safe: bootstrap data only changes mid-window via purchase webhook or consult,
// neither of which arrives within 8s of a fresh login. Post-purchase refresh uses
// iching:account-refresh → /api/account/me, not bootstrap.
const BOOTSTRAP_CACHE_TTL_SECONDS =
  process.env.NODE_ENV === "production" ? 30 : 8;
const BOOTSTRAP_LOCK_TTL_SECONDS = 15;
const BOOTSTRAP_POLL_MS = 150;
const BOOTSTRAP_POLL_MAX_MS = 3_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForBootstrapCache(
  redis: NonNullable<ReturnType<typeof getUpstashRedis>>,
  cacheKey: string,
): Promise<{ payload: object | null; waitedPollMs: number }> {
  const pollStartedAt = Date.now();
  const deadline = Date.now() + BOOTSTRAP_POLL_MAX_MS;
  while (Date.now() < deadline) {
    await sleep(BOOTSTRAP_POLL_MS);
    try {
      const cached = await redis.get<object>(cacheKey);
      if (cached) {
        return { payload: cached, waitedPollMs: Date.now() - pollStartedAt };
      }
    } catch {
      // Non-fatal: keep polling
    }
  }
  return { payload: null, waitedPollMs: Date.now() - pollStartedAt };
}

export const runtime = "nodejs";

/**
 * Single login bootstrap call — replaces the concurrent /api/account/me +
 * /api/account/chats?summary=1 pair fired at page load.
 * Runs billing, profile, legal, and session-summary queries sequentially
 * (one PostgREST connection at a time within a single semaphore slot).
 */
export async function GET(req: Request) {
  const startedAt = Date.now();
  const api = createApiLogger("api/account/bootstrap", req, "/api/account/bootstrap");

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  // Serve cached response within the burst window. Key is per-user so a
  // simultaneous login from two Vercel instances returns the same data without
  // hitting PostgREST twice. Cache miss on first call, hit on any subsequent
  // call within BOOTSTRAP_CACHE_TTL_SECONDS.
  const redis = getUpstashRedis();
  const cacheKey = `bootstrap:${user.userId}`;
  const lockKey = `bootstrap:lock:${user.userId}`;
  let holdsLock = false;
  let lockAcquired = false;
  let cacheHit = false;
  let waitedPollMs = 0;

  if (redis) {
    try {
      const cached = await redis.get<object>(cacheKey);
      if (cached) {
        cacheHit = true;
        if (isSupabaseTelemetryEnabled()) {
          api.log.info("bootstrap_get", {
            requestId: api.requestId,
            cacheHit: true,
            lockAcquired: false,
            holdsLock: false,
            waitedPollMs: 0,
            durationMs: Date.now() - startedAt,
            sessionCount: Array.isArray((cached as { sessions?: unknown[] }).sessions)
              ? (cached as { sessions: unknown[] }).sessions.length
              : null,
            userId: user.userId.slice(0, 8),
          });
          await api.log.flush();
        }
        return NextResponse.json(cached);
      }

      const acquired = await redis.set(lockKey, "1", {
        nx: true,
        ex: BOOTSTRAP_LOCK_TTL_SECONDS,
      });
      lockAcquired = Boolean(acquired);
      holdsLock = lockAcquired;
      if (!acquired) {
        const waited = await waitForBootstrapCache(redis, cacheKey);
        waitedPollMs = waited.waitedPollMs;
        if (waited.payload) {
          cacheHit = true;
          if (isSupabaseTelemetryEnabled()) {
            api.log.info("bootstrap_get", {
              requestId: api.requestId,
              cacheHit: true,
              lockAcquired: false,
              holdsLock: false,
              waitedPollMs,
              durationMs: Date.now() - startedAt,
              sessionCount: Array.isArray((waited.payload as { sessions?: unknown[] }).sessions)
                ? (waited.payload as { sessions: unknown[] }).sessions.length
                : null,
              userId: user.userId.slice(0, 8),
            });
            await api.log.flush();
          }
          return NextResponse.json(waited.payload);
        }
        const retryAcquired = await redis.set(lockKey, "1", {
          nx: true,
          ex: BOOTSTRAP_LOCK_TTL_SECONDS,
        });
        if (retryAcquired) {
          lockAcquired = true;
          holdsLock = true;
        } else {
          const waitedAgain = await waitForBootstrapCache(redis, cacheKey);
          waitedPollMs += waitedAgain.waitedPollMs;
          if (waitedAgain.payload) {
            cacheHit = true;
            if (isSupabaseTelemetryEnabled()) {
              api.log.info("bootstrap_get", {
                requestId: api.requestId,
                cacheHit: true,
                lockAcquired: false,
                holdsLock: false,
                waitedPollMs,
                durationMs: Date.now() - startedAt,
                sessionCount: Array.isArray(
                  (waitedAgain.payload as { sessions?: unknown[] }).sessions,
                )
                  ? (waitedAgain.payload as { sessions: unknown[] }).sessions.length
                  : null,
                userId: user.userId.slice(0, 8),
              });
              await api.log.flush();
            }
            return NextResponse.json(waitedAgain.payload);
          }
        }
      }
    } catch {
      // Non-fatal: fall through to fresh query without lock
    }
  }

  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  const supabase = getSupabaseAdmin();

  const persistenceOk = isChatPersistenceConfigured();

  const bootstrapTelemetry = buildSupabaseOpTelemetry(api, "bootstrap_bundle", {
    userId: user.userId,
  });

  const { billing, sessions, profileRow, legalRow } = await withSupabaseSemaphore(async () => {
    const billingSnapshot = await getAccountBillingSnapshot(user.userId);
    const sessionSummaries = persistenceOk
      ? await getUserSessionSummaries(user.userId).catch(() => [])
      : [];
    const profile = supabase
      ? (
          await supabase
            .from("users")
            .select("two_factor_enabled, two_factor_method, display_name, is_admin, tour_v1_completed_at")
            .eq("id", user.userId)
            .maybeSingle()
        ).data
      : null;
    const legal = supabase
      ? (
          await supabase
            .from("user_legal_acceptances")
            .select("id")
            .eq("user_id", user.userId)
            .eq("terms_version", CURRENT_TERMS_VERSION)
            .eq("privacy_version", CURRENT_PRIVACY_VERSION)
            .maybeSingle()
        ).data
      : null;
    return {
      billing: billingSnapshot,
      sessions: sessionSummaries,
      profileRow: profile,
      legalRow: legal,
    };
  }, bootstrapTelemetry);

  const responseBody = {
    // ── Account (same shape as /api/account/me) ───────────────────────────
    id: user.userId,
    email: user.email,
    tokens_available: billing.creditsRemaining,
    tokens_used_lifetime: billing.creditsUsed,
    tokens_purchased_lifetime: billing.tokensPurchasedLifetime,
    session_limit: getSessionLimitFromPack(billing.lastPack),
    last_pack: billing.lastPack,
    twoFactorEnabled: Boolean(profileRow?.two_factor_enabled),
    twoFactorMethod: (profileRow?.two_factor_method as string | null) ?? null,
    display_name: (profileRow?.display_name as string | null) ?? null,
    is_admin: profileRow?.is_admin === true,
    tour_v1_completed: Boolean(profileRow?.tour_v1_completed_at),
    legal_terms_version: CURRENT_TERMS_VERSION,
    legal_privacy_version: CURRENT_PRIVACY_VERSION,
    legal_acceptance_current: Boolean(legalRow?.id),
    // ── Sessions (same shape as /api/account/chats?summary=1) ────────────
    sessions: sessions.map((entry) => ({
      session: entry.session,
      messageCount: entry.messageCount,
      firstConsultationAt: entry.firstConsultationAt,
      updatedAt: entry.updatedAt,
      firstQuestion: entry.firstQuestion,
    })),
  };

  if (redis) {
    try {
      await redis.set(cacheKey, responseBody, { ex: BOOTSTRAP_CACHE_TTL_SECONDS });
    } catch {
      // Non-fatal: response still valid for this caller
    }
    if (holdsLock) {
      redis.del(lockKey).catch(() => {});
    }
  }

  if (isSupabaseTelemetryEnabled()) {
    api.log.info("bootstrap_get", {
      requestId: api.requestId,
      cacheHit,
      lockAcquired,
      holdsLock,
      waitedPollMs,
      durationMs: Date.now() - startedAt,
      sessionCount: sessions.length,
      userId: user.userId.slice(0, 8),
    });
    await api.log.flush();
  }

  return NextResponse.json(responseBody);
}
