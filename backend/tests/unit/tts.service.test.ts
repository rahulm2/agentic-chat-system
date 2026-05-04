import { describe, it, expect, mock } from "bun:test";
import { TtsService } from "@/modules/tts/tts.service.ts";

// Mock OpenAI
const mockCreate = mock(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
  }),
);

mock.module("openai", () => ({
  default: class {
    audio = { speech: { create: mockCreate } };
  },
}));

describe("TtsService", () => {
  const service = new TtsService({
    openaiApiKey: "test-key",
    model: "tts-1",
    voice: "alloy",
  });

  it("returns audio buffer from OpenAI", async () => {
    const result = await service.synthesize("Hello world");
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(100);
  });

  it("calls OpenAI with correct parameters", async () => {
    await service.synthesize("Test text");
    expect(mockCreate).toHaveBeenCalledWith({
      model: "tts-1",
      voice: "alloy",
      input: "Test text",
      response_format: "mp3",
    });
  });

  it("throws when API key is empty", async () => {
    const noKeyService = new TtsService({
      openaiApiKey: "",
      model: "tts-1",
      voice: "alloy",
    });
    await expect(noKeyService.synthesize("test")).rejects.toThrow(
      "OpenAI API key not configured",
    );
  });
});
