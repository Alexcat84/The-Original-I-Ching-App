import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

// Semaphore: limits concurrent PostgREST connections per Node.js instance to 4.
// PostgREST pool = 10; Vercel can have multiple instances, so 4/instance provides
// headroom for concurrent users without saturating the pool.
const MAX_CONCURRENT = 4;
let activeCount = 0;
const waitQueue: Array<() => void> = [];

export async function withSupabaseSemaphore<T>(fn: () => Promise<T>): Promise<T> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
  } else {
    await new Promise<void>((resolve) => waitQueue.push(resolve));
    activeCount++;
  }
  try {
    return await fn();
  } finally {
    activeCount--;
    const next = waitQueue.shift();
    if (next) next();
  }
}

