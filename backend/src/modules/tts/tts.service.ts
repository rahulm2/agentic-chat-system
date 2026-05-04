import OpenAI from "openai";
import { AppError } from "@/common/errors.ts";

export interface TtsConfig {
  openaiApiKey: string;
  model: string;
  voice: string;
}

export class TtsService {
  private client: OpenAI;

  constructor(private config: TtsConfig) {
    this.client = new OpenAI({ apiKey: config.openaiApiKey });
  }

  async synthesize(text: string): Promise<ArrayBuffer> {
    if (!this.config.openaiApiKey) {
      throw new AppError("OpenAI API key not configured", "INTERNAL_ERROR", 500);
    }

    const response = await this.client.audio.speech.create({
      model: this.config.model,
      voice: this.config.voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      response_format: "mp3",
    });

    return response.arrayBuffer();
  }
}
