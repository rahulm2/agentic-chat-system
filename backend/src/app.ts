import { Hono } from "hono";
import { cors } from "hono/cors";
import { applyController } from "@asla/hono-decorator";
import { errorHandler } from "@/middleware/error-handler.ts";
import { notFound } from "@/middleware/not-found.ts";
import { requestLogger } from "@/middleware/request-logger.ts";
import { HealthController } from "@/modules/health/health.controller.ts";
import { createContainer } from "@/container.ts";

const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
};

const hasDb = env.DATABASE_URL.length > 0 && env.JWT_SECRET.length > 0;

export const app = new Hono();

// Global middleware
app.use("*", cors());
app.use("*", requestLogger);

// Controllers
applyController(app, new HealthController());

if (hasDb) {
  const container = createContainer(env);

  // Auth guard on protected routes (must be before controllers)
  app.use("/api/auth/me", container.guard);
  app.use("/api/conversations/*", container.guard);
  app.use("/api/conversations", container.guard);
  app.use("/api/messages/*", container.guard);
  app.use("/api/tts", container.guard);
  app.use("/api/tts/*", container.guard);

  // Controllers
  applyController(app, container.authController);
  applyController(app, container.conversationController);
  applyController(app, container.messageController);
  applyController(app, container.ttsController);
}

// Error handling
app.onError(errorHandler);
app.notFound(notFound);
