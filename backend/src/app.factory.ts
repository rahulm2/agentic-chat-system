import { Hono } from "hono";
import { cors } from "hono/cors";
import { applyController } from "@asla/hono-decorator";
import { errorHandler } from "@/middleware/error-handler.ts";
import { notFound } from "@/middleware/not-found.ts";
import { requestLogger } from "@/middleware/request-logger.ts";
import { HealthController } from "@/modules/health/health.controller.ts";
import { createContainer } from "@/container.ts";

export function createApp(env: { DATABASE_URL: string; JWT_SECRET: string }) {
  const container = createContainer(env);
  const app = new Hono();

  // Global middleware
  app.use("*", cors());
  app.use("*", requestLogger);

  // Health (public)
  applyController(app, new HealthController());

  // Auth guard on protected routes
  app.use("/api/auth/me", container.guard);
  app.use("/api/conversations/*", container.guard);
  app.use("/api/conversations", container.guard);
  app.use("/api/messages/*", container.guard);

  // Controllers
  applyController(app, container.authController);
  applyController(app, container.conversationController);
  applyController(app, container.messageController);

  // Error handling
  app.onError(errorHandler);
  app.notFound(notFound);

  return { app, container };
}
