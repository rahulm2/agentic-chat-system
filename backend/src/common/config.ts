import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  OPENAI_API_KEY: z.string(),
  JWT_SECRET: z.string().min(32),
  OPENFDA_API_KEY: z.string().optional(),
  PORT: z.coerce.number().default(3000),
  MAX_AGENT_STEPS: z.coerce.number().default(6),
  AI_MODEL: z.string().default("gpt-4o"),
  AI_TIMEOUT_MS: z.coerce.number().default(30000),
  TTS_MODEL: z.string().default("tts-1"),
  TTS_VOICE: z.string().default("alloy"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(env: Record<string, string | undefined>): Env {
  return envSchema.parse(env);
}
