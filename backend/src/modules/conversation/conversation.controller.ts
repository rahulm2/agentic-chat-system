import { streamSSE } from "hono/streaming";
import { Controller, Get, Post, Delete, Use } from "@asla/hono-decorator";
import type { SSEWriter } from "@/common/types.ts";
import type { AppContext } from "@/common/typed-context.ts";
import { validateBody, validateQuery, getBody, getQuery, getUser } from "@/middleware/validate.ts";
import type { ConversationService } from "./conversation.service.ts";
import { listConversationsSchema, chatRequestSchema } from "./conversation.schema.ts";
import type { ListConversationsDTO, ChatRequestDTO } from "./conversation.schema.ts";

@Controller({ basePath: "/api/conversations" })
export class ConversationController {
  constructor(private service: ConversationService) {}

  @Get("")
  @Use(validateQuery(listConversationsSchema))
  async list(c: AppContext) {
    const user = getUser(c);
    const { limit, offset } = getQuery<ListConversationsDTO>(c);
    const result = await this.service.list(user.sub, limit, offset);
    return c.json(result);
  }

  @Get("/:id")
  async getById(c: AppContext) {
    const user = getUser(c);
    const id = c.req.param("id")!;
    const conversation = await this.service.getById(id, user.sub);
    return c.json(conversation);
  }

  @Post("/completions")
  @Use(validateBody(chatRequestSchema))
  async completions(c: AppContext) {
    const dto = getBody<ChatRequestDTO>(c);
    const user = getUser(c);

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

      await this.service.handleChat(user.sub, dto, writer);
    });
  }

  @Delete("/:id")
  async delete(c: AppContext) {
    const user = getUser(c);
    const id = c.req.param("id")!;
    await this.service.delete(id, user.sub);
    return c.json({ success: true });
  }
}
