import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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
// PostgREST db_pool is ~10 regardless of compute tier; 8 leaves 2 slots as margin.
// Fail-open: if Upstash is unavailable the local semaphore still applies.
const REDIS_GLOBAL_KEY = "supabase:concurrent";
const GLOBAL_MAX_CONCURRENT = 8;
const GLOBAL_TTL_SECONDS = 30; // auto-cleanup if a Vercel instance crashes mid-request

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
      // Refresh TTL so the key only expires after a period of complete inactivity
      redis.expire(REDIS_GLOBAL_KEY, GLOBAL_TTL_SECONDS).catch(() => {});
      if (count <= GLOBAL_MAX_CONCURRENT) return true;
      // Over limit — release the slot we just took and wait before retrying
      redis.decr(REDIS_GLOBAL_KEY).catch(() => {});
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

    // Release global slot (fire-and-forget — response already sent/thrown)
    if (globalHeld) releaseGlobalSlot().catch(() => {});

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
  }
}
