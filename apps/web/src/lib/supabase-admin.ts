import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  isSupabaseTelemetryEnabled,
  logSupabaseOp,
  type SupabaseOpTelemetry,
} from "@/lib/supabase-telemetry";

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

// Semaphore: limits concurrent PostgREST connections per Node.js instance.
// PostgREST db_pool is ~10 on Small compute and does not scale with tier.
// With Vercel serverless scaling (many instances), 2/instance keeps the
// total well under the pool ceiling: 5 instances × 2 = 10 = pool limit.
const MAX_CONCURRENT = 2;
let activeCount = 0;
const waitQueue: Array<() => void> = [];

export function getSupabaseSemaphoreSnapshot(): { activeCount: number; queueDepth: number } {
  return { activeCount, queueDepth: waitQueue.length };
}

export async function withSupabaseSemaphore<T>(
  fn: () => Promise<T>,
  telemetry?: SupabaseOpTelemetry,
): Promise<T> {
  const queueEnterAt = Date.now();
  let waited = false;

  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
  } else {
    waited = true;
    await new Promise<void>((resolve) => waitQueue.push(resolve));
    activeCount++;
  }

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
    activeCount--;
    const next = waitQueue.shift();
    if (next) next();

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
