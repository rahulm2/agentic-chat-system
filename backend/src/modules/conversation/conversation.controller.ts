import type { Context } from "hono";
import { Controller, Get, Delete } from "@asla/hono-decorator";
import type { ConversationService } from "./conversation.service.ts";
import { listConversationsSchema } from "./conversation.schema.ts";

@Controller({ basePath: "/api/conversations" })
export class ConversationController {
  constructor(private service: ConversationService) {}

  @Get("/")
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

  @Delete("/:id")
  async delete(c: Context) {
    const user = c.get("user" as never) as { sub: string };
    const id = c.req.param("id")!;
    await this.service.delete(id, user.sub);
    return c.json({ success: true });
  }
}
