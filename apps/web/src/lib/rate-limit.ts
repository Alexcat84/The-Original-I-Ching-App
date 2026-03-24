import { Redis } from "@upstash/redis";

let redisClient: Redis | null | undefined;

function redis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

const inMemoryBucket = new Map<string, { count: number; resetAt: number }>();

export async function rateLimitByKey(params: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<{ ok: boolean; remaining: number }> {
  const r = redis();
  if (r) {
    const redisKey = `rl:${params.key}`;
    const count = await r.incr(redisKey);
    if (count === 1) {
      await r.expire(redisKey, params.windowSeconds);
    }
    return { ok: count <= params.limit, remaining: Math.max(0, params.limit - count) };
  }
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

