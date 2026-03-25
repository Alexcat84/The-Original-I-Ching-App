import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().min(1).optional(),
});

export type ClaudeEnv = z.infer<typeof envSchema>;

export function loadClaudeEnv(processEnv: NodeJS.ProcessEnv): ClaudeEnv {
  return envSchema.parse({
    ANTHROPIC_API_KEY: processEnv.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: processEnv.ANTHROPIC_MODEL,
    GROQ_API_KEY: processEnv.GROQ_API_KEY,
    GROQ_MODEL: processEnv.GROQ_MODEL,
  });
}
