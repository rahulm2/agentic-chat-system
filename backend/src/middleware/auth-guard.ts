import { verify } from "hono/jwt";
import type { MiddlewareHandler } from "hono";
import { AppError } from "@/common/errors.ts";
import type { AuthPayload, AppEnv } from "@/common/typed-context.ts";

export function authGuard(jwtSecret: string): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const header = c.req.header("Authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Missing or invalid token", "UNAUTHORIZED", 401);
    }

    const token = header.slice(7);
    try {
      const payload = await verify(token, jwtSecret, "HS256");
      c.set("user", payload as unknown as AuthPayload);
      await next();
    } catch {
      throw new AppError("Invalid or expired token", "UNAUTHORIZED", 401);
    }
  };
}
