import { Redis } from "@upstash/redis";

let redisClient: Redis | null | undefined;
let _warnedOnce = false;

export function isUpstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function redis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (isUpstashConfigured() && url && token) {
    redisClient = new Redis({ url, token });
  } else {
    redisClient = null;
    if (!_warnedOnce && process.env.NODE_ENV === "production") {
      _warnedOnce = true;
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. " +
          "Rate limiting is using an in-process Map which is NOT effective on serverless. " +
          "Configure Upstash Redis in Vercel environment variables.",
      );
    }
  }
  return redisClient;
}

/** Shared Upstash client for rate limits, tier/query credits, and session KV (see session-store). */
export function getUpstashRedis(): Redis | null {
  return redis();
}

const inMemoryBucket = new Map<string, { count: number; resetAt: number }>();

export async function rateLimitByKey(params: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<{ ok: boolean; remaining: number }> {
  const r = redis();
  if (r) {
    try {
      const redisKey = `rl:${params.key}`;
      const count = await r.incr(redisKey);
      if (count === 1) {
        await r.expire(redisKey, params.windowSeconds);
      }
      return { ok: count <= params.limit, remaining: Math.max(0, params.limit - count) };
    } catch (err) {
      // Redis reachable but credentials invalid (e.g. rotated token not yet updated in env).
      // Fail-closed in production; fall through to in-memory in dev.
      console.error("[rate-limit] Upstash error (bad credentials or network):", err);
      if (process.env.NODE_ENV === "production") {
        return { ok: false, remaining: 0 };
      }
    }
  }

  // Production: fail-closed. In-memory Map is not effective across serverless
  // instances — an attacker can bypass it by distributing requests. Block all
  // requests until Upstash is correctly configured.
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[rate-limit] FATAL: Upstash not configured in production. " +
        "Blocking request (fail-closed). Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
    return { ok: false, remaining: 0 };
  }

  // Development only: in-memory fallback (single process, acceptable locally).
  const now = Date.now();
  const slot = inMemoryBucket.get(params.key);
  if (!slot || now >= slot.resetAt) {
    inMemoryBucket.set(params.key, {
      count: 1,
      resetAt: now + params.windowSeconds * 1000,
    });
    return { ok: true, remaining: params.limit - 1 };
  }
  slot.count += 1;
  return { ok: slot.count <= params.limit, remaining: Math.max(0, params.limit - slot.count) };
}

