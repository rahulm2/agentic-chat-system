import { Controller, Post, Use } from "@asla/hono-decorator";
import type { AppContext } from "@/common/typed-context.ts";
import { validateBody, getBody } from "@/middleware/validate.ts";
import type { TtsService } from "./tts.service.ts";
import { ttsRequestSchema } from "./tts.schema.ts";
import type { TtsRequestDTO } from "./tts.schema.ts";

@Controller({ basePath: "/api/tts" })
export class TtsController {
  constructor(private service: TtsService) {}

  @Post("")
  @Use(validateBody(ttsRequestSchema))
  async synthesize(c: AppContext) {
    const dto = getBody<TtsRequestDTO>(c);
    const audioBuffer = await this.service.synthesize(dto.text);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  }
}
