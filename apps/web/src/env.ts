import { z } from "zod";

const envSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url("Must be a valid URL"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "Token is required"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error("Invalid environment variables");
  }
}

export const env = _env.success ? _env.data : ({} as z.infer<typeof envSchema>);
