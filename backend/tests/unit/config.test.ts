import { describe, it, expect } from "bun:test";
import { parseEnv } from "@/common/config.ts";

describe("parseEnv", () => {
  it("parses valid env vars", () => {
    const env = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/test",
      OPENAI_API_KEY: "sk-test-key",
      JWT_SECRET: "a-very-long-secret-that-is-at-least-32-chars",
      PORT: "4000",
      MAX_AGENT_STEPS: "10",
      AI_MODEL: "gpt-4o-mini",
      AI_TIMEOUT_MS: "15000",
      TTS_MODEL: "tts-1-hd",
      TTS_VOICE: "nova",
    });

    expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/test");
    expect(env.OPENAI_API_KEY).toBe("sk-test-key");
    expect(env.JWT_SECRET).toBe("a-very-long-secret-that-is-at-least-32-chars");
    expect(env.PORT).toBe(4000);
    expect(env.MAX_AGENT_STEPS).toBe(10);
    expect(env.AI_MODEL).toBe("gpt-4o-mini");
    expect(env.AI_TIMEOUT_MS).toBe(15000);
    expect(env.TTS_MODEL).toBe("tts-1-hd");
    expect(env.TTS_VOICE).toBe("nova");
  });

  it("uses defaults for optional env vars", () => {
    const env = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/test",
      OPENAI_API_KEY: "sk-test-key",
      JWT_SECRET: "a-very-long-secret-that-is-at-least-32-chars",
    });

    expect(env.PORT).toBe(3000);
    expect(env.MAX_AGENT_STEPS).toBe(6);
    expect(env.AI_MODEL).toBe("gpt-4o");
    expect(env.AI_TIMEOUT_MS).toBe(30000);
    expect(env.TTS_MODEL).toBe("tts-1");
    expect(env.TTS_VOICE).toBe("alloy");
  });

  it("throws on missing required env vars", () => {
    expect(() => parseEnv({})).toThrow();
    expect(() => parseEnv({ DATABASE_URL: "postgresql://localhost" })).toThrow();
  });
});
