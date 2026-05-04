import type { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { Controller, Get, Post, Delete } from "@asla/hono-decorator";
import type { SSEWriter } from "@/common/types.ts";
import type { ConversationService } from "./conversation.service.ts";
import { listConversationsSchema, chatRequestSchema } from "./conversation.schema.ts";

@Controller({ basePath: "/api/conversations" })
export class ConversationController {
  constructor(private service: ConversationService) {}

  @Get("")
  async list(c: Context) {
    const user = c.get("user" as never) as { sub: string };
    const { limit, offset } = listConversationsSchema.parse(c.req.query());
    const result = await this.service.list(user.sub, limit, offset);
    return c.json(result);
  }

  @Get("/:id")
  async getById(c: Context) {
    const user = c.get("user" as never) as { sub: string };
    const id = c.req.param("id")!;
    const conversation = await this.service.getById(id, user.sub);
    return c.json(conversation);
  }

  @Post("/completions")
  async completions(c: Context) {
    const body = await c.req.json();
    const request = chatRequestSchema.parse(body);
    const user = c.get("user" as never) as { sub: string };

    return streamSSE(c, async (stream) => {
      const writer: SSEWriter = {
        async writeSSE(event: string, data: unknown) {
          await stream.writeSSE({
            event,
            data: JSON.stringify(data),
          });
        },
        close() {
          stream.abort();
        },
      };

      await this.service.handleChat(user.sub, request, writer);
    });
  }

  @Delete("/:id")
  async delete(c: Context) {
    const user = c.get("user" as never) as { sub: string };
    const id = c.req.param("id")!;
    await this.service.delete(id, user.sub);
    return c.json({ success: true });
  }
}
