import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import {
  isSupabaseTelemetryEnabled,
  logSupabaseOp,
  type SupabaseOpTelemetry,
} from "@/lib/supabase-telemetry";
import { getUpstashRedis } from "@/lib/rate-limit";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return null;
  cached = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

// ── Local semaphore (per-instance) ──────────────────────────────────────────
// Limits concurrent PostgREST connections per Node.js instance.
// Acts as the local backpressure queue; global Redis gate runs after this.
const MAX_CONCURRENT = 2;
let activeCount = 0;
const waitQueue: Array<() => void> = [];

// ── Global Redis semaphore (cross-instance) ──────────────────────────────────
// Caps the TOTAL concurrent PostgREST connections across all Vercel instances.
// PostgREST pool confirmed ~10 (runbook SUPABASE_SCALABILITY.md 2026-06-07,
// log: "Connection Pool initialized with a maximum size of 10 connections").
// Cap 8 = pool − 2 slots margin (dashboard, pg_cron prewarm/vacuum, admin).
// Raise ONLY after Supabase Support confirms db-pool increase in writing.
// Fail-open: if Upstash is unavailable the local semaphore still applies.
const REDIS_GLOBAL_KEY = "supabase:concurrent";
const GLOBAL_MAX_CONCURRENT = 8; // audit CRIT-01: was 20, pool is ~10 not 30
const GLOBAL_TTL_SECONDS = 30; // key auto-expires 30s from creation — see §2.3 of audit plan 2026-06-11

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Try to acquire one slot in the global Redis counter.
 * Returns true if a slot was acquired (caller MUST call releaseGlobalSlot).
 * Returns false on Redis error or after retries exhausted (fail-open — no release needed).
 */
async function acquireGlobalSlot(): Promise<boolean> {
  const redis = getUpstashRedis();
  if (!redis) return false;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const count = await redis.incr(REDIS_GLOBAL_KEY);
      // Set TTL only when key is newly created (count==1) so it doesn't reset on
      // every INCR. The key expires only after GLOBAL_TTL_SECONDS of inactivity,
      // cleaning up a stuck counter if a Vercel instance crashes mid-request.
      if (count === 1) {
        redis.expire(REDIS_GLOBAL_KEY, GLOBAL_TTL_SECONDS).catch(() => {});
      }
      if (count <= GLOBAL_MAX_CONCURRENT) return true;
      // Over limit — release the slot we just took and wait before retrying
      await redis.decr(REDIS_GLOBAL_KEY);
    } catch {
      return false; // Redis unavailable → fail-open
    }
    if (attempt < 2) {
      await sleep(150 + Math.random() * 100);
    }
  }
  // All retries exhausted → proceed without a global slot (fail-open under sustained load)
  return false;
}

async function releaseGlobalSlot(): Promise<void> {
  const redis = getUpstashRedis();
  if (!redis) return;
  try {
    const remaining = await redis.decr(REDIS_GLOBAL_KEY);
    // Guard against counter going negative due to crash-recovery scenarios
    if (remaining < 0) {
      redis.set(REDIS_GLOBAL_KEY, 0, { ex: GLOBAL_TTL_SECONDS }).catch(() => {});
    }
  } catch {
    // Non-fatal: counter auto-expires via TTL
  }
}

export function getSupabaseSemaphoreSnapshot(): { activeCount: number; queueDepth: number } {
  return { activeCount, queueDepth: waitQueue.length };
}

export async function withSupabaseSemaphore<T>(
  fn: () => Promise<T>,
  telemetry?: SupabaseOpTelemetry,
): Promise<T> {
  const queueEnterAt = Date.now();
  let waited = false;

  // Step 1: acquire local slot (provides per-instance ordering and backpressure)
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
  } else {
    waited = true;
    await new Promise<void>((resolve) => waitQueue.push(resolve));
    activeCount++;
  }

  // Step 2: acquire global Redis slot (cross-instance cap, checked after local slot)
  // Checking after local slot avoids holding a global slot while waiting in the local queue.
  const globalHeld = await acquireGlobalSlot();

  const waitMs = waited ? Date.now() - queueEnterAt : 0;
  const execStart = Date.now();
  const activeAtStart = activeCount;
  const queueAtStart = waitQueue.length;

  let ok = true;
  let errorMessage: string | undefined;

  try {
    return await fn();
  } catch (err) {
    ok = false;
    errorMessage = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    // Release local slot first so the next waiter can enter
    activeCount--;
    const next = waitQueue.shift();
    if (next) next();

    // Release global slot — awaited so the DECR executes before Vercel
    // reclaims the function. Fire-and-forget risks the counter drifting up
    // in serverless if the runtime kills the process before the Promise resolves.
    if (globalHeld) await releaseGlobalSlot();

    if (telemetry && isSupabaseTelemetryEnabled()) {
      logSupabaseOp(telemetry, {
        waitMs,
        execMs: Date.now() - execStart,
        activeCount: activeAtStart,
        queueDepth: queueAtStart,
        ok,
        error: errorMessage,
      });
    }

    if (queueAtStart > 3 && process.env.VERCEL_ENV === "production") {
      Sentry.captureMessage("supabase_semaphore_queue_depth_high", {
        level: "warning",
        extra: { queueDepth: queueAtStart, activeCount: activeAtStart },
      });
    }
  }
}
