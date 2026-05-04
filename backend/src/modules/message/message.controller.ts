import { Controller, Delete } from "@asla/hono-decorator";
import type { AppContext } from "@/common/typed-context.ts";
import { getUser } from "@/middleware/validate.ts";
import type { MessageService } from "./message.service.ts";

@Controller({ basePath: "/api/messages" })
export class MessageController {
  constructor(private service: MessageService) {}

  @Delete("/:id")
  async delete(c: AppContext) {
    const user = getUser(c);
    const id = c.req.param("id")!;
    await this.service.delete(id, user.sub);
    return c.json({ success: true });
  }
}
