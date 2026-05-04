import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";
import type { AppContext, AuthPayload } from "@/common/typed-context.ts";

/**
 * Middleware that validates the JSON request body against a Zod schema.
 * On failure returns 400 before the handler runs.
 * Use with @Use(validateBody(schema)) on controller methods.
 */
export const validateBody = <T extends ZodSchema>(schema: T) =>
  zValidator("json", schema);

/**
 * Middleware that validates query string params against a Zod schema.
 * On failure returns 400 before the handler runs.
 * Use with @Use(validateQuery(schema)) on controller methods.
 */
export const validateQuery = <T extends ZodSchema>(schema: T) =>
  zValidator("query", schema);

/**
 * Retrieve the validated + typed JSON body that was parsed by validateBody().
 * Must only be called in a handler that has @Use(validateBody(schema)).
 */
export function getBody<T>(c: AppContext): T {
  return (c.req as unknown as { valid(target: string): T }).valid("json");
}

/**
 * Retrieve the validated + typed query params parsed by validateQuery().
 * Must only be called in a handler that has @Use(validateQuery(schema)).
 */
export function getQuery<T>(c: AppContext): T {
  return (c.req as unknown as { valid(target: string): T }).valid("query");
}

/**
 * Retrieve the typed auth payload set by the auth guard.
 * Eliminates the repeated `c.get("user" as never) as { sub: string }` pattern.
 */
export function getUser(c: AppContext): AuthPayload {
  return c.get("user");
}
