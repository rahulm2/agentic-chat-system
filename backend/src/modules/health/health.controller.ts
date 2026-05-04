import type { Context } from "hono";
import { Controller, Get } from "@asla/hono-decorator";

@Controller({ basePath: "" })
export class HealthController {
  @Get("/health")
  health(c: Context) {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }
}
