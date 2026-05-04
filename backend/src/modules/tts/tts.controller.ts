import type { Context } from "hono";
import { Controller, Post } from "@asla/hono-decorator";
import type { TtsService } from "./tts.service.ts";
import { ttsRequestSchema } from "./tts.schema.ts";

@Controller({ basePath: "/api/tts" })
export class TtsController {
  constructor(private service: TtsService) {}

  @Post("/")
  async synthesize(c: Context) {
    const body = ttsRequestSchema.parse(await c.req.json());
    const audioBuffer = await this.service.synthesize(body.text);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  }
}
