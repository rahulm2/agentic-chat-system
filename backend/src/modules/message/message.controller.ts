import type { Context } from "hono";
import { Controller, Delete } from "@asla/hono-decorator";
import type { MessageService } from "./message.service.ts";

@Controller({ basePath: "/api/messages" })
export class MessageController {
  constructor(private service: MessageService) {}

  @Delete("/:id")
  async delete(c: Context) {
    const user = c.get("user" as never) as { sub: string };
    const id = c.req.param("id")!;
    await this.service.delete(id, user.sub);
    return c.json({ success: true });
  }
}
