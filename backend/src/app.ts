import { Hono } from "hono";
import { cors } from "hono/cors";
import { applyController } from "@asla/hono-decorator";
import { errorHandler } from "@/middleware/error-handler.ts";
import { notFound } from "@/middleware/not-found.ts";
import { requestLogger } from "@/middleware/request-logger.ts";
import { HealthController } from "@/modules/health/health.controller.ts";

export const app = new Hono();

// Global middleware
app.use("*", cors());
app.use("*", requestLogger);

// Controllers
applyController(app, new HealthController());

// Error handling
app.onError(errorHandler);
app.notFound(notFound);
